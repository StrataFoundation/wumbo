use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::msg,
    solana_program::program_error::ProgramError,
    solana_program::program_pack::{Pack, Sealed},
    solana_program::pubkey::Pubkey,
};

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub enum Key {
    WumboInstanceV0,
    UnclaimedTokenRefV0,
    ClaimedTokenRefV0,
}

pub const WUMBO_PREFIX: &str = "wumbo";
pub const UNCLAIMED_REF_PREFIX: &str = "unclaimed-ref";
pub const CLAIMED_REF_PREFIX: &str = "claimed-ref";
pub const BONDING_AUTHORITY_PREFIX: &str = "bonding-authority";
pub const FOUNDER_REWARDS_AUTHORITY_PREFIX: &str = "founder-rewards";

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct WumboInstanceV0 {
    pub key: Key,
    /// Wumbo token mint pubkey that can be traded for creator tokens
    pub wumbo_mint: Pubkey,
    pub base_curve: Pubkey,
    pub name_program_id: Pubkey,
    pub initialized: bool
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct UnclaimedTokenRefV0 {
    pub key: Key,
    pub wumbo_instance: Pubkey,
    pub token_bonding: Pubkey,
    pub name: Pubkey,
    pub initialized: bool,
}
impl Sealed for UnclaimedTokenRefV0 {}

impl Pack for UnclaimedTokenRefV0 {
    const LEN: usize = 1 + 32 * 3 + 1 + 1;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mut p = src;
        UnclaimedTokenRefV0::deserialize(&mut p).map_err(|_| {
            msg!("Failed to deserialize name record");
            ProgramError::InvalidAccountData
        })
    }
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct ClaimedTokenRefV0 {
  pub key: Key,
  pub wumbo_instance: Pubkey,
  pub token_bonding: Pubkey,
  pub owner: Pubkey,
  pub initialized: bool,
}
impl Sealed for ClaimedTokenRefV0 {}

impl Pack for ClaimedTokenRefV0 {
  const LEN: usize = 1 + 32 * 3 + 1 + 1;

  fn pack_into_slice(&self, dst: &mut [u8]) {
      let mut slice = dst;
      self.serialize(&mut slice).unwrap()
  }

  fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
      let mut p = src;
      ClaimedTokenRefV0::deserialize(&mut p).map_err(|_| {
          msg!("Failed to deserialize claimed token record");
          ProgramError::InvalidAccountData
      })
  }
}

impl Sealed for WumboInstanceV0 {}

impl Pack for WumboInstanceV0 {
    const LEN: usize = 1 + 32 * 3 + 1;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mut p = src;
        WumboInstanceV0::deserialize(&mut p).map_err(|_| {
            msg!("Failed to deserialize name record");
            ProgramError::InvalidAccountData
        })
    }
}

