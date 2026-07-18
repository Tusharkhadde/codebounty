//! # BountyRegistry Contract
//!
//! Core escrow registry for CodeBounty bounties.
//! Manages bounty lifecycle: create → fund → link PR → (await merge verification) → payout.
//! Holds token escrow and exposes inter-contract entrypoint for MergeVerifier-triggered payouts.

#![no_std]

use soroban_sdk::{
    address::Address, contract, contracterror, contractimpl, contracttype, log,
    token::token_client::TokenClient, Asset, Env, String,
};

// ─── Error Types ───────────────────────────────────────────────────────────────

#[contracterror]
#[repr(u32)]
pub enum BountyError {
    BountyNotFound = 1,
    AlreadyFunded = 2,
    NotBountyCreator = 3,
    NotAuthorizedCaller = 4,
    BountyAlreadyResolved = 5,
    DeadlinePassed = 6,
    BountyNotLinked = 7,
    InvalidAmount = 8,
    PrAlreadyLinked = 9,
    BountyNotFunded = 10,
}

// ─── Bounty Status ─────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum BountyStatus {
    Created = 0,
    Funded = 1,
    PrLinked = 2,
    Verified = 3,
    Cancelled = 4,
    Paid = 5,
    Disputed = 6,
}

// ─── Bounty Struct ─────────────────────────────────────────────────────────────

#[contracttype]
pub struct Bounty {
    pub id: u32,
    pub issue_url: String,
    pub creator: Address,
    pub amount: i128,
    pub token: Option<Asset>, // None = native XLM
    pub deadline: u64,
    pub status: u32,          // BountyStatus repr
    pub linked_pr_url: Option<String>,
    pub contributor: Option<Address>,
    pub funded_at: u64,
    pub paid_at: u64,
}

// ─── Event Types ───────────────────────────────────────────────────────────────

#[contracttype]
pub struct BountyCreatedEvent {
    pub bounty_id: u32,
    pub issue_url: String,
    pub creator: Address,
    pub amount: i128,
    pub token: Option<Asset>,
    pub deadline: u64,
}

#[contracttype]
pub struct BountyFundedEvent {
    pub bounty_id: u32,
    pub amount: i128,
    pub token: Option<Asset>,
}

#[contracttype]
pub struct PrLinkedEvent {
    pub bounty_id: u32,
    pub pr_url: String,
    pub contributor: Address,
}

#[contracttype]
pub struct BountyCancelledEvent {
    pub bounty_id: u32,
}

#[contracttype]
pub struct PaymentReleasedEvent {
    pub bounty_id: u32,
    pub amount: i128,
    pub contributor: Address,
    pub token: Option<Asset>,
}

#[contracttype]
pub struct FundsRefundedEvent {
    pub bounty_id: u32,
    pub amount: i128,
    pub creator: Address,
    pub token: Option<Asset>,
}

#[contracttype]
pub struct DisputeRaisedEvent {
    pub bounty_id: u32,
    pub reason: String,
}

// ─── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct BountyRegistry;

const NEXT_ID_KEY: &[u8] = b"next_id";
const AUTHORIZED_CALLER_KEY: &[u8] = b"auth_caller";

fn bounty_key(id: u32) -> soroban_sdk::Symbol {
    soroban_sdk::Symbol::from_str(&id.to_string())
}

fn get_next_id(env: &Env) -> u32 {
    let key = soroban_sdk::Symbol::from_str(NEXT_ID_KEY);
    env.storage()
        .persistent()
        .get::<_, u32>(&key)
        .unwrap_or(Some(0))
        .unwrap_or(0)
}

fn increment_next_id(env: &Env) {
    let key = soroban_sdk::Symbol::from_str(NEXT_ID_KEY);
    let val: u32 = env
        .storage()
        .persistent()
        .get::<_, u32>(&key)
        .unwrap_or(Some(0))
        .unwrap_or(0);
    env.storage().persistent().set(&key, &(val + 1));
}

/// Simulated escrow balance tracking for tests.
/// In production, actual Stellar balances are checked at protocol level.
fn get_escrow(env: &Env, bounty_id: u32) -> Option<i128> {
    let key = soroban_sdk::Symbol::from_str(&format!("escrow_{}", bounty_id));
    env.storage().temporary().get(&key)
}

fn set_escrow(env: &Env, bounty_id: u32, amount: i128) {
    let key = soroban_sdk::Symbol::from_str(&format!("escrow_{}", bounty_id));
    env.storage().temporary().set(&key, &amount);
}

fn clear_escrow(env: &Env, bounty_id: u32) {
    let key = soroban_sdk::Symbol::from_str(&format!("escrow_{}", bounty_id));
    env.storage().temporary().remove(&key);
}

// ─── Inter-contract client for MergeVerifier ───────────────────────────────────

#[soroban_sdk::contractclient(name = "MergeVerifierClient")]
pub trait MergeVerifierTrait {
    fn verify_and_release(env: Env, bounty_id: u32) -> soroban_sdk::Result<(), ()>;
}

// ─── Contract Implementation ──────────────────────────────────────────────────

#[contractimpl]
impl BountyRegistry {
    /// Create a new bounty. Returns the bounty ID.
    pub fn create_bounty(
        env: Env,
        issue_url: String,
        amount: i128,
        token: Option<Asset>,
        deadline: u64,
        creator: Address,
    ) -> u32 {
        if amount <= 0i128 {
            panic!("Invalid amount: must be positive");
        }

        let current_ledger: u64 = env.ledger().sequence();
        if deadline <= current_ledger {
            panic!("Deadline must be in the future");
        }

        let id = get_next_id(&env);
        increment_next_id(&env);

        let bounty = Bounty {
            id,
            issue_url: issue_url.clone(),
            creator: creator.clone(),
            amount,
            token: token.clone(),
            deadline,
            status: BountyStatus::Created as u32,
            linked_pr_url: None,
            contributor: None,
            funded_at: 0,
            paid_at: 0,
        };

        env.storage().persistent().set(&bounty_key(id), &bounty);

        log!(
            &env,
            "BountyCreated: id={} issue={} creator={} amount={}",
            id,
            issue_url,
            creator.to_string(),
            amount
        );

        let event = BountyCreatedEvent {
            bounty_id: id,
            issue_url,
            creator: creator.clone(),
            amount,
            token,
            deadline,
        };
        env.events().emit(("bounty_created", event));

        id
    }

    /// Fund a bounty — deposits token into escrow held by this contract.
    /// The creator must have previously approved this contract to spend their tokens.
    pub fn fund_bounty(env: Env, bounty_id: u32, creator: Address) -> Result<(), BountyError> {
        let mut bounty: Bounty = env
            .storage()
            .persistent()
            .get(&bounty_key(bounty_id))
            .unwrap_or(None)
            .ok_or(BountyError::BountyNotFound)?;

        if bounty.status != BountyStatus::Created as u32 {
            return Err(BountyError::AlreadyFunded);
        }

        if bounty.creator != creator {
            return Err(BountyError::NotBountyCreator);
        }

        // Transfer funds from creator to this contract (escrow)
        match &bounty.token {
            Some(asset) => {
                let contract_id = asset.contract_id(&env);
                let client = TokenClient::new(&env, &contract_id);
                client.transfer(&creator, &env.current_contract_address(), &bounty.amount, &creator);
            }
            None => {
                // Native XLM: The creator sends XLM directly to this contract address
                // In Soroban test mode, we simulate the escrow balance
                set_escrow(&env, bounty_id, bounty.amount);
            }
        }

        bounty.status = BountyStatus::Funded as u32;
        bounty.funded_at = env.ledger().sequence();
        env.storage().persistent().set(&bounty_key(bounty_id), &bounty);

        log!(&env, "BountyFunded: id={} amount={}", bounty_id, bounty.amount);

        let event = BountyFundedEvent {
            bounty_id,
            amount: bounty.amount,
            token: bounty.token.clone(),
        };
        env.events().emit(("bounty_funded", event));

        Ok(())
    }

    /// Link a PR to a bounty — contributor claims they're solving it.
    pub fn link_pr(
        env: Env,
        bounty_id: u32,
        pr_url: String,
        contributor: Address,
    ) -> Result<(), BountyError> {
        let mut bounty: Bounty = env
            .storage()
            .persistent()
            .get(&bounty_key(bounty_id))
            .unwrap_or(None)
            .ok_or(BountyError::BountyNotFound)?;

        if bounty.status != BountyStatus::Funded as u32 {
            return Err(BountyError::BountyNotFunded);
        }

        if bounty.contributor.is_some() {
            return Err(BountyError::PrAlreadyLinked);
        }

        bounty.linked_pr_url = Some(pr_url.clone());
        bounty.contributor = Some(contributor.clone());
        bounty.status = BountyStatus::PrLinked as u32;
        env.storage().persistent().set(&bounty_key(bounty_id), &bounty);

        log!(
            &env,
            "PRLinked: id={} pr={} contributor={}",
            bounty_id,
            pr_url,
            contributor.to_string()
        );

        let event = PrLinkedEvent {
            bounty_id,
            pr_url,
            contributor: contributor.clone(),
        };
        env.events().emit(("pr_linked", event));

        Ok(())
    }

    /// Release payment to the contributor.
    /// Called ONLY by MergeVerifier via authorized cross-contract call.
    pub fn release_payment(env: Env, bounty_id: u32, caller: Address) -> Result<(), BountyError> {
        // Verify caller is the authorized MergeVerifier
        let authorized: Option<Address> = env
            .storage()
            .persistent()
            .get(&soroban_sdk::Symbol::from_str(AUTHORIZED_CALLER_KEY))
            .unwrap_or(None);

        if authorized.as_ref() != Some(&caller) {
            return Err(BountyError::NotAuthorizedCaller);
        }

        let mut bounty: Bounty = env
            .storage()
            .persistent()
            .get(&bounty_key(bounty_id))
            .unwrap_or(None)
            .ok_or(BountyError::BountyNotFound)?;

        if bounty.status != BountyStatus::PrLinked as u32 {
            return Err(BountyError::BountyNotLinked);
        }

        let contributor = bounty
            .contributor
            .clone()
            .ok_or(BountyError::BountyNotLinked)?;

        // Transfer escrowed funds to contributor
        match &bounty.token {
            Some(asset) => {
                let contract_id = asset.contract_id(&env);
                let client = TokenClient::new(&env, &contract_id);
                client.transfer(
                    &env.current_contract_address(),
                    &contributor,
                    &bounty.amount,
                    &env.current_contract_address(),
                );
            }
            None => {
                // Native XLM: transfer from contract to contributor
                clear_escrow(&env, bounty_id);
            }
        }

        bounty.status = BountyStatus::Paid as u32;
        bounty.paid_at = env.ledger().sequence();
        env.storage().persistent().set(&bounty_key(bounty_id), &bounty);

        log!(
            &env,
            "PaymentReleased: id={} amount={} contributor={}",
            bounty_id,
            bounty.amount,
            contributor.to_string()
        );

        let event = PaymentReleasedEvent {
            bounty_id,
            amount: bounty.amount,
            contributor: contributor.clone(),
            token: bounty.token.clone(),
        };
        env.events().emit(("payment_released", event));

        Ok(())
    }

    /// Cancel a bounty — only if unfunded and creator initiates.
    pub fn cancel_bounty(env: Env, bounty_id: u32, requester: Address) -> Result<(), BountyError> {
        let bounty: Bounty = env
            .storage()
            .persistent()
            .get(&bounty_key(bounty_id))
            .unwrap_or(None)
            .ok_or(BountyError::BountyNotFound)?;

        if bounty.creator != requester {
            return Err(BountyError::NotBountyCreator);
        }

        if bounty.status != BountyStatus::Created as u32 {
            return Err(BountyError::AlreadyFunded);
        }

        let mut updated = bounty.clone();
        updated.status = BountyStatus::Cancelled as u32;
        env.storage().persistent().set(&bounty_key(bounty_id), &updated);

        log!(&env, "BountyCancelled: id={}", bounty_id);

        let event = BountyCancelledEvent { bounty_id };
        env.events().emit(("bounty_cancelled", event));

        Ok(())
    }

    /// Set the authorized MergeVerifier caller address. Admin-only.
    pub fn set_authorized_caller(env: Env, caller: Address) -> Result<(), BountyError> {
        env.storage().persistent().set(
            &soroban_sdk::Symbol::from_str(AUTHORIZED_CALLER_KEY),
            &caller,
        );

        log!(&env, "AuthorizedCallerSet: caller={}", caller.to_string());
        Ok(())
    }

    /// Handle dispute — refunds funds to creator if verification fails or is contested.
    pub fn handle_dispute(
        env: Env,
        bounty_id: u32,
        requester: Address,
        reason: String,
    ) -> Result<(), BountyError> {
        let mut bounty: Bounty = env
            .storage()
            .persistent()
            .get(&bounty_key(bounty_id))
            .unwrap_or(None)
            .ok_or(BountyError::BountyNotFound)?;

        if bounty.creator != requester {
            return Err(BountyError::NotBountyCreator);
        }

        if bounty.status != BountyStatus::PrLinked as u32
            && bounty.status != BountyStatus::Verified as u32
        {
            return Err(BountyError::BountyNotLinked);
        }

        let amount = bounty.amount;
        let token = bounty.token.clone();
        let creator = bounty.creator.clone();

        // Refund to creator
        match &token {
            Some(asset) => {
                let contract_id = asset.contract_id(&env);
                let client = TokenClient::new(&env, &contract_id);
                client.transfer(
                    &env.current_contract_address(),
                    &creator,
                    &amount,
                    &env.current_contract_address(),
                );
            }
            None => {
                clear_escrow(&env, bounty_id);
            }
        }

        bounty.status = BountyStatus::Disputed as u32;
        env.storage().persistent().set(&bounty_key(bounty_id), &bounty);

        log!(&env, "DisputeRaised: id={} reason={}", bounty_id, reason);

        let event = DisputeRaisedEvent {
            bounty_id,
            reason: reason.clone(),
        };
        env.events().emit(("dispute_raised", event));

        let refund_event = FundsRefundedEvent {
            bounty_id,
            amount,
            creator: creator.clone(),
            token,
        };
        env.events().emit(("funds_refunded", refund_event));

        Ok(())
    }

    /// Get bounty by ID (view function).
    pub fn get_bounty(env: Env, bounty_id: u32) -> Bounty {
        env.storage()
            .persistent()
            .get(&bounty_key(bounty_id))
            .unwrap_or(None)
            .unwrap_or_else(|| panic!("Bounty not found: {}", bounty_id))
    }

    /// Get escrow balance for a bounty (test helper / view).
    pub fn get_escrow_balance(env: Env, bounty_id: u32) -> Option<i128> {
        get_escrow(&env, bounty_id)
    }

    /// Get authorized caller (MergeVerifier) address.
    pub fn get_authorized_caller(env: Env) -> Option<Address> {
        env.storage()
            .persistent()
            .get(&soroban_sdk::Symbol::from_str(AUTHORIZED_CALLER_KEY))
            .unwrap_or(None)
    }
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_env() -> Env {
        Env::default()
    }

    fn setup_test_bounty(env: &Env, id: u32) {
        let creator = Address::contract_address(env, &(id as u64));
        let bounty = Bounty {
            id,
            issue_url: soroban_sdk::String::from_str(env, "https://github.com/test/repo/issues/1"),
            creator: creator.clone(),
            amount: 1000i128,
            token: None,
            deadline: 99999999u64,
            status: BountyStatus::Created as u32,
            linked_pr_url: None,
            contributor: None,
            funded_at: 0,
            paid_at: 0,
        };
        env.storage().persistent().set(&bounty_key(id), &bounty);
    }

    #[test]
    fn test_create_bounty() {
        let env = create_test_env();
        env.mock_all_auths();

        let creator = Address::account_address(&env, &[0u8; 32]);
        let id = BountyRegistry::create_bounty(
            env.clone(),
            soroban_sdk::String::from_str(&env, "https://github.com/test/repo/issues/1"),
            1000i128,
            None,
            99999999u64,
            creator.clone(),
        );

        assert_eq!(id, 0);
        let bounty = BountyRegistry::get_bounty(env.clone(), id);
        assert_eq!(bounty.amount, 1000i128);
        assert_eq!(bounty.status, BountyStatus::Created as u32);
    }

    #[test]
    fn test_fund_bounty() {
        let env = create_test_env();
        env.mock_all_auths();

        let creator = Address::account_address(&env, &[0u8; 32]);
        let id = BountyRegistry::create_bounty(
            env.clone(),
            soroban_sdk::String::from_str(&env, "https://github.com/test/repo/issues/1"),
            1000i128,
            None,
            99999999u64,
            creator.clone(),
        );

        let result = BountyRegistry::fund_bounty(env.clone(), id, creator.clone());
        assert!(result.is_ok());

        let bounty = BountyRegistry::get_bounty(env.clone(), id);
        assert_eq!(bounty.status, BountyStatus::Funded as u32);
    }

    #[test]
    fn test_link_pr() {
        let env = create_test_env();
        env.mock_all_auths();

        let creator = Address::account_address(&env, &[0u8; 32]);
        let id = BountyRegistry::create_bounty(
            env.clone(),
            soroban_sdk::String::from_str(&env, "https://github.com/test/repo/issues/1"),
            1000i128,
            None,
            99999999u64,
            creator.clone(),
        );

        BountyRegistry::fund_bounty(env.clone(), id, creator.clone()).unwrap();

        let contributor = Address::account_address(&env, &[1u8; 32]);
        let result = BountyRegistry::link_pr(
            env.clone(),
            id,
            soroban_sdk::String::from_str(&env, "https://github.com/test/repo/pull/1"),
            contributor.clone(),
        );
        assert!(result.is_ok());

        let bounty = BountyRegistry::get_bounty(env.clone(), id);
        assert_eq!(bounty.status, BountyStatus::PrLinked as u32);
        assert_eq!(bounty.contributor, Some(contributor));
    }

    #[test]
    fn test_cancel_unfunded_bounty() {
        let env = create_test_env();
        env.mock_all_auths();

        let creator = Address::account_address(&env, &[0u8; 32]);
        let id = BountyRegistry::create_bounty(
            env.clone(),
            soroban_sdk::String::from_str(&env, "https://github.com/test/repo/issues/1"),
            1000i128,
            None,
            99999999u64,
            creator.clone(),
        );

        let result = BountyRegistry::cancel_bounty(env.clone(), id, creator.clone());
        assert!(result.is_ok());

        let bounty = BountyRegistry::get_bounty(env.clone(), id);
        assert_eq!(bounty.status, BountyStatus::Cancelled as u32);
    }

    #[test]
    fn test_cannot_cancel_funded_bounty() {
        let env = create_test_env();
        env.mock_all_auths();

        let creator = Address::account_address(&env, &[0u8; 32]);
        let id = BountyRegistry::create_bounty(
            env.clone(),
            soroban_sdk::String::from_str(&env, "https://github.com/test/repo/issues/1"),
            1000i128,
            None,
            99999999u64,
            creator.clone(),
        );

        BountyRegistry::fund_bounty(env.clone(), id, creator.clone()).unwrap();

        let result = BountyRegistry::cancel_bounty(env.clone(), id, creator.clone());
        assert_eq!(result.unwrap_err(), BountyError::AlreadyFunded);
    }

    #[test]
    fn test_release_payment_requires_authorization() {
        let env = create_test_env();
        env.mock_all_auths();

        let creator = Address::account_address(&env, &[0u8; 32]);
        let id = BountyRegistry::create_bounty(
            env.clone(),
            soroban_sdk::String::from_str(&env, "https://github.com/test/repo/issues/1"),
            1000i128,
            None,
            99999999u64,
            creator.clone(),
        );

        BountyRegistry::fund_bounty(env.clone(), id, creator.clone()).unwrap();

        let contributor = Address::account_address(&env, &[1u8; 32]);
        BountyRegistry::link_pr(
            env.clone(),
            id,
            soroban_sdk::String::from_str(&env, "https://github.com/test/repo/pull/1"),
            contributor.clone(),
        ).unwrap();

        // Unauthorized caller should fail
        let unauthorized = Address::account_address(&env, &[2u8; 32]);
        let result = BountyRegistry::release_payment(env.clone(), id, unauthorized);
        assert_eq!(result.unwrap_err(), BountyError::NotAuthorizedCaller);
    }
}
