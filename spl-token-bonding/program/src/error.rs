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
pub enum TokenBondingError {
    /// Invalid instruction data passed in.
    #[error("Failed to unpack instruction data")]
    InstructionUnpackError,

    #[error("Invalid curve key")]
    InvalidCurveKey,

    #[error("Invalid owner")]
    InvalidOwner,
    
    #[error("Curve not initialized")]
    CurveNotInitialized,

    /// Lamport balance below rent-exempt threshold for creating mint.
    #[error("Lamport balance below rent-exempt threshold for creating token bonding")]
    NotRentExempt,

    #[error("Token program id mismatch between mints")]
    InvalidTokenProgramId,

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

    #[error("Missing a required signer")]
    MissingSigner,

    #[error("Authority must be a PDA owned by this program")]
    InvalidAuthority,

    #[error("Solclout storage must be owned by authority")]
    InvalidStorageOwner,

    #[error("Invalid token bonding account")]
    InvalidTokenBonding,

    #[error("Invalid mint authority")]
    InvalidMintAuthority,

    #[error("Invalid freeze authority")]
    InvalidFreezeAuthority,

    #[error("Base storage account must be keyed by ['base-storage-key', token_bonding.key] pda")]
    InvalidBaseStorageAccountKey,

    #[error("Founder rewards account did not match that on the creator")]
    InvalidFounderRewardsAccount,

    #[error("Invalid target mint")]
    InvalidTargetMint,

    #[error("Invalid base mint")]
    InvalidBaseMint,

    #[error("Invalid token bonding owner , must be owned by token bonding program")]
    InvalidTokenBondingOwner,

    #[error("The maximum amount of tokens set to be minted by the bonding curve has been reached")]
    MaxTokensMinted,

    #[error("The maximum price set in the transaction was exceeded")]
    MaxPriceExceeded,

    #[error("The minimum price set in the transaction was exceeded")]
    MinPriceExceeded,
}

impl PrintProgramError for TokenBondingError {
    fn print<E>(&self) {
        msg!(&self.to_string());
    }
}

impl From<TokenBondingError> for ProgramError {
    fn from(e: TokenBondingError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for TokenBondingError {
    fn type_of() -> &'static str {
        "Solclout Error"
    }
}
