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
    Address, Bytes, BytesN, Env, Symbol, String, contract, contracterror,
    contractimpl, contracttype, log,
};

// ─── Error Types ───────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Debug, PartialEq, Eq)]
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
    pub signature: Bytes,
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

const RELAY_PUB_KEY: &str = "relay_pub_key";
const REGISTRY_ADDR: &str = "registry_addr";
const ADMIN_ADDR: &str = "admin_addr";

/// Hash a merge proof for signature verification.
/// Format: bounty_id_bytes || ':' || pr_url || ':' || merge_commit_sha
fn proof_hash(env: &Env, bounty_id: u32, pr_url: &str, merge_commit_sha: &str) -> [u8; 32] {
    let mut msg = Bytes::new(env);

    // Append bounty_id as 8-byte LE
    let id_bytes = bounty_id.to_le_bytes();
    msg.extend_from_slice(&id_bytes);

    // Separator
    msg.extend_from_slice(b":");

    // Append pr_url bytes
    msg.extend_from_slice(pr_url.as_bytes());

    // Separator
    msg.extend_from_slice(b":");

    // Append merge_commit_sha bytes
    msg.extend_from_slice(merge_commit_sha.as_bytes());

    // Hash the message with SHA-256
    env.crypto().sha256(&msg).to_array()
}

/// Copy a soroban String's UTF-8 bytes into a fixed buffer and return a &str.
/// Panics if the string exceeds `MAX_STR_BUF` bytes.
fn string_as_str<'a, const N: usize>(s: &String, buf: &'a mut [u8; N]) -> &'a str {
    let len = s.len() as usize;
    if len > N {
        panic!("string too long for buffer");
    }
    s.copy_into_slice(&mut buf[..len]);
    core::str::from_utf8(&buf[..len]).unwrap()
}

/// Check if a proof has already been submitted (replay protection).
fn proof_exists(env: &Env, bounty_id: u32, pr_url: &String, merge_commit_sha: &String) -> bool {
    let key = (Symbol::new(&env, "proof"), bounty_id, pr_url.clone(), merge_commit_sha.clone());
    env.storage().persistent().get::<_, bool>(&key).is_some()
}

/// Store a proof as submitted.
fn store_proof(env: &Env, bounty_id: u32, pr_url: &String, merge_commit_sha: &String) {
    let key = (Symbol::new(&env, "proof"), bounty_id, pr_url.clone(), merge_commit_sha.clone());
    env.storage().persistent().set(&key, &true);
}

/// Get the registry contract address from storage.
fn get_registry_addr(env: &Env) -> Address {
    env.storage()
        .persistent()
        .get(&Symbol::new(env, REGISTRY_ADDR))
        .unwrap_or_else(|| panic!("Registry address not configured"))
}

/// Get the relay public key from storage.
fn get_relay_pub_key(env: &Env) -> Bytes {
    env.storage()
        .persistent()
        .get(&Symbol::new(env, RELAY_PUB_KEY))
        .unwrap_or_else(|| panic!("Relay public key not configured"))
}

/// Inter-contract call to BountyRegistry.release_payment.
fn call_release_payment(env: &Env, registry_addr: &Address, bounty_id: u32, verifier_addr: &Address) {
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
        signature: Bytes,
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

        // Convert inputs to &str for hashing/verification
        let mut url_buf = [0u8; 1024];
        let mut sha_buf = [0u8; 256];
        let pr_url_str = string_as_str(&pr_url, &mut url_buf);
        let sha_str = string_as_str(&merge_commit_sha, &mut sha_buf);

        // Compute the hash of the proof data
        let hash = proof_hash(&env, bounty_id, pr_url_str, sha_str);

        // Verify the Ed25519 signature over the hash
        let pub_key = BytesN::from_array(&env, &<[u8; 32]>::try_from(relay_pub_key).unwrap());
        let hash_bytes = Bytes::from_array(&env, &hash);
        let sig = BytesN::from_array(&env, &<[u8; 64]>::try_from(signature).unwrap());

        env.crypto().ed25519_verify(&pub_key, &hash_bytes, &sig);
        log!(&env, "SignatureValid: bounty={}", bounty_id);

        // Get registry address and call release_payment (inter-contract call)
        let registry_addr = get_registry_addr(&env);
        let verifier_addr = env.current_contract_address();

        // This triggers the payout to the contributor via inter-contract call
        call_release_payment(&env, &registry_addr, bounty_id, &verifier_addr);

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
        env.events().publish(("merge_verified",), event);

        Ok(())
    }

    /// Set the trusted relay Ed25519 public key.
    pub fn set_relay_public_key(env: Env, relay_pub_key: Bytes) {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, ADMIN_ADDR))
            .unwrap_or_else(|| panic!("Contract not initialized"));

        admin.require_auth();
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, RELAY_PUB_KEY), &relay_pub_key);

        log!(&env, "RelayKeySet: key_len={}", relay_pub_key.len());
    }

    /// Set the BountyRegistry contract address.
    pub fn set_registry_address(env: Env, registry_addr: Address) {
        let admin: Address = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, ADMIN_ADDR))
            .unwrap_or_else(|| panic!("Contract not initialized"));
        admin.require_auth();
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, REGISTRY_ADDR), &registry_addr);

        log!(&env, "RegistrySet: addr={}", registry_addr.to_string());
    }

    /// Initialize the contract with admin address.
    pub fn initialize(env: Env, admin: Address, registry_addr: Address, relay_pub_key: Bytes) {
        // Prevent re-initialization
        let existing: Option<Address> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, ADMIN_ADDR))
            .unwrap_or(None);

        if existing.is_some() {
            panic!("Already initialized");
        }

        env.storage()
            .persistent()
            .set(&Symbol::new(&env, ADMIN_ADDR), &admin);
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, REGISTRY_ADDR), &registry_addr);
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, RELAY_PUB_KEY), &relay_pub_key);

        log!(
            &env,
            "Initialized: admin={} registry={}",
            admin.to_string(),
            registry_addr.to_string()
        );
    }

    /// Get the stored relay public key.
    pub fn get_relay_public_key(env: Env) -> Bytes {
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

    fn string_as_str_test(env: &Env, s: &str) -> String {
        String::from_str(env, s)
    }

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

        let _ = string_as_str_test(&env, "x");
    }
}
