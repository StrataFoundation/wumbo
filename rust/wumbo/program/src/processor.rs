use std::convert::TryInto;

use solana_program::instruction::AccountMeta;
use solana_program::program::{invoke, invoke_signed};
use solana_program::program_error::ProgramError;
use solana_program::system_instruction;
use spl_token::solana_program::program_pack::Pack;
use spl_token_bonding::state::{LogCurveV0, TokenBondingV0};
use spl_token_bonding::instruction::{CreateMetadataAccountArgs, freeze_buy_v0_instruction, thaw_buy_v0_instruction};

use {
    crate::{
        error::WumboError,
        instruction::WumboInstruction,
        state::{Key, UnclaimedTokenRefV0},
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
use crate::state::{BONDING_AUTHORITY_PREFIX, CLAIMED_REF_PREFIX, ClaimedTokenRefV0, FOUNDER_REWARDS_AUTHORITY_PREFIX, REVERSE_TOKEN_REF_PREFIX, UNCLAIMED_REF_PREFIX, WUMBO_PREFIX, WumboInstanceV0};
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
        WumboInstruction::InitializeSocialTokenV0 => {
            msg!("Instruction: Initialize Social Token V0");
            process_initialize_social_token(program_id, accounts)
        }
        WumboInstruction::OptOutV0 => {
            msg!("Instruction: Opt Out V0");
            process_opt(program_id,accounts, true)
        }
        WumboInstruction::OptInV0 => {
            msg!("Instruction: Opt Out V0");
            process_opt(program_id, accounts, false)
        }
        WumboInstruction::CreateTokenMetadata(args) => {
          msg!("Instruction: Create Token Metadata");
          process_create_token_metadata(program_id, accounts, args)
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

pub fn unclaimed_pda(
    program_id: &Pubkey,
    wumbo_instance: &Pubkey,
    name: &Pubkey,
) -> (Pubkey, u8) {
    let seeds: &[&[u8]] = &[
        &UNCLAIMED_REF_PREFIX.as_bytes(),
        &wumbo_instance.to_bytes(),
        &name.to_bytes(),
    ];
    Pubkey::find_program_address(seeds, program_id)
}

pub fn claimed_pda(
  program_id: &Pubkey,
  wumbo_instance: &Pubkey,
  owner: &Pubkey,
) -> (Pubkey, u8) {
  let seeds: &[&[u8]] = &[
      &CLAIMED_REF_PREFIX.as_bytes(),
      &wumbo_instance.to_bytes(),
      &owner.to_bytes(),
  ];
  Pubkey::find_program_address(seeds, program_id)
}

pub fn reverse_token_ref_key(
  program_id: &Pubkey,
  wumbo_instance: &Pubkey,
  token_bonding: &Pubkey,
) -> (Pubkey, u8) {
  let seeds: &[&[u8]] = &[
      &REVERSE_TOKEN_REF_PREFIX.as_bytes(),
      &wumbo_instance.to_bytes(),
      &token_bonding.to_bytes(),
  ];
  Pubkey::find_program_address(seeds, program_id)
}

pub fn bonding_authority(program_id: &Pubkey, token_ref: &Pubkey) -> (Pubkey, u8) {
    let seeds: &[&[u8]] = &[&BONDING_AUTHORITY_PREFIX.as_bytes(), &token_ref.to_bytes()];
    Pubkey::find_program_address(seeds, program_id)
}

pub fn founder_rewards_authority(program_id: &Pubkey, token_ref: &Pubkey) -> (Pubkey, u8) {
    let seeds: &[&[u8]] = &[
        &FOUNDER_REWARDS_AUTHORITY_PREFIX.as_bytes(),
        &token_ref.to_bytes(),
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

fn process_initialize_social_token(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let payer = next_account_info(accounts_iter)?;
    let token_ref = next_account_info(accounts_iter)?;
    let reverse_token_ref = next_account_info(accounts_iter)?;
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

    if *token_bonding.owner != spl_token_bonding::id() {
      return Err(WumboError::InvalidTokenBondingProgramId.into());
    }

    let name_specified_owner = if name.data.borrow().len() > 0 {
        let name_record_header = NameRecordHeader::unpack_from_slice(&name.data.borrow())?;
        name_record_header.owner
    } else {
        Pubkey::default()
    };


    let (reverse_token_ref_key, reverse_bump) = reverse_token_ref_key(program_id, &wumbo_instance.key, token_bonding.key);
    if reverse_token_ref_key != *reverse_token_ref.key {
        return Err(WumboError::InvalidProgramAddress.into());
    }

    let mut peekable = accounts_iter.peekable();
    let is_claimed = peekable.peek().is_some();
    // If this is the founder (they own the name), don't do anything.
    if is_claimed {
      if wumbo_instance_data.name_program_id != *name.owner {
        msg!("Name program id mismatch, was {}, expected {}", *name.owner, wumbo_instance_data.name_program_id);
        return Err(WumboError::InvalidNameProgramId.into());
      }
  
        let name_owner = next_account_info(&mut peekable)?;
        if !name_owner.is_signer {
            return Err(WumboError::MissingSigner.into());
        }

        if *name_owner.key != name_specified_owner {
            return Err(WumboError::NameOwnerMismatch.into());
        }

        let (token_ref_key, bump) = claimed_pda(program_id, &wumbo_instance.key, name_owner.key);
        if token_ref_key != *token_ref.key {
            return Err(WumboError::InvalidProgramAddress.into());
        }

        if token_ref.data.borrow().len() > 0
            && ClaimedTokenRefV0::unpack_from_slice(&token_ref.data.borrow())?.initialized
        {
            return Err(WumboError::AlreadyInitialized.into());
        }

        create_or_allocate_account_raw(
            *program_id,
            token_ref,
            rent,
            system_account_info,
            payer,
            ClaimedTokenRefV0::LEN,
            &[
                &CLAIMED_REF_PREFIX.as_bytes(),
                &wumbo_instance.key.to_bytes(),
                &name_owner.key.to_bytes(),
                &[bump],
            ],
        )?;
        create_or_allocate_account_raw(
          *program_id,
          reverse_token_ref,
          rent,
          system_account_info,
          payer,
          ClaimedTokenRefV0::LEN,
          &[
              &REVERSE_TOKEN_REF_PREFIX.as_bytes(),
              &wumbo_instance.key.to_bytes(),
              &token_bonding.key.to_bytes(),
              &[reverse_bump],
          ],
      )?;
        let new_account_data = ClaimedTokenRefV0 {
          key: Key::ClaimedTokenRefV0,
          wumbo_instance: *wumbo_instance.key,
          token_bonding: *token_bonding.key,
          owner: *name_owner.key,
          initialized: true,
        };
        new_account_data.serialize(&mut *token_ref.try_borrow_mut_data()?)?; 
        new_account_data.serialize(&mut *reverse_token_ref.try_borrow_mut_data()?)?; 
    } else {
        let (token_ref_key, bump) = unclaimed_pda(program_id, &wumbo_instance.key, &name.key);
        if token_ref_key != *token_ref.key {
            return Err(WumboError::InvalidProgramAddress.into());
        }

        // This isn't the founder. Make sure the account is owned by our program to save for later
        let (founder_rewards_authority, _) = founder_rewards_authority(program_id, token_ref.key);
        if founder_rewards_account_data.owner != founder_rewards_authority {
            msg!("Invalid founder rewards authority");
            return Err(WumboError::InvalidAuthority.into());
        }

        if token_ref.data.borrow().len() > 0
            && UnclaimedTokenRefV0::unpack_from_slice(&token_ref.data.borrow())?.initialized
        {
            return Err(WumboError::AlreadyInitialized.into());
        }

        create_or_allocate_account_raw(
            *program_id,
            token_ref,
            rent,
            system_account_info,
            payer,
            UnclaimedTokenRefV0::LEN,
            &[
                &UNCLAIMED_REF_PREFIX.as_bytes(),
                &wumbo_instance.key.to_bytes(),
                &name.key.to_bytes(),
                &[bump],
            ],
        )?;
        create_or_allocate_account_raw(
          *program_id,
          reverse_token_ref,
          rent,
          system_account_info,
          payer,
          UnclaimedTokenRefV0::LEN,
          &[
              &REVERSE_TOKEN_REF_PREFIX.as_bytes(),
              &wumbo_instance.key.to_bytes(),
              &token_bonding.key.to_bytes(),
              &[reverse_bump],
          ],
      )?;

        let new_account_data = UnclaimedTokenRefV0 {
          key: Key::UnclaimedTokenRefV0,
          wumbo_instance: *wumbo_instance.key,
          token_bonding: *token_bonding.key,
          name: *name.key,
          initialized: true,
        };
        new_account_data.serialize(&mut *token_ref.try_borrow_mut_data()?)?;  
        new_account_data.serialize(&mut *reverse_token_ref.try_borrow_mut_data()?)?;  
    }

    if wumbo_instance_data.key != Key::WumboInstanceV0 {
        return Err(ProgramError::InvalidAccountData);
    }

    if *wumbo_instance.owner != *program_id {
        return Err(WumboError::InvalidWumboInstanceOwner.into());
    }

    let (token_bonding_authority_key, _) = bonding_authority(program_id, token_ref.key);
    if token_bonding_authority_key != token_bonding_data.authority.unwrap() {
        msg!("Invalid token bonding authority");
        return Err(WumboError::InvalidAuthority.into());
    }

    if founder_rewards_account_data.mint != token_bonding_data.target_mint {
        return Err(WumboError::InvalidFounderRewardsAccountType.into());
    }

    if !payer.is_signer {
        return Err(WumboError::MissingSigner.into());
    }

    Ok(())
}

/// Verify all of the big requirements:
///   1. Token bonding belongs to ref
///   2. Signer (name owner) is the owner of name
///   3. Ref is associated with this name
///   4. Ref is part of this program id
///   5. Token bonding authority is the correct pda of ['bonding-authority', Token Ref Pubkey]
fn verify_token_ref(program_id: &Pubkey, accounts: &[AccountInfo]) -> Result<ClaimedTokenRefV0, ProgramError> {
    let accounts_iter = &mut accounts.into_iter();
    let token_ref = next_account_info(accounts_iter)?;
    let token_bonding = next_account_info(accounts_iter)?;
    let token_bonding_authority = next_account_info(accounts_iter)?;
    let owner = next_account_info(accounts_iter)?;
    let token_ref_data = ClaimedTokenRefV0::unpack_from_slice(&token_ref.data.borrow())?;
    let token_bonding_data = TokenBondingV0::unpack_from_slice(&token_bonding.data.borrow())?;
    let specified_owner = token_ref_data.owner;
    if !owner.is_signer {
        return Err(WumboError::MissingSigner.into());
    }

    if token_ref_data.key != Key::ClaimedTokenRefV0 {
      return Err(ProgramError::InvalidArgument);
    }

    if *token_bonding.key != spl_token_bonding::id() {
      return Err(WumboError::InvalidTokenBondingProgramId.into());
    }

    if token_ref_data.key != Key::UnclaimedTokenRefV0 {
        return Err(ProgramError::InvalidAccountData);
    }

    if *owner.key != specified_owner {
        return Err(WumboError::OwnerMismatch.into());
    }

    if *token_bonding.key != token_ref_data.token_bonding {
        return Err(WumboError::InavlidTokenBonding.into());
    }

    let (token_bonding_authority_key, _) = bonding_authority(program_id, &token_ref.key);
    if token_bonding_authority_key != token_bonding_data.authority.unwrap() {
        msg!("Invalid token bonding authority");
        return Err(WumboError::InvalidAuthority.into());
    }

    Ok(token_ref_data)
}

fn process_opt(program_id: &Pubkey, accounts: &[AccountInfo], opted_out: bool) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let token_ref = next_account_info(accounts_iter)?;
    let token_ref_data = verify_token_ref(program_id, accounts);
    let token_bonding = next_account_info(accounts_iter)?;
    let token_bonding_authority = next_account_info(accounts_iter)?;
    
    let (_, nonce) = bonding_authority(program_id, &token_ref.key);
    let signer_seeds = &[
        BONDING_AUTHORITY_PREFIX.as_bytes(),
        &token_ref.key.to_bytes(),
        &[nonce]
    ];
    if opted_out {
        invoke_signed(
            &freeze_buy_v0_instruction(
                &spl_token_bonding::id(),
                &token_bonding.key,
                &token_bonding_authority.key
            ),
            &[
                token_bonding.clone(),
                token_bonding_authority.clone()
            ],
            &[signer_seeds],
        )?;
    } else {
        invoke_signed(
            &thaw_buy_v0_instruction(
                &spl_token_bonding::id(),
                &token_bonding.key,
                &token_bonding_authority.key
            ),
            &[
                token_bonding.clone(),
                token_bonding_authority.clone()
            ],
            &[signer_seeds],
        )?;
    }

    Ok(())
}

fn process_create_token_metadata(program_id: &Pubkey, accounts: &[AccountInfo], args: CreateMetadataAccountArgs) -> ProgramResult {
  let accounts_iter = &mut accounts.into_iter();
  let token_ref = next_account_info(accounts_iter)?;
  let token_ref_owner = next_account_info(accounts_iter)?;
  let token_bonding = next_account_info(accounts_iter)?;
  let token_bonding_authority = next_account_info(accounts_iter)?;
  let token_bonding_program_id = next_account_info(accounts_iter)?;
  let spl_token_metadata_program_id = next_account_info(accounts_iter)?;

  // Unused except for passthrough
  let metadata_account = next_account_info(accounts_iter)?;
  let mint = next_account_info(accounts_iter)?;
  let mint_authority = next_account_info(accounts_iter)?;
  let payer = next_account_info(accounts_iter)?;
  let update_authority = next_account_info(accounts_iter)?;

  let token_bonding_data = TokenBondingV0::unpack_from_slice(&token_bonding.data.borrow())?;
  let token_ref_data = ClaimedTokenRefV0::unpack_from_slice(&token_ref.data.borrow())?;

  if *token_bonding.owner != spl_token_bonding::id() || *token_bonding_program_id.key != spl_token_bonding::id() {
    return Err(WumboError::InvalidTokenBondingProgramId.into());
  }

  if *token_ref_owner.key != token_ref_data.owner {
    return Err(WumboError::InvalidTokenRefOwner.into())
  }

  if *token_ref.owner != *program_id {
    return Err(ProgramError::IncorrectProgramId)
  }

  let (token_bonding_authority_key, nonce) = bonding_authority(program_id, token_ref.key);
  if token_bonding_authority_key != token_bonding_data.authority.unwrap() {
      msg!("Invalid token bonding authority");
      return Err(WumboError::InvalidAuthority.into());
  }

  if !token_ref_owner.is_signer {
    return Err(WumboError::MissingSigner.into());
  }

  let signer_seeds = &[
      BONDING_AUTHORITY_PREFIX.as_bytes(),
      &token_ref.key.to_bytes(),
      &[nonce]
  ];
  
  invoke_signed(
    &spl_token_bonding::instruction::create_metadata_accounts(
      *token_bonding_program_id.key,
      *token_bonding.key,
      *token_bonding_authority.key,
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
      token_bonding_program_id.clone(),
      token_bonding.clone(),
      token_bonding_authority.clone(),
      spl_token_metadata_program_id.clone(),
      metadata_account.clone(),
      mint.clone(),
      mint_authority.clone(),
      payer.clone(),
      update_authority.clone()
    ],
    &[signer_seeds],
  )?;

  return Ok(())
}