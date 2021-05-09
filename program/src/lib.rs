//! A solclout program for the Solana blockchain.

// Export current sdk types for downstream users building with a different sdk version
pub use solana_program;

pub mod entrypoint;
pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;
pub mod utils;
solana_program::declare_id!("metaTA73sFPqA8whreUbBsbn3SLJH2vhrW9fP5dmfdC");
