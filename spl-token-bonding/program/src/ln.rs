use spl_math::precise_number::{PreciseNumber};
use spl_math::uint::{U256};

// Allows for easy swapping between different internal representations
pub type InnerUint = U256;

/// The precise-number 1 as a InnerUint
#[inline]
pub const fn one() -> InnerUint {
    U256([1_000_000_000_000_u64, 0_u64, 0_u64, 0_u64])
    // InnerUint::from(ONE)
}

/// The precise-number 2 as a InnerUint
#[inline]
pub const fn two() -> InnerUint {
    U256([2_000_000_000_000_u64, 0_u64, 0_u64, 0_u64])
    // InnerUint::from(ONE)
}

/// The number 0 as a PreciseNumber, used for easier calculations.
#[inline]
pub const fn zero() -> InnerUint {
    U256([0_u64, 0_u64, 0_u64, 0_u64])
}

pub trait NaturalLog {
    fn ln(self, max_iterations: u16) -> Option<Self>
    where
        Self: Sized;
    
    fn ln_helper(self, max_iterations: u16) -> Option<Self>
        where
            Self: Sized;
}

static ONE_PREC: PreciseNumber = PreciseNumber { value: one() };
static TWO_PREC: PreciseNumber = PreciseNumber { value: two() };
static LN_2: PreciseNumber = PreciseNumber { value: U256([0_693147180559_u64, 0_u64, 0_u64, 0_u64]) };

impl NaturalLog for PreciseNumber {
    fn ln(self, max_iterations: u16) -> Option<Self> {
        if max_iterations == 0 {
            return None;
        }

        let more_than_two = self.greater_than(&TWO_PREC);

        if more_than_two {
            // ln(x) = ln(x/2 * 2) = ln(x/2) + ln(2)
            let over_two = self.checked_div(&TWO_PREC)?;
            if over_two.less_than(&ONE_PREC) {
                // ln(1/x) = - ln(x)
                let flipped = ONE_PREC.checked_div(&over_two)?;
                let log = &flipped.ln(max_iterations)?;
                LN_2.checked_sub(log)
            } else {
                LN_2.checked_add(&over_two.ln(max_iterations)?)
            }
        } else {
            self.ln_helper(max_iterations)
        }
    }

    fn ln_helper(self, max_iterations: u16) -> Option<Self> {
        let mut s: Self = PreciseNumber { value: zero() };

        for i in 1..max_iterations {
            let i_prec = PreciseNumber { value: InnerUint::from(one() * i) };
            // sign * (1 / i) * x ^ i (or -i if > 1)
            let frac = ONE_PREC.checked_div(&i_prec)?;
            let exp = &self.checked_sub(&ONE_PREC)?.checked_pow(i as u128)?;
            let next = frac.checked_mul(exp)?;
            if i % 2 == 0 {
                s = s.checked_sub(&next)?;
            } else {
                s = s.checked_add(&next)?;
            }
        }

        return Some(s);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ln_small() {
        let precision = InnerUint::from(5_000_000); // correct to at least 3 decimal places
        let test = PreciseNumber { value: InnerUint::from(1_500000000000_u128) };
        let expected = PreciseNumber { value: InnerUint::from(0_405465000000_u128) };
        let result = test.ln(100).unwrap();
        assert!(result.almost_eq(&expected, precision));
    }
    #[test]

    fn test_ln_big() {
        let precision = InnerUint::from(5_000_000); // correct to at least 3 decimal places
        let test = PreciseNumber { value: InnerUint::from(2_500000000000_u128) };
        let expected = PreciseNumber { value: InnerUint::from(0_916291000000_u128) };
        let result = test.ln(100).unwrap();
        assert!(result.almost_eq(&expected, precision));
    }
}
