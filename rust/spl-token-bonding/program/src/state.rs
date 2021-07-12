use crate::precise_number::PreciseNumber;
use crate::ln::{InnerUint, NaturalLog, one};

use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::msg,
    solana_program::program_error::ProgramError,
    solana_program::program_pack::{Pack, Sealed},
    solana_program::pubkey::Pubkey,
};


pub const TARGET_AUTHORITY: &str = "target-authority";
pub const BASE_STORAGE_AUTHORITY: &str = "base-storage-authority";
pub const BASE_STORAGE_KEY: &str = "base-storage-key";

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub enum Key {
    TokenBondingV0,
    LogCurveV0,
    BaseRelativeLogCurveV0,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct TokenBondingV0 {
    pub key: Key,
    pub base_mint: Pubkey,
    pub target_mint: Pubkey,
    pub authority: Option<Pubkey>,
    pub base_storage: Pubkey,
    pub founder_rewards: Pubkey,
    /// Percentage of purchases that go to the founder
    /// Percentage Value is (founder_reward_percentage / 10,000) * 100
    pub founder_reward_percentage: u16,
    /// The bonding curve to use 
    pub curve: Pubkey,
    pub mint_cap: Option<u64>,
    pub buy_frozen: bool,
    pub sell_frozen: bool,
    pub initialized: bool,
}
impl Sealed for TokenBondingV0 {}

impl Pack for TokenBondingV0 {
    const LEN: usize = 1 + // key
        (32 * 6) + // Public keys
        2 + // Options
        2 + // Founder rewards %
        8 + // Mint cap
        3; // buy frozen, sell frozen, initialized

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mut p = src;
        TokenBondingV0::deserialize(&mut p).map_err(|e| {
            msg!("Failed to deserialize token bonding record {}", e);
            ProgramError::InvalidAccountData
        })
    }
}

pub trait Curve {
    fn initialized(&self) -> bool;
    fn price(&self, base_supply: &PreciseNumber, target_supply: &PreciseNumber, amount: &PreciseNumber) -> Option<PreciseNumber>;
}

/// If normal log curve, c * log(1 + (g * x))
/// If base relative, c * log(1 + (g * x) / (1 + base_supply))
#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct LogCurveV0 {
    pub key: Key,
    // Fixed precision decimal with 12 decimal places. So 1 would be 1_000_000_000_000. 1.5 is 1_500_000_000_000
    pub g: u128,
    // Fixed precision decimal with 12 decimal places. So 1 would be 1_000_000_000_000. 1.5 is 1_500_000_000_000
    pub c: u128,
    pub taylor_iterations: u16,
    pub initialized: bool
}
impl Sealed for LogCurveV0 {}

/// https://www.wolframalpha.com/input/?i=c+*+log%281+%2B+g+*+x%29+dx
pub fn log_curve(c: &PreciseNumber, g: &PreciseNumber, a: &PreciseNumber, b: &PreciseNumber, log_num_iterations: u16) -> Option<PreciseNumber> {
    let general = |x: &PreciseNumber| {
      let inv_g = ONE_PREC.checked_div(g)?;
      let inside = ONE_PREC.checked_add(&g.checked_mul(&x)?)?;
      let log = inside.ln(log_num_iterations)?;
      let log_mult = log.checked_mul(&inv_g.checked_add(&x)?)?;
      Some(c.checked_mul(&log_mult.checked_sub(&x)?)?)
    };

    general(b)?.checked_sub(&general(a)?)
}

static ONE_PREC: PreciseNumber =  PreciseNumber { value: one() };

impl Curve for LogCurveV0 {
    fn initialized(&self) -> bool {
        self.initialized
    }

    fn price(&self, base_supply: &PreciseNumber, target_supply: &PreciseNumber, amount: &PreciseNumber) -> Option<PreciseNumber> {
        let g_prec = PreciseNumber { value: InnerUint::from(self.g) };
        let g = if self.key == Key::BaseRelativeLogCurveV0 {
            g_prec.checked_div(&ONE_PREC.checked_add(base_supply)?)?
        } else {
            g_prec
        };
        log_curve(
            &PreciseNumber { value: InnerUint::from(self.c) },
            &g, 
            target_supply, 
            &target_supply.checked_add(&amount)?,
            self.taylor_iterations
        )
    }
}

impl Pack for LogCurveV0 {
    const LEN: usize = 1 + 16 * 2 + 2 + 1;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mut p = src;
        LogCurveV0::deserialize(&mut p).map_err(|_| {
            msg!("Failed to deserialize log curve record");
            ProgramError::InvalidAccountData
        })
    }
}
