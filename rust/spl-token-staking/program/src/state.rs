use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::msg,
    solana_program::program_error::ProgramError,
    solana_program::program_pack::{Pack, Sealed},
    solana_program::pubkey::Pubkey,
};


pub const VOUCHER_PREFIX: &str = "voucher";
pub const STAKE_INSTANCE_PREFIX: &str = "stake-instance";

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub enum Key {
    Uninitialized,
    TokenStakingV0,
    StakingVoucherV0,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub enum PeriodUnit {
  SECOND,
  MINUTE,
  HOUR,
  DAY,
  YEAR
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct StakingVoucherV0 {
    pub key: Key,
    pub stake_instance_key: Pubkey,
    pub owner: Pubkey,
    pub base_amount: u64,
    pub create_timestamp: u64,
    pub last_withdraw_time: u64,
    pub lockup_periods: u64,

    // Needed to derive the PDA of this instance
    pub voucher_number: u16,
    pub bump_seed: u8
}
impl Sealed for StakingVoucherV0 {}
impl Pack for StakingVoucherV0 {
    const LEN: usize = 1000; // Pad to leave space for extras

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mut p = src;
        StakingVoucherV0::deserialize(&mut p).map_err(|e| {
            msg!("Failed to deserialize token staking voucher record {}", e);
            ProgramError::InvalidAccountData
        })
    }
}


#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct TokenStakingV0 {
    pub key: Key,
    pub base_mint: Pubkey,
    pub target_mint: Pubkey,
    pub period_unit: PeriodUnit,
    pub period: u32,
    // reward_percent_per_period on each contract is derived from lockup_periods * reward_percent_per_period_per_lockup_period
    pub reward_percent_per_period_per_lockup_period: u32, // Percent, as taken by this value / u32.MAX_VALUE

    // Calculated values, used to calculate the total target supply included unwithdrawn rewards
    pub total_base_amount_staked: u64, // Useful to have, not necessary.
    pub target_amount_per_period: u64,
    pub target_amount_unredeemed: u64,
    pub last_calculated_timestamp: u64,

    // Needed to derive the PDA of this instance
    pub bump_seed: u8,
    pub holding_account_bump_seed: u8,
    pub holding_authority_bump_seed: u8,
}
impl Sealed for TokenStakingV0 {}
impl Pack for TokenStakingV0 {
    const LEN: usize = 1000; // Pad to leave space for extras

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mut p = src;
        TokenStakingV0::deserialize(&mut p).map_err(|e| {
            msg!("Failed to deserialize token staking instance record {}", e);
            ProgramError::InvalidAccountData
        })
    }
}
