SPL Token Staking
==================

This library serves to allow staking of an arbitrary spl token in exchange for a second token over time. This second target becomes, in effect, the time axis of holding the base token. The purpose of this is to prove ownership time for a variety of use cases like profit splitting and loyalty rewards.

# Accounts

The program has the following accounts:

  * **TokenStaking** - Holds all of the state for a token staking instance that allows you to stake base token for target token. This also holds the definition of the rewards structure over time.
  * **Voucher** - A voucher indicating how many tokens were staked, which token staking instance, what timestamp they were staked at, and which StakeRewardDef they are associated with. 
  * **Holding Account** - An account, per voucher, holding the staked tokens. Will be returned to the user upon unstaking. 

## Voucher

At the core of this contract is the idea of a voucher. A voucher allows you to continuously withdraw target token for having staked base token. A voucher keeps track of the following

```
token_staking_key
amount
owner
create_timestamp // unix timestamp
last_collect_timestamp // unix timestamp of last collect_rewards
lockup_periods // Number of periods this voucher is locked for
```

### Address
The address of this should be a PDA of ["staking-voucher", owner, token_staking_key, account_number (0, 1, 2, 3, ...)]. This will allow fast lookups to all staking accounts for a base token for a given wallet.

## TokenStaking

A token staking instance holds the state for an instance that allows staking base token for target token with a set reward definition

```
base_mint
target_mint
create_timestamp // Unix timestamp
...stake_reward_definition... // See below
```

### Stake Reward Definition

Staking rewards longer lock ups with higher percentages. In exchange for more risk, i.e. not being able to unstake back into the base token, the user receives a higher reward. This will set `lockup_periods` on the voucher. After the lockup is ended, the `Voucher` will continue to accumulate rewards, but can be unstaked at any time.

The reward percentage scales as a linear model, defined by:

```
period_unit // SECONDS, MINUTES, HOURS, DAYS, MONTHS, YEARS
period // Number of seconds, minutes, hours, etc. 

reward_percent_per_period_per_lockup_period // The reward percentage as a function of the number of periods locked.
max_lockup_periods // The maximum number of periods vouchers can be locked for additional rewards

base_amount_invested // Good to keep track of, not needed for any calculation

// Data needed to compute total theoretical target tokens in circulation
target_amount_per_period // Given all of our contracts, how many target accumulate per period?
target_amount_unredeemed // At the last_calculated_timestamp
last_calculated_timestamp
```

So, for example, we may create a definition that rewards daily, with a max lockup of 1 year, resulting in a 10% APY at a year. We would set `period_unit = DAYS`, `period = 1`, `reward_per_period_locked = 0.0274`, `max_lockup_periods = 365`. If we stake for 365 days, the `reward_percent` is `0.0274 * 365 = 10`. If we stake for 6 months, it follows that the APY would be 5%.

It is important we keep track of metadata such that it is possible to calculate the total theoretical target tokens in circulation. Target mint supply is not a trustwothy souce, as it does not account for unclaimed rewards. The formula is

```
theoretical_target_supply = target_amount_unredeemed + target_mint.supply + periods(current_timestamp - last_withdraw_timestamp) * target_amount_per_period
```

### Address
The address of this should be a PDA of ["token-staking", base_mint_key, target_mint_key]. 


# Commands

The contract will have the following commands

  * `initialize_token_staking`
  * `stake`
  * `collect_rewards`
  * `unstake`

## initialize_token_staking

This command creates the `TokenStaking` as defined above. It must have mint authority on mint b.

## stake

This command allows you to stake `base_amount` of base token for rewards in `target_token`. Initializes a `Voucher` instance as defiend above.

## collect_rewards

This command allows you to collect rewards your rewards in terms of `target_token` given your `Voucher`.

Withdraw deposits tokens into the associated token account of the owner and is perrmissionless. So theoretically a server could periodically distribute rewards

## unstake

Liquidate a `Voucher` to reclaim your base token. This can only be done after `lockup_end_time`
