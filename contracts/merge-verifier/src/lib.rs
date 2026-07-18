//! # MergeVerifier Contract
//!
//! Verifies off-chain relay attestations that a PR has been merged.
//! The relay (off-chain oracle) listens to GitHub webhooks, verifies the merge,
//! signs an attestation, and submits it here.
//!
//! On successful verification, calls BountyRegistry.release_payment() —
//! this is the required inter-contract call.

#![no_std]

use soroban_sdk::{
    address::Address, contract, contracterror, contractimpl, contracttype, log,
    crypto, Env, String, Vec,
};

// ─── Error Types ───────────────────────────────────────────────────────────────

#[contracterror]
#[repr(u32)]
pub enum VerifierError {
    InvalidSignature = 1,
    BountyNotFound = 2,
    BountyNotLinked = 3,
    ProofAlreadySubmitted = 4,
    BountyNotPrLinked = 5,
    UnauthorizedAdmin = 6,
}

// ─── Merge Proof Struct ──────────────────────────────────────────────────────

#[contracttype]
pub struct MergeProof {
    pub bounty_id: u32,
    pub pr_url: String,
    pub merge_commit_sha: String,
    pub signature: Vec<u8>,
    pub submitted_at: u64,
}

// ─── Events ────────────────────────────────────────────────────────────────────

#[contracttype]
pub struct MergeVerifiedEvent {
    pub bounty_id: u32,
    pub pr_url: String,
    pub merge_commit_sha: String,
    pub contributor: Address,
}

#[contracttype]
pub struct VerificationFailedEvent {
    pub bounty_id: u32,
    pub reason: String,
}

#[contracttype]
pub struct RelayKeyUpdatedEvent {
    pub old_relay: Option<Address>,
    pub new_relay: Address,
}

// ─── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct MergeVerifier;

const RELAY_PUB_KEY: &[u8] = b"relay_pub_key";
const REGISTRY_ADDR: &[u8] = b"registry_addr";
const ADMIN_ADDR: &[u8] = b"admin_addr";

/// Hash a merge proof for signature verification.
/// Format: bounty_id_bytes || ':' || pr_url || ':' || merge_commit_sha
fn proof_hash(env: &Env, bounty_id: u32, pr_url: &str, merge_commit_sha: &str) -> [u8; 32] {
    let mut msg = Vec::new(env);
    
    // Append bounty_id as 8-byte LE
    let id_bytes = bounty_id.to_le_bytes();
    for &b in &id_bytes {
        msg.push_back(b);
    }
    
    // Separator
    msg.push_back(b':');
    
    // Append pr_url bytes
    for b in pr_url.bytes() {
        msg.push_back(b);
    }
    
    // Separator
    msg.push_back(b':');
    
    // Append merge_commit_sha bytes
    for b in merge_commit_sha.bytes() {
        msg.push_back(b);
    }
    
    // Hash the message with SHA-256
    crypto::sha256(&msg)
}

/// Check if a proof has already been submitted (replay protection).
fn proof_exists(env: &Env, bounty_id: u32, pr_url: &String, merge_commit_sha: &String) -> bool {
    let key = (soroban_sdk::Symbol::from_str("proof"), bounty_id, pr_url.clone(), merge_commit_sha.clone());
    env.storage().persistent().get(&key).is_some()
}

/// Store a proof as submitted.
fn store_proof(env: &Env, bounty_id: u32, pr_url: &String, merge_commit_sha: &String) {
    let key = (soroban_sdk::Symbol::from_str("proof"), bounty_id, pr_url.clone(), merge_commit_sha.clone());
    env.storage().persistent().set(&key, &true);
}

/// Get the registry contract address from storage.
fn get_registry_addr(env: &Env) -> Address {
    env.storage()
        .persistent()
        .get(&soroban_sdk::Symbol::from_str(REGISTRY_ADDR))
        .unwrap_or_else(|| panic!("Registry address not configured"))
}

/// Get the relay public key from storage.
fn get_relay_pub_key(env: &Env) -> Vec<u8> {
    env.storage()
        .persistent()
        .get(&soroban_sdk::Symbol::from_str(RELAY_PUB_KEY))
        .unwrap_or_else(|| panic!("Relay public key not configured"))
}

/// Inter-contract call to BountyRegistry.release_payment.
/// We construct the call manually using the contract client pattern.
fn call_release_payment(env: &Env, registry_addr: &Address, bounty_id: u32, verifier_addr: &Address) {
    // Use the generated client from the trait
    // The RegistryClient trait provides typed access to BountyRegistry methods
    let client = RegistryClient::new(env, registry_addr);
    client.release_payment(&bounty_id, &verifier_addr);
}

// ─── Trait for inter-contract calls to BountyRegistry ─────────────────────────

#[soroban_sdk::contractclient(name = "RegistryClient")]
pub trait RegistryTrait {
    fn release_payment(env: Env, bounty_id: u32, caller: Address);
}

// ─── Contract Implementation ──────────────────────────────────────────────────

#[contractimpl]
impl MergeVerifier {
    /// Submit a merge proof signed by the trusted relay.
    /// The relay signs (bounty_id, pr_url, merge_commit_sha) and this contract
    /// verifies the signature against the stored relay public key.
    pub fn submit_merge_proof(
        env: Env,
        bounty_id: u32,
        pr_url: String,
        merge_commit_sha: String,
        signature: Vec<u8>,
    ) -> Result<(), VerifierError> {
        // Retrieve the stored relay public key
        let relay_pub_key = get_relay_pub_key(&env);

        // Check for duplicate proof submission (replay protection)
        if proof_exists(&env, bounty_id, &pr_url, &merge_commit_sha) {
            log!(
                &env,
                "ProofAlreadySubmitted: bounty={}",
                bounty_id,
            );
            return Err(VerifierError::ProofAlreadySubmitted);
        }

        // Compute the hash of the proof data
        let hash = proof_hash(&env, bounty_id, &pr_url, &merge_commit_sha);

        // Verify the Ed25519 signature
        let hash_vec: Vec<u8> = hash.to_vec().into();
        match crypto::ed25519_verify(&relay_pub_key, &hash_vec, &signature) {
            Ok(()) => {
                log!(&env, "SignatureValid: bounty={}", bounty_id);
            }
            Err(_) => {
                log!(&env, "VerificationFailed: invalid signature for bounty {}", bounty_id);
                
                let event = VerificationFailedEvent {
                    bounty_id,
                    reason: soroban_sdk::String::from_str(&env, "invalid_signature"),
                };
                env.events().emit(("verification_failed",), event);
                
                return Err(VerifierError::InvalidSignature);
            }
        }

        // Get registry address and call release_payment (inter-contract call)
        let registry_addr = get_registry_addr(&env);
        let verifier_addr = env.current_contract_address();
        
        // This triggers the payout to the contributor via inter-contract call
        call_release_payment(&env, &registry_addr, &bounty_id, &verifier_addr);

        // Mark proof as submitted (replay protection)
        store_proof(&env, bounty_id, &pr_url, &merge_commit_sha);

        log!(
            &env,
            "MergeVerified: bounty={} pr={} sha={}",
            bounty_id,
            pr_url,
            merge_commit_sha
        );

        // Parse contributor address from the bounty (called via registry)
        // For now, emit the event with the info we have
        let event = MergeVerifiedEvent {
            bounty_id,
            pr_url: pr_url.clone(),
            merge_commit_sha,
            contributor: verifier_addr,
        };
        env.events().emit(("merge_verified",), event);

        Ok(())
    }

    /// Set the trusted relay Ed25519 public key.
    pub fn set_relay_public_key(env: Env, relay_pub_key: Vec<u8>) {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&soroban_sdk::Symbol::from_str(ADMIN_ADDR))
            .unwrap_or_else(|| panic!("Contract not initialized"));

        admin.require_auth();
        env.storage().persistent().set(
            &soroban_sdk::Symbol::from_str(RELAY_PUB_KEY),
            &relay_pub_key,
        );

        log!(&env, "RelayKeySet: key_len={}", relay_pub_key.len());
    }

    /// Set the BountyRegistry contract address.
    pub fn set_registry_address(env: Env, registry_addr: Address) {
        let admin: Address = env.storage().persistent().get(&soroban_sdk::Symbol::from_str(ADMIN_ADDR)).unwrap_or_else(|| panic!("Contract not initialized"));
        admin.require_auth();
        env.storage().persistent().set(
            &soroban_sdk::Symbol::from_str(REGISTRY_ADDR),
            &registry_addr,
        );

        log!(&env, "RegistrySet: addr={}", registry_addr.to_string());
    }

    /// Initialize the contract with admin address.
    pub fn initialize(env: Env, admin: Address, registry_addr: Address, relay_pub_key: Vec<u8>) {
        // Prevent re-initialization
        let existing: Option<Address> = env
            .storage()
            .persistent()
            .get(&soroban_sdk::Symbol::from_str(ADMIN_ADDR))
            .unwrap_or(None);
        
        if existing.is_some() {
            panic!("Already initialized");
        }

        env.storage().persistent().set(
            &soroban_sdk::Symbol::from_str(ADMIN_ADDR),
            &admin,
        );
        env.storage().persistent().set(
            &soroban_sdk::Symbol::from_str(REGISTRY_ADDR),
            &registry_addr,
        );
        env.storage().persistent().set(
            &soroban_sdk::Symbol::from_str(RELAY_PUB_KEY),
            &relay_pub_key,
        );

        log!(&env, "Initialized: admin={} registry={}", 
             admin.to_string(), registry_addr.to_string());
    }

    /// Get the stored relay public key.
    pub fn get_relay_public_key(env: Env) -> Vec<u8> {
        get_relay_pub_key(&env)
    }

    /// Get the BountyRegistry address.
    pub fn get_registry_address(env: Env) -> Address {
        get_registry_addr(&env)
    }
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_proof_hash_deterministic() {
        let env = Env::default();
        env.mock_all_auths();
        
        let hash1 = proof_hash(&env, 1, "https://github.com/test/repo/pull/42", "abc123");
        let hash2 = proof_hash(&env, 1, "https://github.com/test/repo/pull/42", "abc123");
        
        assert_eq!(hash1, hash2);
    }

    #[test]
    fn test_proof_hash_different_inputs() {
        let env = Env::default();
        env.mock_all_auths();
        
        let hash1 = proof_hash(&env, 1, "https://github.com/test/repo/pull/42", "abc123");
        let hash2 = proof_hash(&env, 2, "https://github.com/test/repo/pull/42", "abc123");
        
        assert_ne!(hash1, hash2);
    }
}
