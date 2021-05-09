//! Error types

use {
    num_derive::FromPrimitive,
    solana_program::{
        decode_error::DecodeError,
        msg,
        program_error::{PrintProgramError, ProgramError},
    },
    thiserror::Error,
};

/// Errors that may be returned by the Solclout program.
#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum SolcloutError {
    /// Invalid instruction data passed in.
    #[error("Failed to unpack instruction data")]
    InstructionUnpackError,

    /// Lamport balance below rent-exempt threshold for creating mint.
    #[error("Lamport balance below rent-exempt threshold for creating mint")]
    MintNotRentExempt,

    #[error("Token program id did not match that of account")]
    IncorrectTokenProgramId,

    #[error("Was not able to unpack an Account from the specified token account")]
    ExpectedAccount,

    #[error("Was not able to derive authority program address from id and nonce")]
    InvalidProgramAddress,

    /// Lamport balance below rent-exempt threshold for user. They could still withdraw
    /// the sols later on. Because the token is a pda from using this account as a nonce,
    /// it should be fine if this happens. They'll just need to recreate. Generally though,
    /// we don't want to be supporting users that go in and out of existence.
    #[error("Solclout account should have enough lamports to be rent exempt")]
    UserNotRentExempt,

    /// Already initialized
    #[error("Already initialized account")]
    AlreadyInitialized,

    /// Uninitialized
    #[error("Uninitialized")]
    Uninitialized,

    /// Not authorized. This can happen when you attempt to let someone claim an unknown account
    /// you yourself didn't create, or if you try to claim founder rewards
    /// for an account that is not yours.
    #[error("Not authorized to do this action")]
    NotAuthorized,

    /// There's a mismatch between the token pubkey and the account's token
    #[error("The account is not associated with the correct token to buy or sell this creator coin")]
    AccountWrongToken,

    #[error("The account is not associated with the correct token program")]
    AccountWrongTokenProgram,

    #[error("The solclout token program id did not match the token program id")]
    SolcloutTokenWrongTokenProgram,

    #[error("Missing a required signer")]
    MissingSigner,

    #[error("Authority must be a PDA owned by this program")]
    InvalidAuthority,

    #[error("Solclout storage must be owned by authority")]
    InvalidStorageOwner,

    #[error("Invalid mint authority")]
    InvalidMintAuthority,

    #[error("Invalid freeze authority")]
    InvalidFreezeAuthority,

    #[error("Founder rewards account must have the creator mint")]
    InvalidFounderRewardsAccountType,

    #[error("Provided solclout instance is different than the creator")]
    SolcloutInstanceMismatch,

    #[error("Invalid creator mint")]
    InvalidCreatorMint,

    #[error("Invalid creator owner, must be owned by solclout program")]
    InvalidCreatorOwner,

    #[error("Invalid Instance owner, must be owned by solclout program")]
    InvalidSolcloutInstanceOwner,

    #[error("Founder rewards account must be owned by either this program or the name account owner")]
    InvalidFounderRewardsOwner
}

impl PrintProgramError for SolcloutError {
    fn print<E>(&self) {
        msg!(&self.to_string());
    }
}

impl From<SolcloutError> for ProgramError {
    fn from(e: SolcloutError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for SolcloutError {
    fn type_of() -> &'static str {
        "Solclout Error"
    }
}
