use std::convert::TryInto;
use std::str::FromStr;

use solana_program::instruction::{AccountMeta, Instruction};
use solana_program::program::{invoke, invoke_signed};
use solana_program::sysvar;
use solana_program::{program_error::ProgramError, system_instruction};
use crate::instruction::{CreateMetadataAccountArgs, MetadataInstruction};
use crate::precise_number::PreciseNumber;
use crate::state::TOKEN_BONDING_PREFIX;
use spl_token::{native_mint, solana_program::program_pack::Pack};

use {
    crate::{
        ln::{InnerUint},
        error::TokenBondingError,
        instruction::TokenBondingInstruction,
        state::{Curve, Key, LogCurveV0, TokenBondingV0, TARGET_AUTHORITY},
    },
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        account_info::{next_account_info, AccountInfo},
        borsh::try_from_slice_unchecked,
        entrypoint::ProgramResult,
        msg,
        pubkey::Pubkey,
        sysvar::rent::Rent,
    },
    spl_token::state::{Account, Mint},
};

use crate::{
    solana_program::sysvar::Sysvar,
    state::{BASE_STORAGE_AUTHORITY, BASE_STORAGE_KEY},
};

static TOKEN_METADATA_PROGRAM_ID_STR: &str = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    msg!("Input {}", String::from_utf8_lossy(input));
    let instruction = TokenBondingInstruction::try_from_slice(input)?;
    match instruction {
        TokenBondingInstruction::CreateLogCurveV0 {
            g,
            is_base_relative,
            c,
            taylor_iterations
        } => {
            msg!("Instruction: Create Log Curve V0");
            process_create_log_curve_v0(program_id, accounts, g, c, taylor_iterations, is_base_relative)
        }
        TokenBondingInstruction::InitializeTokenBondingV0 {
            founder_reward_percentage,
            mint_cap,
            token_bonding_authority,
        } => {
            msg!("Instruction: Initialize Token Bonding V0");
            process_initialize_token_bonding_v0(program_id, accounts, founder_reward_percentage, mint_cap, token_bonding_authority)
        }
        TokenBondingInstruction::BuyV0 { amount , max_price } => {
            msg!("Instruction: Buy V0");
            process_buy_v0(program_id, accounts, amount, max_price)
        }
        TokenBondingInstruction::SellV0 { amount, min_price } => {
            msg!("Instruction: Sell V0");
            process_sell_v0(program_id, accounts, amount, min_price)
        }
        TokenBondingInstruction::FreezeBuyV0 {} => {
            msg!("Instruction: Freeze Buy V0");
            process_freeze_v0(program_id, accounts, FreezeInfo {
                buy_frozen: Some(true),
                sell_frozen: None
            })
        }
        TokenBondingInstruction::ThawBuyV0 {} => {
            msg!("Instruction: Thaw Buy V0");
            process_freeze_v0(program_id, accounts, FreezeInfo {
                buy_frozen: Some(false),
                sell_frozen: None
            })
        }
        TokenBondingInstruction::FreezeSellV0 {} => {
            msg!("Instruction: Freeze Sell V0");
            process_freeze_v0(program_id, accounts, FreezeInfo {
                buy_frozen: None,
                sell_frozen: Some(true)
            })
        }
        TokenBondingInstruction::ThawSellV0 {} => {
            msg!("Instruction: Thaw Sell V0");
            process_freeze_v0(program_id, accounts, FreezeInfo {
                buy_frozen: None,
                sell_frozen: Some(false)
            })
        }
        TokenBondingInstruction::ChangeAuthorityV0 {
            new_authority
        } => {
            msg!("Instruction: Change Authority V0");
            process_change_authority_v0(program_id, accounts, new_authority)
        }
        TokenBondingInstruction::CreateTokenMetadata(args) => {
          msg!("Instruction: Create Token Metadata");
          process_create_token_metadata(program_id, accounts, args)
        }
    }
}

/// Create account almost from scratch, lifted from
/// https://github.com/solana-labs/solana-program-library/blob/7d4873c61721aca25464d42cc5ef651a7923ca79/associated-token-account/program/src/processor.rs#L51-L98
#[inline(always)]
pub fn create_or_allocate_account_raw<'a>(
    program_id: Pubkey,
    new_account_info: &AccountInfo<'a>,
    rent_sysvar_info: &AccountInfo<'a>,
    system_program_info: &AccountInfo<'a>,
    payer_info: &AccountInfo<'a>,
    size: usize,
    signer_seeds: &[&[u8]],
) -> ProgramResult {
    let rent = &Rent::from_account_info(rent_sysvar_info)?;
    let required_lamports = rent
        .minimum_balance(size)
        .max(1)
        .saturating_sub(new_account_info.lamports());

    if required_lamports > 0 {
        msg!("Transfer {} lamports to the new account", required_lamports);
        invoke(
            &system_instruction::transfer(&payer_info.key, new_account_info.key, required_lamports),
            &[
                payer_info.clone(),
                new_account_info.clone(),
                system_program_info.clone(),
            ],
        )?;
    }

    msg!("Allocate space for the account");
    invoke_signed(
        &system_instruction::allocate(new_account_info.key, size.try_into().unwrap()),
        &[new_account_info.clone(), system_program_info.clone()],
        &[&signer_seeds],
    )?;

    msg!("Assign the account to the owning program");
    invoke_signed(
        &system_instruction::assign(new_account_info.key, &program_id),
        &[new_account_info.clone(), system_program_info.clone()],
        &[&signer_seeds],
    )?;

    Ok(())
}

pub fn target_authority(program_id: &Pubkey, target_mint: &Pubkey) -> (Pubkey, u8) {
    let seeds: &[&[u8]] = &[&TARGET_AUTHORITY.as_bytes(), &target_mint.to_bytes()];
    Pubkey::find_program_address(seeds, program_id)
}

pub fn storage_authority(program_id: &Pubkey, base_storage: &Pubkey) -> (Pubkey, u8) {
    let seeds: &[&[u8]] = &[&BASE_STORAGE_AUTHORITY.as_bytes(), &base_storage.to_bytes()];
    Pubkey::find_program_address(seeds, program_id)
}

pub fn storage_key(program_id: &Pubkey, token_bonding: &Pubkey) -> (Pubkey, u8) {
    let seeds: &[&[u8]] = &[&BASE_STORAGE_KEY.as_bytes(), &token_bonding.to_bytes()];
    Pubkey::find_program_address(seeds, program_id)
}

pub fn token_bonding_key(program_id: &Pubkey, target_mint: &Pubkey) -> (Pubkey, u8) {
  let seeds: &[&[u8]] = &[&TOKEN_BONDING_PREFIX.as_bytes(), &target_mint.to_bytes()];
  Pubkey::find_program_address(seeds, program_id)
}

fn unpack_curve(program_id: &Pubkey, curve: &AccountInfo) -> Result<Box<dyn Curve>, ProgramError> {
    if *curve.owner != *program_id {
        return Err(TokenBondingError::InvalidOwner.into());
    }

    let curve_data = match curve.data.borrow()[0] {
        1 | 2 => {
            let curve = LogCurveV0::unpack_from_slice(&curve.data.borrow())?;
            Ok::<Box<dyn Curve>, ProgramError>(Box::new(curve))
        }
        _ => Err(TokenBondingError::InvalidCurveKey.into()),
    }?;

    if !curve_data.initialized() {
        return Err::<Box<dyn Curve>, ProgramError>(TokenBondingError::CurveNotInitialized.into());
    }

    return Ok(curve_data);
}

fn process_create_log_curve_v0(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    g: u128,
    c: u128,
    taylor_iterations: u16,
    is_base_relative: bool,
) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let payer = next_account_info(accounts_iter)?;
    let curve = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;

    if !payer.is_signer {
        return Err(TokenBondingError::MissingSigner.into());
    }

    if *curve.owner != *program_id {
        return Err(TokenBondingError::InvalidOwner.into());
    }

    let rent = &Rent::from_account_info(rent)?;
    let required_lamports = rent
        .minimum_balance(LogCurveV0::LEN)
        .max(1)
        .saturating_sub(curve.lamports());

    if required_lamports > 0 {
        return Err(TokenBondingError::NotRentExempt.into());
    }

    let new_account_data = LogCurveV0 {
        key: if is_base_relative {
            Key::BaseRelativeLogCurveV0
        } else {
            Key::LogCurveV0
        },
        g,
        c,
        taylor_iterations,
        initialized: true,
    };
    new_account_data.serialize(&mut *curve.try_borrow_mut_data()?)?;

    Ok(())
}

fn process_initialize_token_bonding_v0(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    founder_reward_percentage: u16,
    mint_cap: Option<u64>,
    token_bonding_authority_opt: Option<Pubkey>,
) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let payer = next_account_info(accounts_iter)?;
    let token_bonding_account = next_account_info(accounts_iter)?;
    let curve = next_account_info(accounts_iter)?;
    unpack_curve(program_id, curve)?;
    let base_mint = next_account_info(accounts_iter)?;
    let target_mint = next_account_info(accounts_iter)?;
    let target_mint_data = Mint::unpack(*target_mint.data.borrow())?;
    let founder_rewards = next_account_info(accounts_iter)?;
    let founder_rewards_data = Account::unpack(*founder_rewards.data.borrow())?;
    let base_storage = next_account_info(accounts_iter)?;
    let base_storage_authority = next_account_info(accounts_iter)?;
    let (target_mint_authority, _) = target_authority(program_id, target_mint.key);
    let (base_storage_authority_key, _) = storage_authority(program_id, base_storage.key);
    let token_program = next_account_info(accounts_iter)?;
    let system_program_info = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;

    let (token_bonding_key, token_bonding_nonce) = token_bonding_key(program_id, target_mint.key);
    if token_bonding_key != *token_bonding_account.key {
      return Err(TokenBondingError::InvalidProgramAddress.into());
    }
    let token_bonding_seed = &[
        TOKEN_BONDING_PREFIX.as_bytes(),
        &target_mint.key.to_bytes(),
        &[token_bonding_nonce],
    ];
   create_or_allocate_account_raw(
        *program_id,
        token_bonding_account,
        rent,
        system_program_info,
        payer,
        TokenBondingV0::LEN,
        token_bonding_seed
    )?;

    let (storage_key, storage_key_nonce) = storage_key(program_id, token_bonding_account.key);

    if storage_key != *base_storage.key {
        return Err(TokenBondingError::InvalidBaseStorageAccountKey.into());
    }

    if *base_storage_authority.key != base_storage_authority_key {
        return Err(TokenBondingError::InvalidAuthority.into());
    }

    let storage_seed = &[
        BASE_STORAGE_KEY.as_bytes(),
        &token_bonding_account.key.to_bytes(),
        &[storage_key_nonce],
    ];
    let is_native = *base_mint.key == native_mint::id();
   create_or_allocate_account_raw(
        if is_native {
            *program_id
        } else {
            *token_program.key
        },
        base_storage,
        rent,
        system_program_info,
        payer,
        if is_native {
            0
        } else {
            Account::LEN
        },
        storage_seed,
    )?;
    if !is_native {
        invoke_signed(
            &spl_token::instruction::initialize_account(
                token_program.key,
                &storage_key,
                base_mint.key,
                &base_storage_authority_key,
            )?,
            &[
                token_program.clone(),
                base_storage.clone(),
                base_mint.clone(),
                base_storage_authority.clone(),
                rent.clone(),
            ],
            &[],
        )?;
    }

    if !payer.is_signer {
        return Err(TokenBondingError::MissingSigner.into());
    }

    if target_mint_authority != target_mint_data.mint_authority.unwrap()
        || target_mint_authority != target_mint_data.freeze_authority.unwrap()
    {
        return Err(TokenBondingError::InvalidAuthority.into());
    }

    if token_bonding_account.data.borrow().len() > 0
        && TokenBondingV0::unpack_from_slice(&token_bonding_account.data.borrow())?.initialized
    {
        return Err(TokenBondingError::AlreadyInitialized.into());
    }

    if *target_mint.owner != *token_program.key
        || *base_mint.owner != *token_program.key
        || *founder_rewards.owner != *token_program.key
    {
        return Err(TokenBondingError::InvalidTokenProgramId.into());
    }

    if founder_rewards_data.mint != *target_mint.key {
        return Err(TokenBondingError::InvalidTargetMint.into());
    }

    if *token_bonding_account.owner != *program_id {
        return Err(TokenBondingError::InvalidOwner.into());
    }

    let new_account_data = TokenBondingV0 {
        key: Key::TokenBondingV0,
        target_mint: *target_mint.key,
        authority: token_bonding_authority_opt,
        base_mint: *base_mint.key,
        base_storage: *base_storage.key,
        founder_rewards: *founder_rewards.key,
        founder_reward_percentage,
        curve: *curve.key,
        buy_frozen: false,
        sell_frozen: false,
        mint_cap,
        initialized: true,
    };
    new_account_data.serialize(&mut *token_bonding_account.try_borrow_mut_data()?)?;

    Ok(())
}

fn precise_supply(mint: Mint) -> PreciseNumber {
    precise_supply_amt(mint.supply, mint)
}

fn precise_supply_amt(amt: u64, mint: Mint) -> PreciseNumber {
    PreciseNumber {
        value: InnerUint::from((amt as u128) * 10_u128.pow(12_u32 - mint.decimals as u32))
    }
}

fn to_lamports(amt: &PreciseNumber, mint: Mint) -> u64 {
    amt.checked_mul(
        &PreciseNumber::new(10_u128).unwrap().checked_pow(mint.decimals as u128).unwrap()
    ).unwrap().to_imprecise().unwrap() as u64
}

fn process_buy_v0(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64, max_price: u64) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let token_bonding = next_account_info(accounts_iter)?;
    let curve = next_account_info(accounts_iter)?;
    let curve_data = unpack_curve(program_id, curve)?;
    let base_mint = next_account_info(accounts_iter)?;
    let base_mint_data = Mint::unpack(*base_mint.data.borrow())?;
    let target_mint = next_account_info(accounts_iter)?;
    let target_mint_data = Mint::unpack(*target_mint.data.borrow())?;
    let target_mint_authority = next_account_info(accounts_iter)?;
    let founder_rewards = next_account_info(accounts_iter)?;
    let base_storage = next_account_info(accounts_iter)?;
    let purchase_account = next_account_info(accounts_iter)?;
    let purchase_authority = next_account_info(accounts_iter)?;
    let destination = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let token_program_id = token_program.key;
    let system_account_info = next_account_info(accounts_iter)?;

    let token_bonding_data: TokenBondingV0 =
        try_from_slice_unchecked(*token_bonding.data.borrow())?;
    let target_mint_key = token_bonding_data.target_mint;
    let (target_mint_authority_key, bump) = target_authority(program_id, target_mint.key);

    if token_bonding_data.key != Key::TokenBondingV0 {
        return Err(ProgramError::InvalidAccountData);
    }

    if target_mint_key != *target_mint.key {
        return Err(TokenBondingError::InvalidTargetMint.into());
    }

    if target_mint_authority_key != *target_mint_authority.key {
        return Err(TokenBondingError::InvalidAuthority.into());
    }

    if *token_bonding.owner != *program_id {
        return Err(TokenBondingError::InvalidTokenBondingOwner.into());
    }

    if *curve.key != token_bonding_data.curve {
        return Err(TokenBondingError::InvalidCurveKey.into());
    }

    if *founder_rewards.key != token_bonding_data.founder_rewards {
        return Err(TokenBondingError::InvalidFounderRewardsAccount.into());
    }

    if *base_storage.key != token_bonding_data.base_storage {
        return Err(TokenBondingError::InvalidTokenBonding.into());
    }

    if token_bonding_data.target_mint != *target_mint.key {
        return Err(TokenBondingError::InvalidTargetMint.into());
    }
    let founder_rewards_decimal = if token_bonding_data.founder_reward_percentage == 0 {
        PreciseNumber::new(1).unwrap()
    } else {
        PreciseNumber::new(1).unwrap().checked_add(
            &PreciseNumber::new(token_bonding_data.founder_reward_percentage as u128).unwrap()
                .checked_div(&PreciseNumber::new(10000_u128).unwrap()).unwrap()
        ).unwrap()
    };
    let amount_prec = precise_supply_amt(amount, target_mint_data);
    let amount_with_rewards = founder_rewards_decimal.checked_mul(&amount_prec).unwrap();

    let base_supply = if *base_mint.key == native_mint::id() {
        PreciseNumber { value: InnerUint::from(1036191464_675693800000_u128) }// TODO: Actually get supply
    } else {
        precise_supply(base_mint_data)
    };
    let target_supply = precise_supply(target_mint_data);
    
    let p = curve_data.price(
        &base_supply,
        &target_supply,
        &amount_with_rewards,
    ).unwrap();
    let price = to_lamports(
        &p,
        base_mint_data,
    );
    msg!("Price is {}", price);
    if price > max_price {
        return Err(TokenBondingError::MaxPriceExceeded.into());
    }

    let founder_cut = to_lamports(
        &amount_with_rewards.checked_sub(&amount_prec).unwrap(),
        target_mint_data
    );
    let purchaser_cut = amount;

    if token_bonding_data.mint_cap.is_some() && amount + founder_cut > token_bonding_data.mint_cap.unwrap() {
        return Err(TokenBondingError::MaxTokensMinted.into());
    }

    msg!(
        "Attempting to buy {} target lamports for {} base lamports",
        amount,
        price
    );
    msg!("Paying into base storage");
    if *base_mint.key == native_mint::id() {
        msg!("Base is the native mint, issueing a native transfer");
        let pay_money = system_instruction::transfer(purchase_account.key, base_storage.key, price);
        invoke_signed(
            &pay_money,
            &[
                purchase_account.clone(),
                base_storage.clone(),
                system_account_info.clone(),
            ],
            &[],
        )?;
    } else {
        let pay_money = spl_token::instruction::transfer(
            &token_program_id,
            purchase_account.key,
            base_storage.key,
            purchase_authority.key,
            &[],
            price,
        )?;
        invoke_signed(
            &pay_money,
            &[
                purchase_account.clone(),
                base_storage.clone(),
                purchase_authority.clone(),
                token_program.clone(),
            ],
            &[],
        )?;
    };

    msg!("Done");

    let target_mint_authority_seed: &[&[u8]] = &[
        &TARGET_AUTHORITY.as_bytes(),
        &target_mint.key.to_bytes(),
        &[bump],
    ];

    // Mint the required lamports
    msg!("Paying founders {} target lamports", founder_cut);
    let give_founder_cut = spl_token::instruction::mint_to(
        &token_program_id,
        &target_mint_key,
        &founder_rewards.key,
        &target_mint_authority.key,
        &[],
        founder_cut,
    )?;
    invoke_signed(
        &give_founder_cut,
        &[
            token_program.clone(),
            target_mint.clone(),
            founder_rewards.clone(),
            target_mint_authority.clone(),
        ],
        &[&target_mint_authority_seed],
    )?;
    msg!("Done");

    msg!("Receiving {} target lamports", purchaser_cut);
    let give_purchaser_cut = spl_token::instruction::mint_to(
        &token_program_id,
        &target_mint_key,
        &destination.key,
        &target_mint_authority.key,
        &[],
        purchaser_cut,
    )?;
    invoke_signed(
        &give_purchaser_cut,
        &[
            token_program.clone(),
            target_mint.clone(),
            destination.clone(),
            target_mint_authority.clone(),
        ],
        &[&target_mint_authority_seed],
    )?;

    Ok(())
}

fn process_sell_v0(program_id: &Pubkey, accounts: &[AccountInfo], amount: u64, min_price: u64) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let token_bonding = next_account_info(accounts_iter)?;
    let curve = next_account_info(accounts_iter)?;
    let curve_data = unpack_curve(program_id, curve)?;
    let base_mint = next_account_info(accounts_iter)?;
    let target_mint = next_account_info(accounts_iter)?;
    let base_storage = next_account_info(accounts_iter)?;
    let base_storage_authority = next_account_info(accounts_iter)?;
    let sell_account = next_account_info(accounts_iter)?;
    let sell_authority = next_account_info(accounts_iter)?;
    let destination = next_account_info(accounts_iter)?;
    let token_program_id = next_account_info(accounts_iter)?;
    let system_account_info = next_account_info(accounts_iter)?;

    let (_, base_storage_nonce) = storage_authority(&program_id, base_storage.key);
    let target_mint_data = Mint::unpack(*target_mint.data.borrow())?;
    let base_mint_data = Mint::unpack(*base_mint.data.borrow())?;

    let token_bonding_data: TokenBondingV0 =
        try_from_slice_unchecked(*token_bonding.data.borrow())?;
    let target_mint_key = token_bonding_data.target_mint;
    let base_mint_key = token_bonding_data.base_mint;

    if token_bonding_data.key != Key::TokenBondingV0 {
        return Err(ProgramError::InvalidAccountData);
    }

    if target_mint_key != *target_mint.key {
        return Err(TokenBondingError::InvalidTargetMint.into());
    }

    if base_mint_key != *base_mint.key {
        return Err(TokenBondingError::InvalidBaseMint.into());
    }

    if *token_bonding.owner != *program_id {
        return Err(TokenBondingError::InvalidTokenBondingOwner.into());
    }

    if *curve.key != token_bonding_data.curve {
        return Err(TokenBondingError::InvalidCurveKey.into());
    }

    if *base_storage.key != token_bonding_data.base_storage {
        return Err(TokenBondingError::InvalidTokenBonding.into());
    }

    let reclaimed_amount = to_lamports(
        &curve_data.price(
            &precise_supply(base_mint_data),
            &precise_supply(target_mint_data).checked_sub(&precise_supply_amt(amount, target_mint_data))
                .ok_or::<ProgramError>(TokenBondingError::InsufficientFunds.into())?,
            &precise_supply_amt(amount, target_mint_data),
        ).unwrap(),
        base_mint_data,
    );

    msg!(
        "Attempting to burn {} target lamports for {} base lamports",
        amount,
        reclaimed_amount
    );
    if reclaimed_amount < min_price {
        return Err(TokenBondingError::MinPriceExceeded.into());
    }

    // Burn the required lamports
    msg!("Burning  {} target coins (including decimal)", amount);
    let burn = spl_token::instruction::burn(
        &token_program_id.key,
        &sell_account.key,
        &target_mint.key,
        &sell_authority.key,
        &[],
        amount,
    )?;
    invoke_signed(
        &burn,
        &[
            token_program_id.clone(),
            sell_account.clone(),
            target_mint.clone(),
            sell_authority.clone(),
        ],
        &[],
    )?;
    msg!("Done");

    msg!("Paying from base storage");
    if *base_mint.key == native_mint::id() {
        msg!("Base is the native mint, issueing a native transfer");
        **base_storage.try_borrow_mut_lamports()? -= reclaimed_amount;
        **destination.try_borrow_mut_lamports()? += reclaimed_amount;
    } else {
        let authority_seed = &[
            BASE_STORAGE_AUTHORITY.as_bytes(),
            &base_storage.key.to_bytes(),
            &[base_storage_nonce],
        ];
        let pay_money = spl_token::instruction::transfer(
            &token_program_id.key,
            base_storage.key,
            destination.key,
            base_storage_authority.key,
            &[],
            reclaimed_amount,
        )?;
        invoke_signed(
            &pay_money,
            &[
                destination.clone(),
                base_storage.clone(),
                base_storage_authority.clone(),
                token_program_id.clone(),
            ],
            &[authority_seed],
        )?;
    };

    Ok(())
}

pub struct FreezeInfo {
    buy_frozen: Option<bool>,
    sell_frozen: Option<bool>,
}

fn process_freeze_v0(program_id: &Pubkey, accounts: &[AccountInfo], freeze_info: FreezeInfo) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let token_bonding = next_account_info(accounts_iter)?;
    let token_bonding_authority = next_account_info(accounts_iter)?;
    let token_bonding_data: TokenBondingV0 =
        try_from_slice_unchecked(*token_bonding.data.borrow())?;

    if token_bonding_data.key != Key::TokenBondingV0 {
        return Err(ProgramError::InvalidAccountData);
    }

    if !token_bonding_authority.is_signer {
        return Err(TokenBondingError::MissingSigner.into());
    }

    if token_bonding_data.authority.unwrap() != *token_bonding_authority.key {
        return Err(TokenBondingError::InvalidAuthority.into());
    }

    if *token_bonding.owner != *program_id {
        return Err(TokenBondingError::InvalidOwner.into());
    }

    let prev_buy_frozen = token_bonding_data.buy_frozen;
    let prev_sell_frozen = token_bonding_data.sell_frozen;
    let new_account_data = TokenBondingV0 {
        key: token_bonding_data.key,
        target_mint: token_bonding_data.target_mint,
        authority: token_bonding_data.authority,
        base_mint: token_bonding_data.base_mint,
        base_storage: token_bonding_data.base_storage,
        founder_rewards: token_bonding_data.founder_rewards,
        founder_reward_percentage: token_bonding_data.founder_reward_percentage,
        curve: token_bonding_data.curve,
        buy_frozen: freeze_info.buy_frozen.or_else(|| Some(prev_buy_frozen)).unwrap(),
        sell_frozen: freeze_info.sell_frozen.or_else(|| Some(prev_sell_frozen)).unwrap(),
        mint_cap: token_bonding_data.mint_cap,
        initialized: token_bonding_data.initialized,
    };
    new_account_data.serialize(&mut *token_bonding.try_borrow_mut_data()?)?;

    Ok(())
}

fn process_change_authority_v0(program_id: &Pubkey, accounts: &[AccountInfo], new_authority: Option<Pubkey>) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let token_bonding = next_account_info(accounts_iter)?;
    let token_bonding_authority = next_account_info(accounts_iter)?;
    let token_bonding_data: TokenBondingV0 =
        try_from_slice_unchecked(*token_bonding.data.borrow())?;

    if token_bonding_data.key != Key::TokenBondingV0 {
        return Err(ProgramError::InvalidAccountData);
    }

    if !token_bonding_authority.is_signer {
        return Err(TokenBondingError::MissingSigner.into());
    }

    if token_bonding_data.authority.unwrap() != *token_bonding_authority.key {
        return Err(TokenBondingError::InvalidAuthority.into());
    }

    if *token_bonding.owner != *program_id {
        return Err(TokenBondingError::InvalidOwner.into());
    }

    let new_account_data = TokenBondingV0 {
        key: token_bonding_data.key,
        target_mint: token_bonding_data.target_mint,
        authority: new_authority,
        base_mint: token_bonding_data.base_mint,
        base_storage: token_bonding_data.base_storage,
        founder_rewards: token_bonding_data.founder_rewards,
        founder_reward_percentage: token_bonding_data.founder_reward_percentage,
        curve: token_bonding_data.curve,
        buy_frozen: token_bonding_data.buy_frozen,
        sell_frozen: token_bonding_data.sell_frozen,
        mint_cap: token_bonding_data.mint_cap,
        initialized: token_bonding_data.initialized,
    };
    new_account_data.serialize(&mut *token_bonding.try_borrow_mut_data()?)?;

    Ok(())
}

#[allow(clippy::too_many_arguments)]
pub fn create_metadata_accounts(
    program_id: Pubkey,
    metadata_account: Pubkey,
    mint: Pubkey,
    mint_authority: Pubkey,
    payer: Pubkey,
    update_authority: Pubkey,
    update_authority_is_signer: bool,
    args: CreateMetadataAccountArgs
) -> Instruction {
    Instruction {
        program_id,
        accounts: vec![
          AccountMeta::new(metadata_account, false),
          AccountMeta::new_readonly(mint, false),
            AccountMeta::new_readonly(mint_authority, true),
            AccountMeta::new(payer, true),
            AccountMeta::new_readonly(update_authority, update_authority_is_signer),
            AccountMeta::new_readonly(solana_program::system_program::id(), false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
        ],
        data: MetadataInstruction::CreateMetadataAccount(args)
        .try_to_vec()
        .unwrap(),
    }
}

fn process_create_token_metadata(program_id: &Pubkey, accounts: &[AccountInfo], args: CreateMetadataAccountArgs) -> ProgramResult {
  let accounts_iter = &mut accounts.into_iter();
  let token_bonding = next_account_info(accounts_iter)?;
  let token_bonding_authority = next_account_info(accounts_iter)?;
  let spl_token_metadata_program_id = next_account_info(accounts_iter)?;

  // Unused except for passthrough
  let metadata_account = next_account_info(accounts_iter)?;
  let mint = next_account_info(accounts_iter)?;
  let mint_authority = next_account_info(accounts_iter)?;
  let payer = next_account_info(accounts_iter)?;
  let update_authority = next_account_info(accounts_iter)?;
  let system = next_account_info(accounts_iter)?;
  let rent = next_account_info(accounts_iter)?;

  let token_bonding_data = TokenBondingV0::unpack_from_slice(&token_bonding.data.borrow())?;

  if *token_bonding.owner != *program_id {
    return Err(ProgramError::IncorrectProgramId);
  }

  if !token_bonding_authority.is_signer {
    return Err(TokenBondingError::MissingSigner.into());
  }

  if *token_bonding_authority.key != token_bonding_data.authority.ok_or::<ProgramError>(TokenBondingError::InvalidAuthority.into())? {
    return Err(TokenBondingError::InvalidAuthority.into())
  }

  let (mint_authority_key, nonce) = target_authority(program_id, mint.key);
  let signer_seeds = &[
      TARGET_AUTHORITY.as_bytes(),
      &mint.key.to_bytes(),
      &[nonce]
  ];

  if mint_authority_key != *mint_authority.key {
    return Err(TokenBondingError::InvalidMintAuthority.into());
  }

  if *spl_token_metadata_program_id.key != Pubkey::from_str(TOKEN_METADATA_PROGRAM_ID_STR).unwrap() {
    return Err(ProgramError::IncorrectProgramId);
  }
  
  invoke_signed(
    &create_metadata_accounts(
      *spl_token_metadata_program_id.key,
      *metadata_account.key,
      *mint.key,
      *mint_authority.key,
      *payer.key,
      *update_authority.key,
      update_authority.is_signer,
      args
    ),
    &[
      spl_token_metadata_program_id.clone(),
      metadata_account.clone(),
      mint.clone(),
      mint_authority.clone(),
      payer.clone(),
      update_authority.clone(),
      system.clone(),
      rent.clone()
    ],
    &[signer_seeds],
  )?;

  return Ok(())
}

#[cfg(test)]
mod tests {
    use solana_program::instruction::Instruction;
    use solana_sdk::account::{
        create_account_for_test, create_is_signer_account_infos, Account as SolanaAccount,
    };
    use solana_sdk::program_option::COption;
    use crate::precise_number::PreciseNumber;
    use spl_token::solana_program::program_pack::Pack;
    use spl_token::state::AccountState;

    use crate::instruction::*;
    use crate::ln::InnerUint;

    use super::*;

    fn rent_sysvar() -> SolanaAccount {
        create_account_for_test(&Rent::default())
    }

    fn program_id_sysvar() -> SolanaAccount {
        create_account_for_test(&Rent::default())
    }

    fn do_process_instruction(
        instruction: Instruction,
        accounts: Vec<&mut SolanaAccount>,
    ) -> ProgramResult {
        let mut meta = instruction
            .accounts
            .iter()
            .zip(accounts)
            .map(|(account_meta, account)| (&account_meta.pubkey, account_meta.is_signer, account))
            .collect::<Vec<_>>();

        let account_infos = create_is_signer_account_infos(&mut meta);
        process_instruction(&instruction.program_id, &account_infos, &instruction.data)
    }

    fn get_account(space: usize, owner: &Pubkey) -> (Pubkey, SolanaAccount) {
        let key = Pubkey::new_unique();
        (key, SolanaAccount::new(1000000000, space, owner))
    }

    fn get_loaded_mint(program_id: &Pubkey, mint: Mint) -> (Pubkey, SolanaAccount) {
        let (mint_key, mut mint_acc) = get_account(Mint::LEN as usize, &program_id);
        let mut mint_data = vec![0; Mint::get_packed_len()];
        Mint::pack(mint, &mut mint_data).unwrap();
        mint_acc.data = mint_data;

        (mint_key, mint_acc)
    }

    fn get_loaded_mint_account(program_id: &Pubkey, account: Account) -> (Pubkey, SolanaAccount) {
        let (account_key, mut account_info) = get_account(Mint::LEN as usize, &program_id);
        let mut account_data = vec![0; Account::get_packed_len()];
        Account::pack(account, &mut account_data).unwrap();
        account_info.data = account_data;

        (account_key, account_info)
    }

    pub struct Fixture {
        pub token_program_id: Pubkey,
        pub token_program: Box<SolanaAccount>,
        pub program_id: Pubkey,
        pub payer_key: Pubkey,
        pub payer: Box<SolanaAccount>,
        pub token_bonding_key: Pubkey,
        pub token_bonding: Box<SolanaAccount>,
        pub token_bonding_authority_key: Pubkey,
        pub token_bonding_authority: Box<SolanaAccount>,
        pub base_mint_key: Pubkey,
        pub base_mint: Box<SolanaAccount>,
        pub target_mint_key: Pubkey,
        pub target_mint: Box<SolanaAccount>,
        pub target_mint_authority_key: Pubkey,
        pub target_mint_authority: Box<SolanaAccount>,
        pub founder_rewards_key: Pubkey,
        pub founder_rewards: Box<SolanaAccount>,
        pub base_storage_key: Pubkey,
        pub base_storage: Box<SolanaAccount>,
        pub base_storage_authority_key: Pubkey,
        pub base_storage_authority: Box<SolanaAccount>,
        pub curve_key: Pubkey,
        pub curve: Box<SolanaAccount>,
    }

    fn get_fixture() -> Fixture {
        let token_program_id = spl_token::id();
        let program_id = Pubkey::new_unique();
        let payer_key = Pubkey::new_unique();
        let payer = SolanaAccount::new(100000, 0, &program_id);
        let (token_bonding_authority_key, token_bonding_authority) = get_account(0, &program_id);
        let (curve_key, curve) = get_account(LogCurveV0::LEN, &program_id);
        let (base_mint_key, base_mint) = get_loaded_mint(
            &token_program_id,
            Mint {
                mint_authority: COption::Some(Pubkey::new_unique()),
                supply: 20,
                decimals: 5,
                is_initialized: true,
                freeze_authority: COption::Some(Pubkey::new_unique()),
            },
        );
        let target_mint_key = Pubkey::new_unique();
        let (target_mint_authority_key, _) = target_authority(&program_id, &target_mint_key);
        let target_mint_authority = SolanaAccount::new(0, 0, &program_id);
        let (_, target_mint) = get_loaded_mint(
            &token_program_id,
            Mint {
                mint_authority: COption::Some(target_mint_authority_key),
                supply: 20,
                decimals: 5,
                is_initialized: true,
                freeze_authority: COption::Some(target_mint_authority_key),
            },
        );
        let (token_bonding_key, _) = token_bonding_key(&program_id, &target_mint_key);
        let token_bonding = SolanaAccount::new(0, TokenBondingV0::LEN, &program_id);
        let (founder_rewards_key, founder_rewards) = get_loaded_mint_account(
            &token_program_id,
            Account {
                mint: target_mint_key,
                owner: target_mint_authority_key,
                amount: 0,
                delegate: COption::None,
                state: AccountState::Initialized,
                is_native: COption::None,
                delegated_amount: 0,
                close_authority: COption::None,
            },
        );

        let (base_storage_key, _) = storage_key(&program_id, &token_bonding_key);
        let (_, base_storage) = get_account(Account::LEN, &program_id);
        let (base_storage_authority_key, _) = storage_authority(&program_id, &base_storage_key);
        let base_storage_authority = SolanaAccount::new(0, 0, &program_id);

        let token_program = SolanaAccount::new(0, 0, &program_id);

        Fixture {
            token_program_id,
            token_program: Box::new(token_program),
            program_id,
            payer_key,
            payer: Box::new(payer),
            token_bonding_key,
            token_bonding: Box::new(token_bonding),
            token_bonding_authority_key,
            token_bonding_authority: Box::new(token_bonding_authority),
            base_mint_key,
            base_mint: Box::new(base_mint),
            target_mint_key,
            target_mint: Box::new(target_mint),
            target_mint_authority_key,
            target_mint_authority: Box::new(target_mint_authority),
            founder_rewards_key,
            founder_rewards: Box::new(founder_rewards),
            base_storage_key,
            base_storage: Box::new(base_storage),
            base_storage_authority_key,
            base_storage_authority: Box::new(base_storage_authority),
            curve: Box::new(curve),
            curve_key,
        }
    }

    fn create_curve(fixture: &mut Fixture) -> ProgramResult {
        do_process_instruction(
            create_log_curve_v0(
                &fixture.program_id,
                &fixture.payer_key,
                &fixture.curve_key,
                1_000000000000_u128,
                2_000000000000_u128,
                100,
                true,
            ),
            vec![
                &mut fixture.payer,
                &mut fixture.curve,
                &mut program_id_sysvar(),
                &mut rent_sysvar(),
            ],
        )
    }

    fn init(fixture: &mut Fixture) -> ProgramResult {
        do_process_instruction(
            initialize_token_bonding_v0(
                &fixture.program_id,
                &fixture.token_program_id,
                &fixture.payer_key,
                &fixture.token_bonding_key,
                Some(fixture.token_bonding_authority_key),
                &fixture.curve_key,
                &fixture.base_mint_key,
                &fixture.target_mint_key,
                &fixture.founder_rewards_key,
                &fixture.base_storage_key,
                &fixture.base_storage_authority_key,
                1000,
                Some(100000000000000_u64),
            ),
            vec![
                &mut fixture.payer,
                &mut fixture.token_bonding,
                &mut fixture.curve,
                &mut fixture.base_mint,
                &mut fixture.target_mint,
                &mut fixture.founder_rewards,
                &mut fixture.base_storage,
                &mut fixture.base_storage_authority,
                &mut fixture.token_program,
                &mut program_id_sysvar(),
                &mut rent_sysvar(),
            ],
        )
    }

    #[test]
    fn test_create_curve() {
        let mut fixture = get_fixture();

        assert_eq!(Ok(()), create_curve(&mut fixture));

        let res: LogCurveV0 = try_from_slice_unchecked::<LogCurveV0>(&fixture.curve.data).unwrap();
        assert_eq!(res.g, 1_000000000000_u128);
        assert_eq!(res.c, 2_000000000000_u128);
        assert_eq!(res.key, Key::BaseRelativeLogCurveV0);
    }

    #[test]
    fn test_initialize_token_bonding() {
        let mut fixture = get_fixture();
        create_curve(&mut fixture).unwrap();
        assert_eq!(Ok(()), init(&mut fixture));

        let token_bonding_res: TokenBondingV0 =
            try_from_slice_unchecked::<TokenBondingV0>(&fixture.token_bonding.data).unwrap();
        assert_eq!(token_bonding_res.founder_reward_percentage, 1000);
        assert_eq!(token_bonding_res.target_mint, fixture.target_mint_key);
        assert_eq!(token_bonding_res.base_mint, fixture.base_mint_key);
        assert_eq!(token_bonding_res.base_storage, fixture.base_storage_key);
    }

    #[test]
    fn test_price() {
        let curve = LogCurveV0 {
            key: Key::LogCurveV0,
            g: 1_000000000000,
            c: 1_000000000000,
            taylor_iterations: 1000,
            initialized: true,
        };
        let precision = InnerUint::from(5_000_000); // correct to at least 3 decimal places
        let actual = curve.price(
            &PreciseNumber::new(0_u128).unwrap(), 
            &PreciseNumber::new(0_u128).unwrap(), 
            &PreciseNumber::new(10_u128).unwrap()
        ).unwrap();
        let expected = PreciseNumber { value: InnerUint::from(16_376848000782_u128) };
        assert!(actual.almost_eq(&expected, precision));
    }

    #[test]
    fn test_invariant_price() {
        let curve = LogCurveV0 {
            key: Key::LogCurveV0,
            g: 1_000000000000,
            c: 1_000000000000,
            taylor_iterations: 100,
            initialized: true,
        };
        // Buy 10
        let first_price = curve.price(
            &PreciseNumber::new(0_u128).unwrap(), 
            &PreciseNumber::new(0_u128).unwrap(), 
            &PreciseNumber::new(10_u128).unwrap()
        ).unwrap();
        // Sell five
        let second_price = curve.price(
            &PreciseNumber::new(0_u128).unwrap(), 
            &PreciseNumber::new(5_u128).unwrap(), 
            &PreciseNumber::new(5_u128).unwrap()
        ).unwrap();
        // Sell another 5
        let third_price = curve.price(
            &PreciseNumber::new(0_u128).unwrap(), 
            &PreciseNumber::new(0_u128).unwrap(), 
            &PreciseNumber::new(5_u128).unwrap()
        ).unwrap();
        let sell_total = third_price.checked_add(&second_price).unwrap();
        
        assert!(sell_total.almost_eq(&first_price, InnerUint::from(5_000)));
    }

    #[test]
    fn test_buy() {
        let mut fixture = get_fixture();
        create_curve(&mut fixture).unwrap();
        init(&mut fixture).unwrap();

        let (purchase_authority_key, mut purchase_authority) =
            get_account(0, &fixture.token_program_id);
        let (purchase_key, mut purchase_account) = get_loaded_mint_account(
            &fixture.token_program_id,
            Account {
                mint: fixture.base_mint_key,
                owner: purchase_authority_key,
                amount: 20,
                delegate: COption::None,
                state: AccountState::Initialized,
                is_native: COption::None,
                delegated_amount: 0,
                close_authority: COption::None,
            },
        );
        let (destination_key, mut destination) = get_loaded_mint_account(
            &fixture.token_program_id,
            Account {
                mint: fixture.target_mint_key,
                owner: purchase_authority_key,
                amount: 20,
                delegate: COption::None,
                state: AccountState::Initialized,
                is_native: COption::None,
                delegated_amount: 0,
                close_authority: COption::None,
            },
        );

        let mut target_authority = SolanaAccount::new(0, 0, &fixture.program_id);
        let mut token_program = SolanaAccount::new(0, 0, &fixture.program_id);

        assert_eq!(
            Ok(()),
            do_process_instruction(
                buy_v0_instruction(
                    &fixture.program_id,
                    &fixture.token_bonding_key,
                    &fixture.curve_key,
                    &fixture.base_mint_key,
                    &fixture.target_mint_key,
                    &fixture.target_mint_authority_key,
                    &fixture.founder_rewards_key,
                    &fixture.base_storage_key,
                    &purchase_key,
                    &purchase_authority_key,
                    &destination_key,
                    &fixture.token_program_id,
                    100000000000,
                    10000000000000
                ),
                vec![
                    &mut fixture.token_bonding,
                    &mut fixture.curve,
                    &mut fixture.base_mint,
                    &mut fixture.target_mint,
                    &mut target_authority,
                    &mut fixture.founder_rewards,
                    &mut fixture.base_storage,
                    &mut purchase_account,
                    &mut purchase_authority,
                    &mut destination,
                    &mut token_program,
                    &mut program_id_sysvar()
                ],
            )
        );
    }
}
