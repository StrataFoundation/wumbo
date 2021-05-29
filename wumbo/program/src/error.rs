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

/// Errors that may be returned by the Wumbo program.
#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum WumboError {
    /// Invalid instruction data passed in.
    #[error("Failed to unpack instruction data")]
    InstructionUnpackError,

    /// Lamport balance below rent-exempt threshold for creating mint.
    #[error("Lamport balance below rent-exempt threshold for creating mint")]
    MintNotRentExempt,

    #[error("Invalid curve, must be the base curve for now")]
    InvalidCurve,

    #[error("Name owner did not match the one specified")]
    NameOwnerMismatch,

    #[error("Token program id did not match expected for this wumbo instance")]
    InvalidTokenProgramId,

    #[error("Was not able to unpack an Account from the specified token account")]
    ExpectedAccount,

    #[error("Was not able to derive authority program address from id and nonce")]
    InvalidProgramAddress,

    /// Lamport balance below rent-exempt threshold for user. They could still withdraw
    /// the sols later on. Because the token is a pda from using this account as a nonce,
    /// it should be fine if this happens. They'll just need to recreate. Generally though,
    /// we don't want to be supporting users that go in and out of existence.
    #[error("Wumbo account should have enough lamports to be rent exempt")]
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

    #[error("The wumbo token program id did not match the token program id")]
    WumboTokenWrongTokenProgram,

    #[error("Missing a required signer")]
    MissingSigner,

    #[error("Authority must be a PDA owned by this program")]
    InvalidAuthority,

    #[error("Wumbo storage must be owned by authority")]
    InvalidStorageOwner,

    #[error("Invalid wumbo storage account, must be the account specified in the wumbo instance")]
    InvalidWumboStorage,

    #[error("Invalid mint authority")]
    InvalidMintAuthority,

    #[error("Invalid freeze authority")]
    InvalidFreezeAuthority,

    #[error("Founder rewards account must have the creator mint")]
    InvalidFounderRewardsAccountType,

    #[error("Founder rewards account did not match that on the creator")]
    InvalidFounderRewardsAccount,

    #[error("Provided wumbo instance is different than the creator")]
    WumboInstanceMismatch,

    #[error("Invalid creator mint")]
    InvalidCreatorMint,

    #[error("Invalid creator owner, must be owned by wumbo program")]
    InvalidCreatorOwner,

    #[error("Invalid Instance owner, must be owned by wumbo program")]
    InvalidWumboInstanceOwner,

    #[error("Founder rewards account must be owned by either this program or the name account owner")]
    InvalidFounderRewardsOwner
}

impl PrintProgramError for WumboError {
    fn print<E>(&self) {
        msg!(&self.to_string());
    }
}

impl From<WumboError> for ProgramError {
    fn from(e: WumboError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for WumboError {
    fn type_of() -> &'static str {
        "Wumbo Error"
    }
}
