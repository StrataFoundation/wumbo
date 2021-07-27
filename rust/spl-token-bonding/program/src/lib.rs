//! A solclout program for the Solana blockchain.

// Export current sdk types for downstream users building with a different sdk version
pub use solana_program;

pub mod entrypoint;
pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;
pub mod utils;
pub mod ln;
pub mod precise_number;
pub mod uint;

solana_program::declare_id!("4K8fnycnTESeyad4DqfXPF8TbkuyscPK4EjAwY35emyW");
