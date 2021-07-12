/// Provide `msb` method for numeric types to obtain the zero-based
/// position of the most significant bit set.
/// 
/// Algorithms used based on this article: 
/// https://prismoskills.appspot.com/lessons/Bitwise_Operators/Find_position_of_MSB.jsp
pub trait MostSignificantBit {
    /// Get the zero-based position of the most significant bit of an integer type.
    /// If the number is zero, return zero. 
    /// 
    /// ## Examples: 
    /// 
    /// ```
    ///    use clusterphobia::clustering::msb::MostSignificantBit;
    /// 
    ///    assert!(0_u64.msb() == 0);
    ///    assert!(1_u64.msb() == 0);
    ///    assert!(2_u64.msb() == 1);
    ///    assert!(3_u64.msb() == 1);
    ///    assert!(4_u64.msb() == 2);
    ///    assert!(255_u64.msb() == 7);
    ///    assert!(1023_u64.msb() == 9);
    /// ```
    fn msb(self) -> usize;
}

#[inline]
/// Return whether floor(log2(x))!=floor(log2(y))
/// with zero for false and 1 for true, because this came from C!
fn ld_neq(x : u64, y : u64) -> u64 {
    let neq = (x^y) > (x&y);
    if neq { 1 } else { 0 }
}

impl MostSignificantBit for u64 {
    #[inline]
    fn msb(self) -> usize {
        // This algorithm found on pg 16 of "Matters Computational" at  https://www.jjj.de/fxt/fxtbook.pdf
        // It avoids most if-branches and has no looping.
        // Using this instead of Bisection and looping shaved off 1/3 of the time.
        const MU0 : u64 = 0x5555555555555555; // MU0 == ((-1UL)/3UL) == ...01010101_2
        const MU1 : u64 = 0x3333333333333333; // MU1 == ((-1UL)/5UL) == ...00110011_2
        const MU2 : u64 = 0x0f0f0f0f0f0f0f0f; // MU2 == ((-1UL)/17UL) == ...00001111_2
        const MU3 : u64 = 0x00ff00ff00ff00ff; // MU3 == ((-1UL)/257UL) == (8 ones)
        const MU4 : u64 = 0x0000ffff0000ffff; // MU4 == ((-1UL)/65537UL) == (16 ones)
        const MU5 : u64 = 0x00000000ffffffff; // MU5 == ((-1UL)/4294967297UL) == (32 ones)
        let r : u64 = ld_neq(self, self & MU0)
        + (ld_neq(self, self & MU1) << 1)
        + (ld_neq(self, self & MU2) << 2)
        + (ld_neq(self, self & MU3) << 3)
        + (ld_neq(self, self & MU4) << 4)
        + (ld_neq(self, self & MU5) << 5);
        r as usize
    }
}

impl MostSignificantBit for u32 {
    #[inline]
    fn msb(self) -> usize {
        // Bisection guarantees performance of O(Log B) where B is number of bits in integer.
        let mut high = 31_usize;
        let mut low = 0_usize;
        while (high - low) > 1
        {
            let mid = (high+low)/2;
            let mask_high = (1 << high) - (1 << mid);
            if (mask_high & self) != 0 { low = mid; }
            else { high = mid; }
        }
        low
    }
}


/// Approximate the natural logarithm of the ratio of two unsigned integers to an accuracy of ±0.000025.
/// 
/// The algorithm follows this article: http://www.nezumi.demon.co.uk/consult/logx.htm):
/// 
/// ## Algorithm
///  
///   1. Range reduction to the interval [1, 2] by dividing by the largest power of two not exceeding the value:
///      - Change representation of numerator   → `2ⁿ·N where 1 ≤ N ≤ 2`
///      - Change representation of denominator → `2ᵈ·D where 1 ≤ D ≤ 2`
///   2. This makes the result `log(numerator/denominator) = log(2ⁿ·N / 2ᵈ·D) = (n-d)·log(2) + log(N) - log(D)`
///   3. To perform log(N), Taylor series does not converge in the neighborhood of zero, but it does near one...
///   4. ... since N is near one, substitute x = N - 1 so that we now need to evaluate log(1 + x)
///   5. Perform a substitution of `y = y = x/(2+x)`
///   6. Consider the related function `f(y) = Log((1+y)/(1-y))`
///      - `= Log((1 + x/(2+x)) / (1 - x/(2+x)))`
///      - `= Log( (2+2x) / 2)`
///      - `= Log(1 + x)`
///   7. f(y) has a Taylor Expansion of which converges must faster than the expansion for Log(1+x) ... 
///      - For Log(1+x) → `x - x²/2 + x³/3 - y⁴/4 + ...`
///      - For Log((1+y)/(1-y)) → `y + y³/3 + y⁵/5 + ...`
///   8. Use the Padé Approximation for the truncated series `y + y³/3 + y⁵/5 ...`
///   9. ... Which is `2y·(15 - 4y²)/(15 - 9y²)`
///   10. Repeat for the denominator and combine the results.
/// 
/// ## Error Range
/// 
/// The interesting thing is to compare the error bars for the _Taylor series_ and its _Padé Approximation_: 
///    - Padé Approximation error is ±0.000025
///    - Taylor series has error ±0.00014 (five times worse)
pub fn log_ratio(numerator : u64, denominator : u64) -> f64 {
    // Ln(2) comes from The On-line Encyclopedia of Integer Sequences https://oeis.org/A002162
    const LOG2 : f64 = 0.6931471805599453; 
    if numerator == 0 || denominator == 0 { return f64::NAN; }

    // Range reduction 
    let n = numerator.msb();
    let d = denominator.msb();
    let reduced_numerator = numerator as f64 / (1 << n) as f64;
    let reduced_denominator = denominator as f64 / (1 << d) as f64;

    // Calculate logs of the products and dividends and combine.
    // To reduce from two calls to log_1_plus_x to a single call,
    //   - if reduced_numerator / reduced_denominator >= 1 use it as the operand and add the result,
    //   - otherwise use the inverse as the operand to log_1_plus_x and subtract the result.
    let log_fraction = 
        if reduced_numerator >= reduced_denominator { 
            log_1_plus_x((reduced_numerator / reduced_denominator) - 1.0) 
        }
        else {
            -log_1_plus_x((reduced_denominator / reduced_numerator) - 1.0)
        };
    let approximate_log = (n as f64 - d as f64) * LOG2 + log_fraction;
    approximate_log
}

/// Approximate the natural logarithm of one plus a number in the range (0..1). 
/// 
/// Use a Padé Approximation for the truncated Taylor series for Log((1+y)/(1-y)).
/// 
///   - x - must be a value between zero and one, inclusive.
#[inline]
pub fn log_1_plus_x(x : f64) -> f64 {
    // This is private and its caller already checks for negatives, so no need to check again here. 
    // Also, though ln(1 + 0) == 0 is an easy case, it is not so much more likely to be the argument
    // than other values, so no need for a special test.
    let y = x / (2.0 + x);
    let y_squared = y * y;
    // Original Formula is this: 2y·(15 - 4y²)/(15 - 9y²)
    // Reduce multiplications: (8/9)y·(3.75 - y²)/((5/3) - y²)
    0.8888888888888889 * y * (3.75 - y_squared) / (1.6666666666666667 - y_squared)
}
