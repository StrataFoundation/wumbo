SPL Token Staking
==================

This library serves to allow staking of an arbitrary spl token in exchange for a second token over time. This second token becomes, in effect, the time axis of holding the first token. The purpose of this is to prove ownership time for a variety of use cases like profit splitting and loyalty rewards.

# Accounts

The program has the following accounts:

  * **StakeInstance** - Holds all of the state for an instance that allows you to stake token a for token b. This also holds the definition of the rewards structure over time.
  * **Voucher** - A voucher indicating how many tokens were staked, which stake instance, what timestamp they were staked at, and which StakeRewardDef they are associated with. 

## Voucher

At the core of this contract is the idea of a voucher. A voucher allows you to continuously withdraw token b for having staked token a. A voucher keeps track of the following

```
stake_instance_key
amount
owner
create_timestamp // unix timestamp
last_withdraw_timestamp // unix timestamp
lockup_end_time // Optional, when set, this voucher cannot be liquidated until the end of the lockup.
```

### Address
The address of this should be a PDA of ["voucher", owner, stake_instance_key, account_number (0, 1, 2, 3, ...)]. This will allow fast lookups to all staking accounts for a base token for a given wallet.

## StakeInstance

A stake instance holds the state for an instance that allows staking token a for token b. This struct contains a stake reward def, which can be either `Continuous` or `LinearLockup`.

```
mint_a
mint_b
last_withdraw_timestamp // unix timestamp
stake_reward_def // struct, see below.
```

### Continuous

Continuous rewards vouchers can be liquidated for their associated token a stake at any time. They provide a simple token b stream over time defined by:

```
stake_instance_key
period_unit // SECONDS, MINUTES, HOURS, DAYS, MONTHS, YEARS
period // Number of seconds, minutes, hours, etc. 
reward_percent // Percentage of total a_amount that vests for each period

// Data needed to compute total theoretical token_b in circulation
a_amount_invested
b_amount_unredeemed // At the last_withdraw_timestamp
last_withdraw_timestamp
```

For every `period`, the voucher holder may redeem `reward_percent` times their total a_amount staked.

It is important we keep track of `a_amount_invested, b_amount_unredeemed, last_withdraw_timestamp` so that it is possible to calculate the total theoretical token_b's in circulation. Token_b mint supply is not a trustwothy souce, as it does not account for unclaimed rewards. The formula is

```
theoretical_b_supply = b_amount_unredeemed + mint_b.supply + periods(current_timestamp - last_withdraw_timestamp) * a_amount_invested * reward_percent
```

### LinearLockup

`LinearLockup`s reward locking up tokens with higher rewards percentages. In exchange for more risk, i.e. not being able to liquidate into the base token, the user receives a higher reward. This will set `lockup_end_time` on the voucher. After the lockup is ended, the `Voucher` will continue to accumulate rewards, but can be liquidated at any time.

The reward percentage scales as a linear model, defined by:

```
stake_instance_key
period_unit // SECONDS, MINUTES, HOURS, DAYS, MONTHS, YEARS
period // Number of seconds, minutes, hours, etc. 
reward_percent_per_period_locked // The reward percentage as a function of the number of periods locked.
max_lockup // The maximum number of periods this rewards def can be active for. 

a_amount_invested // Good to keep track of, not needed for any calculation

// Data needed to compute total theoretical token_b in circulation
b_amount_per_period // Given all of our contracts, how many b accumulate per period?
b_amount_unredeemed // At the last_withdraw_timestamp
last_withdraw_timestamp
```

So, for example, we may create a `LinearLockup` that rewards daily, with a max lockup of 1 year, resulting in a 10% APY at a year. We would set `period_unit = DAYS`, `period = 1`, `reward_per_period_locked = 0.0274`, `max_lockup = 365`. If we stake for 365 days, the `reward_percent` is `0.0274 * 365 = 10`. If we stake for 6 months, it follows that the APY would be 5%.

With a LinearLockup, the formula for theoretical_b_supply is

```
theoretical_b_supply = b_amount_unredeemed + mint_b.supply + periods(current_timestamp - last_withdraw_timestamp) * b_amount_per_period
```

### Address
The address of this should be a PDA of ["stake-instance", mint_a_key, mint_b_key]. 


# Commands

The contract will have the following commands

  * `create_stake_instance`
  * `stake`
  * `withdraw`
  * `liquidate`

## create_stake_instance

This command creates the `StakeInstance` as defined above. It must have mint authority on mint b.

## stake

This command allows you to stake `a_amount` of token a for rewards in `token_b`. Initializes a `Voucher` instance as defiend above.

## withdraw

This command allows you to withdraw your rewards in terms of `token_b` given your `Voucher`.

## liquidate

Liquidate a `Voucher` to reclaim your token a. This can only be done after `lockup_end_time`
