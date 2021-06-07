use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::msg,
    solana_program::program_error::ProgramError,
    solana_program::program_pack::{Pack, Sealed},
    solana_program::pubkey::Pubkey,
};


pub const TARGET_AUTHORITY: &str = "target-authority";
pub const BASE_STORAGE_AUTHORITY: &str = "base-storage-authority";

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub enum Key {
    TokenBondingV0,
    LogCurveV0,
    BaseRelativeLogCurveV0,
    ConstantProductV0,
    BaseRelativeConstantProductV0,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct TokenBondingV0 {
    pub key: Key,
    pub base_mint: Pubkey,
    pub target_mint: Pubkey,
    pub authority: Pubkey,
    pub base_storage: Pubkey,
    pub founder_rewards: Pubkey,
    /// Percentage of purchases that go to the founder
    /// Percentage Value is (founder_reward_percentage / 10,000) * 100
    pub founder_reward_percentage: u16,
    /// The bonding curve to use 
    pub curve: Pubkey,
    pub initialized: bool,
}
impl Sealed for TokenBondingV0 {}

impl Pack for TokenBondingV0 {
    const LEN: usize = 1 + 32 * 6 + 2 + 1;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mut p = src;
        TokenBondingV0::deserialize(&mut p).map_err(|_| {
            msg!("Failed to deserialize name record");
            ProgramError::InvalidAccountData
        })
    }
}

pub trait Curve {
    fn initialized(&self) -> bool;
    fn price(&self, base_supply: f64, target_supply: f64, amount: f64) -> f64;
}

/// If normal log curve, base + c * log(1 + (g * x))
/// If base relative, base + c * log(1 + (g * x) / (1 + base_supply))
#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct LogCurveV0 {
    pub key: Key,
    pub g: f64,
    pub c: f64,
    pub initialized: bool
}
impl Sealed for LogCurveV0 {}

/// Raw transmutation to `u32`.
///
/// Transmutes the given `f32` into it's raw memory representation.
/// Similar to `f32::to_bits` but even more raw.
#[inline]
pub fn to_bits(x: f32) -> u32 {
    unsafe { ::std::mem::transmute::<f32, u32>(x) }
}

/// Raw transmutation from `u32`.
///
/// Converts the given `u32` containing the float's raw memory representation into the `f32` type.
/// Similar to `f32::from_bits` but even more raw.
#[inline]
pub fn from_bits(x: u32) -> f32 {
    unsafe { ::std::mem::transmute::<u32, f32>(x) }
}

/// Base 2 logarithm.
#[inline]
pub fn log2(x: f32) -> f32 {
    let vx = to_bits(x);
    let mx = from_bits((vx & 0x007FFFFF_u32) | 0x3f000000);
    let mut y = vx as f32;
    y *= 1.1920928955078125e-7_f32;
    y - 124.22551499_f32 - 1.498030302_f32 * mx - 1.72587999_f32 / (0.3520887068_f32 + mx)
}

/// Natural logarithm.
#[inline]
pub fn ln(x: f32) -> f32 {
    0.69314718_f32 * log2(x)
}

/// Integral of base + c * log(1 + g * x) dx from a to b
/// https://www.wolframalpha.com/input/?i=c+*+log%281+%2B+g+*+x%29+dx
fn log_curve(c: f64, g: f64, a: f64, b: f64) -> f64 {
    let general = |x: f64| {
        let inv_g = 1_f64 / g;
        let inside = (1_f64 + (g * x)) as f32;
        let log = ln(inside) as f64;
        let log_mult = (inv_g + x) * log;
        c * (log_mult - x)
    };
    general(b) - general(a)
}

impl Curve for LogCurveV0 {
    fn initialized(&self) -> bool {
        self.initialized
    }

    fn price(&self, base_supply: f64, target_supply: f64, amount: f64) -> f64 {
        let g: f64 = if self.key == Key::BaseRelativeLogCurveV0 {
            self.g / (1_f64 + base_supply)
        } else {
            self.g
        };
        let fvalue = log_curve(self.c as f64, g as f64, target_supply, target_supply + amount);
        fvalue
    }
}

impl Pack for LogCurveV0 {
    const LEN: usize = 1 + 8 * 2 + 1;

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

/// If normal constant produt curve, price = m * supply * x + b
/// If base relative, price = ((m / base_supply) * x) + b
#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct ConstantProductV0 {
    pub key: Key,
    pub m: f64,
    pub b: f64,
    pub initialized: bool
}
impl Sealed for ConstantProductV0 {}

impl<T> From<T> for Box<dyn Curve>
where
    T: Curve + 'static,
{
    fn from(curve: T) -> Self {
        Box::new(curve)
    }
}

impl Pack for ConstantProductV0 {
    const LEN: usize = 1 + 8 * 2 + 1;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        let mut slice = dst;
        self.serialize(&mut slice).unwrap()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        let mut p = src;
        ConstantProductV0::deserialize(&mut p).map_err(|_| {
            msg!("Failed to deserialize constant curve record");
            ProgramError::InvalidAccountData
        })
    }
}

fn constant_product(m: f64, b: f64, start: f64, finish: f64) -> f64 {
    let general = |x: f64| {
        m * x.powi(2) + b * x
    };

    general(finish) - general(start)
}

impl Curve for ConstantProductV0 {
    fn initialized(&self) -> bool {
        self.initialized
    }

    fn price(&self, base_supply: f64, target_supply: f64, amount: f64) -> f64 {
        let m: f64 = if self.key == Key::BaseRelativeConstantProductV0 {
            self.m / (1_f64 + base_supply)
        } else {
            self.m
        };
        return constant_product(m, self.b, target_supply, target_supply + amount);
    }
}
