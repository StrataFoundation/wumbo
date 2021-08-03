use crate::state::PeriodUnit;

use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        instruction::{AccountMeta, Instruction},
        sysvar, pubkey::Pubkey,
    }
};

/// Instructions supported by the Solclout program.
#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub enum TokenStakingInstruction {
    /// Initialize a new Token Staking account. Note that you must already have created the base mint,
    /// target mint
    ///
    ///   0. `[writeable signer]` Payer
    ///   1. `[writeable]` Token staking account to create. Pda of ['token-staking', target mint, base mint]
    ///   2. `[]` Base coin mint
    ///   3. `[]` Target coin mint. Must have mint and freeze authority as `create_program_address(['target-authority', target.pubKey])`
    ///   4. `[]` Clock program id
    ///   5. `[]` System program id
    ///   6. `[]` Rent sysvar
    InitializeTokenStakingV0 {
      period_unit: PeriodUnit,
      period: u32,
      // reward_percent_per_period on each contract is derived from lockup_periods * reward_percent_per_period_per_lockup_period
      reward_percent_per_period_per_lockup_period: u32, // Percent, as taken by this value / u32.MAX_VALUE
    },

    /// Stake an amount of base token
    ///   0. `[writeable]` Token staking account
    ///   1. `[writeable]` staking voucher account. Must be a PDA of ["staking-voucher", owner, token_staking_key, account_number]
    ///   2. `[writeable]`  Purchasing account, this is an account owned by the token program with
    ///                            the base mint
    ///   3. `[signer]`  Purchasing authority. This must be the authority on the purchasing account
    ///   5. `[]` Base coin holding account. Must be an empty account, staking will initialize this for you. PDA of ['base-holding', voucher.pubkey]
    ///   6. `[]` Base coin holding authority. Must be an empty account with key ['base-holding-authority', voucher.pubkey]
    ///   4. `[]` Clock program id
    ///   5. `[]` Token program id
    ///   6. `[]` System Program
    ///   7. `[]` Rent sysvar
    StakeV0 {
      voucher_number: u16,
      /// Base amount to stake
      base_amount: u64,
        
      /// Number of periods to lockup for. Will decide the rewards characteristics
      lockup_periods: u64,
    },

    /// Collect rewards for a given staking voucher. This operation is permissionless.
    ///
    ///   0. `[writeable]` Token staking account
    ///   1. `[writeable]` Staking voucher account
    ///   2. `[writeable]` Destination account. Must be an associated token account of the staking vouchers owner.
    ///   3. `[]` Target mint
    ///   4. `[]` Token program id
    CollectRewardsV0 {

    },
    /// Unstake and reclaim base tokens
    ///
    ///   0. `[writeable]` Token staking account
    ///   1. `[writeable]` Staking voucher account
    ///   2. `[writeable]` Base holding account
    ///   3. `[]` Base holding account authority
    ///   4. `[writeable]` Destination account. Must be an associated token account of the staking voucher's owner.
    ///   5. `[]` Token program id
    UnstakeV0 {

    }
}
