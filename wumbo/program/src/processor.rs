use std::convert::TryInto;

use solana_program::program::{invoke, invoke_signed};
use solana_program::system_instruction;
use spl_token::solana_program::program_pack::Pack;
use spl_token_bonding::state::{LogCurveV0, TokenBondingV0};
use spl_token_bonding::instruction::{freeze_buy_v0_instruction, thaw_buy_v0_instruction};

use {
    crate::{
        error::WumboError,
        instruction::WumboInstruction,
        state::{Key, WumboCreatorV0},
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
    spl_token::state::Account,
};

use crate::solana_program::sysvar::Sysvar;
use crate::state::{
    WumboInstanceV0, BONDING_AUTHORITY_PREFIX, CREATOR_PREFIX, FOUNDER_REWARDS_AUTHORITY_PREFIX,
    WUMBO_PREFIX,
};
use spl_name_service::state::NameRecordHeader;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    msg!("Input {}", String::from_utf8_lossy(input));
    let instruction = WumboInstruction::try_from_slice(input)?;
    match instruction {
        WumboInstruction::InitializeWumboV0 { name_program_id } => {
            msg!("Instruction: Initialize Wumbo V0");
            process_initialize_wumbo(program_id, accounts, name_program_id)
        }
        WumboInstruction::InitializeCreatorV0 => {
            msg!("Instruction: Initialize Creator V0");
            process_initialize_creator(program_id, accounts)
        }
        WumboInstruction::OptOutV0 => {
            msg!("Instruction: Opt Out V0")
            process_opt(program_id, true)
        }
        WumboInstruction::OptInV0 => {
            msg!("Instruction: Opt Out V0")
            process_opt(program_id, false)
        }
    }
}

/// Unpacks a spl_token `Account`.
pub fn unpack_token_account(
    account_info: &AccountInfo,
    token_program_id: &Pubkey,
) -> Result<spl_token::state::Account, WumboError> {
    if account_info.owner != token_program_id {
        Err(WumboError::InvalidTokenProgramId)
    } else {
        spl_token::state::Account::unpack(&account_info.data.borrow())
            .map_err(|_| WumboError::ExpectedAccount)
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

pub fn wumbo_authority(program_id: &Pubkey, wumbo_mint: &Pubkey) -> (Pubkey, u8) {
    let seeds: &[&[u8]] = &[&WUMBO_PREFIX.as_bytes(), &wumbo_mint.to_bytes()];
    Pubkey::find_program_address(seeds, program_id)
}

pub fn creator_authority(
    program_id: &Pubkey,
    wumbo_instance: &Pubkey,
    name: &Pubkey,
) -> (Pubkey, u8) {
    let seeds: &[&[u8]] = &[
        &CREATOR_PREFIX.as_bytes(),
        &wumbo_instance.to_bytes(),
        &name.to_bytes(),
    ];
    Pubkey::find_program_address(seeds, program_id)
}

pub fn bonding_authority(program_id: &Pubkey, creator: &Pubkey) -> (Pubkey, u8) {
    let seeds: &[&[u8]] = &[&BONDING_AUTHORITY_PREFIX.as_bytes(), &creator.to_bytes()];
    Pubkey::find_program_address(seeds, program_id)
}

pub fn founder_rewards_authority(program_id: &Pubkey, creator: &Pubkey) -> (Pubkey, u8) {
    let seeds: &[&[u8]] = &[
        &FOUNDER_REWARDS_AUTHORITY_PREFIX.as_bytes(),
        &creator.to_bytes(),
    ];
    Pubkey::find_program_address(seeds, program_id)
}

fn process_initialize_wumbo(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name_program_id: Pubkey,
) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let payer = next_account_info(accounts_iter)?;
    let wumbo_instance = next_account_info(accounts_iter)?;
    let wumbo_mint = next_account_info(accounts_iter)?;
    let base_curve = next_account_info(accounts_iter)?;
    let system_account_info = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;

    let (wumbo_instance_key, bump) = wumbo_authority(program_id, wumbo_mint.key);
    if wumbo_instance_key != *wumbo_instance.key {
        return Err(WumboError::InvalidProgramAddress.into());
    }

    if wumbo_instance.data.borrow().len() > 0
        && WumboInstanceV0::unpack_from_slice(&wumbo_instance.data.borrow())?.initialized
    {
        return Err(WumboError::AlreadyInitialized.into());
    }

    // Make surer that we can unpack base curve as an actual curve
    LogCurveV0::unpack_from_slice(&base_curve.data.borrow())?;

    create_or_allocate_account_raw(
        *program_id,
        wumbo_instance,
        rent,
        system_account_info,
        payer,
        WumboInstanceV0::LEN,
        &[
            &WUMBO_PREFIX.as_bytes(),
            &wumbo_mint.key.to_bytes(),
            &[bump],
        ],
    )?;

    let result = WumboInstanceV0 {
        key: Key::WumboInstanceV0,
        wumbo_mint: *wumbo_mint.key,
        base_curve: *base_curve.key,
        name_program_id,
        initialized: true,
    };

    result.pack_into_slice(&mut wumbo_instance.data.borrow_mut());

    Ok(())
}

fn process_initialize_creator(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let payer = next_account_info(accounts_iter)?;
    let creator = next_account_info(accounts_iter)?;
    let wumbo_instance = next_account_info(accounts_iter)?;
    let name = next_account_info(accounts_iter)?;
    let founder_rewards_account = next_account_info(accounts_iter)?;
    let token_bonding = next_account_info(accounts_iter)?;
    let system_account_info = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;

    let token_bonding_data = TokenBondingV0::unpack_from_slice(&token_bonding.data.borrow())?;
    let wumbo_instance_data = WumboInstanceV0::unpack_from_slice(&wumbo_instance.data.borrow())?;
    let founder_rewards_account_data = Account::unpack(&founder_rewards_account.data.borrow())?;

    if token_bonding_data.curve != wumbo_instance_data.base_curve {
        return Err(WumboError::InvalidCurve.into());
    }

    let name_specified_owner = if name.data.borrow().len() > 0 {
        let name_record_header = NameRecordHeader::unpack_from_slice(&name.data.borrow())?;
        name_record_header.owner
    } else {
        Pubkey::default()
    };

    // If this is the founder (they own the name), don't do anything.
    if accounts_iter.peekable().peek().is_some() {
        let name_owner = next_account_info(accounts_iter)?;
        if !name_owner.is_signer {
            return Err(WumboError::MissingSigner.into());
        }

        if *name_owner.key != name_specified_owner {
            return Err(WumboError::NameOwnerMismatch.into());
        }
    } else {
        // This isn't the founder. Make sure the account is owned by our program to save for later
        let (founder_rewards_authority, _) = founder_rewards_authority(program_id, creator.key);
        if founder_rewards_account_data.owner != founder_rewards_authority {
            msg!("Invalid founder rewards authority");
            return Err(WumboError::InvalidAuthority.into());
        }
    }

    let (creator_key, bump) = creator_authority(program_id, &wumbo_instance.key, &name.key);
    if creator_key != *creator.key {
        return Err(WumboError::InvalidProgramAddress.into());
    }

    if creator.data.borrow().len() > 0
        && WumboCreatorV0::unpack_from_slice(&creator.data.borrow())?.initialized
    {
        return Err(WumboError::AlreadyInitialized.into());
    }

    create_or_allocate_account_raw(
        *program_id,
        creator,
        rent,
        system_account_info,
        payer,
        WumboCreatorV0::LEN,
        &[
            &CREATOR_PREFIX.as_bytes(),
            &wumbo_instance.key.to_bytes(),
            &name.key.to_bytes(),
            &[bump],
        ],
    )?;

    if wumbo_instance_data.key != Key::WumboInstanceV0 {
        return Err(ProgramError::InvalidAccountData);
    }

    if *wumbo_instance.owner != *program_id {
        return Err(WumboError::InvalidWumboInstanceOwner.into());
    }

    let (token_bonding_authority_key, _) = bonding_authority(program_id, &creator.key);
    if token_bonding_authority_key != token_bonding_data.authority {
        msg!("Invalid token bonding authority");
        return Err(WumboError::InvalidAuthority.into());
    }

    if founder_rewards_account_data.mint != token_bonding_data.target_mint {
        return Err(WumboError::InvalidFounderRewardsAccountType.into());
    }

    if !payer.is_signer {
        return Err(WumboError::MissingSigner.into());
    }

    let new_account_data = WumboCreatorV0 {
        key: Key::WumboCreatorV0,
        wumbo_instance: *wumbo_instance.key,
        token_bonding: *token_bonding.key,
        name: *name.key,
        initialized: true,
    };
    new_account_data.serialize(&mut *creator.try_borrow_mut_data()?)?;

    Ok(())
}

/// Verify all of the big requirements:
///   1. Token bonding belongs to creator
///   2. Signer (name owner) is the owner of name
///   3. Creator is associated with this name
///   4. Creator is part of this program id
///   5. Token bonding authority is the correct pda of ['bonding-authority', Creator Pubkey]
fn verify_creator(accounts &[AccountInfo]): Result<WumboCreatorV0, ProgramError> {
    let accounts_iter = &mut accounts.into_iter();
    let creator = next_account_info(accounts_iter)?;
    let token_bonding = next_account_info(accounts_iter)?;
    let token_bonding_authority = next_account_info(accounts_iter)?;
    let name = next_account_info(accounts_iter)?;
    let name_owner = next_account_info(accounts_iter)?;
    let creator_data = WumboCreatorV0::unpack_from_slice(&creator.data.borrow())?;
    let name_record_header = NameRecordHeader::unpack_from_slice(&name.data.borrow())?;
    let name_specified_owner = name_record_header.owner
    if !name_owner.is_signer {
        return Err(WumboError::MissingSigner.into());
    }

    if creator_data.key != Key::WumboCreatorV0 {
        return Err(ProgramError::InvalidAccountData);
    }

    if *name_owner.key != name_specified_owner {
        return Err(WumboError::NameOwnerMismatch.into());
    }

    if *token_bonding.key != creator.token_bonding {
        return Err(WumboError::InavlidTokenBonding.into());
    }

    if creator.name != *name.key {
        return Err(WumboError::InvalidName.into());
    }

    let (token_bonding_authority_key, _) = bonding_authority(program_id, &creator.key);
    if token_bonding_authority_key != token_bonding_data.authority {
        msg!("Invalid token bonding authority");
        return Err(WumboError::InvalidAuthority.into());
    }

    Ok(creator_data)
}

fn process_opt(program_id: &Pubkey, accounts: &[AccountInfo], opted_out: bool) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let creator = next_account_info(accounts_iter)?;
    let creator_data = verify_creator(accounts);
    let token_bonding = next_account_info(accounts_iter)?;
    let token_bonding_authority = next_account_info(accounts_iter)?;
    
    let (_, nonce) = bonding_authority(program_id, &creator.key);
    let signer_seeds = &[
        &BONDING_AUTHORITY_PREFIX.as_bytes(),
        &creator.key.to_bytes(),
        &[nonce]
    ];
    if opted_out {
        invoke_signed(
            &freeze_buy_v0_instruction(
                spl_token_bonding::id(),
                &token_bonding.key,
                &token_bonding_authority.key
            ),
            &[
                token_bonding.clone(),
                &token_bonding_authority.clone()
            ]
            &[&signer_seeds],
        )?;
    } else {
        invoke_signed(
            &thaw_buy_v0_instruction(
                spl_token_bonding::id(),
                &token_bonding.key,
                &token_bonding_authority.key
            ),
            &[
                token_bonding.clone(),
                &token_bonding_authority.clone()
            ]
            &[&signer_seeds],
        )?;
    }

    Ok(())
}
