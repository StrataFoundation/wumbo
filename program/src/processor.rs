use std::convert::TryInto;
use std::ops::DerefMut;

use num_traits::{Pow, ToPrimitive};
use solana_program::program::{invoke, invoke_signed};
use solana_program::program_error::ProgramError;
use solana_program::program_pack::IsInitialized;
use solana_program::system_instruction;
use solana_program::system_instruction::create_account;
use spl_name_service::state::NameRecordHeader;
use spl_token::native_mint;
use spl_token::solana_program::program_pack::Pack;

use {
    crate::{
        error::SolcloutError,
        instruction::SolcloutInstruction,
        state::{Key, SolcloutCreator},
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

use crate::solana_program::sysvar::Sysvar;
use crate::state::SolcloutInstance;

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    msg!("Input {}", String::from_utf8_lossy(input));
    let instruction = SolcloutInstruction::try_from_slice(input)?;
    match instruction {
        SolcloutInstruction::InitializeSolclout {
            token_program_id,
            name_program_id,
            nonce,
        } => {
            msg!("Instruction: Initialize Solclout");
            process_initialize_solclout(
                program_id,
                accounts,
                token_program_id,
                name_program_id,
                nonce,
            )
        }
        SolcloutInstruction::InitializeCreator {
            founder_reward_percentage,
            nonce,
        } => {
            msg!("Instruction: Initialize Creator");
            process_initialize_creator(program_id, accounts, founder_reward_percentage, nonce)
        }
        SolcloutInstruction::BuyCreatorCoins { lamports } => {
            msg!("Instruction: Buy Creator Coins");
            process_buy_creator_coins(program_id, accounts, lamports)
        }
        SolcloutInstruction::SellCreatorCoins { lamports } => {
            msg!("Instruction: Sell Creator Coins");
            process_sell_creator_coins(program_id, accounts, lamports)
        }
    }
}

/// Unpacks a spl_token `Account`.
pub fn unpack_token_account(
    account_info: &AccountInfo,
    token_program_id: &Pubkey,
) -> Result<spl_token::state::Account, SolcloutError> {
    if account_info.owner != token_program_id {
        Err(SolcloutError::InvalidTokenProgramId)
    } else {
        spl_token::state::Account::unpack(&account_info.data.borrow())
            .map_err(|_| SolcloutError::ExpectedAccount)
    }
}

/// Calculates the authority id by generating a program address.
pub fn authority_id(
    program_id: &Pubkey,
    source_id: &Pubkey,
    nonce: u8,
) -> Result<Pubkey, SolcloutError> {
    Pubkey::create_program_address(&[&source_id.to_bytes()[..32], &[nonce]], program_id)
        .or(Err(SolcloutError::InvalidProgramAddress))
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

fn process_initialize_solclout(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    token_program_id: Pubkey,
    name_program_id: Pubkey,
    nonce: u8,
) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let payer = next_account_info(accounts_iter)?;
    let solclout = next_account_info(accounts_iter)?;
    let solclout_storage_acc = next_account_info(accounts_iter)?;
    let authority_key = authority_id(program_id, solclout.key, nonce)?;
    let solclout_storage = unpack_token_account(solclout_storage_acc, &token_program_id)?;
    let system_account_info = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;

    if solclout_storage.owner != authority_key {
        return Err(SolcloutError::InvalidStorageOwner.into());
    }

    let (solclout_key, bump) =
        Pubkey::find_program_address(&[&solclout_storage.mint.to_bytes()[..32]], program_id);
    if solclout_key != *solclout.key {
        return Err(SolcloutError::InvalidProgramAddress.into());
    }

    if solclout.data.borrow().len() > 0
        && SolcloutInstance::unpack_from_slice(&solclout.data.borrow())?.initialized
    {
        return Err(SolcloutError::AlreadyInitialized.into());
    }

    create_or_allocate_account_raw(
        *program_id,
        solclout,
        rent,
        system_account_info,
        payer,
        SolcloutInstance::LEN,
        &[&solclout_storage.mint.to_bytes()[..32], &[bump]],
    )?;

    let solclout_instance = SolcloutInstance {
        key: Key::SolcloutInstanceV1,
        solclout_token: solclout_storage.mint,
        solclout_storage: *solclout_storage_acc.key,
        token_program_id,
        name_program_id,
        initialized: true,
    };

    solclout_instance.pack_into_slice(&mut solclout.data.borrow_mut());

    Ok(())
}

fn process_initialize_creator(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    founder_reward_percentage: u16,
    nonce: u8,
) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let payer = next_account_info(accounts_iter)?;
    let mut account = next_account_info(accounts_iter)?;
    let solclout_instance = next_account_info(accounts_iter)?;
    let name_account = next_account_info(accounts_iter)?;
    let solclout_instance_data: SolcloutInstance =
        try_from_slice_unchecked(&solclout_instance.data.borrow())?;

    let founder_rewards_account = next_account_info(accounts_iter)?;
    let founder_rewards_account_data = Account::unpack(&founder_rewards_account.data.borrow())?;
    let authority = authority_id(program_id, account.key, nonce)?;
    let creator_mint = next_account_info(accounts_iter)?;
    let system_account_info = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;

    let name_account_owner = if name_account.data.borrow().len() > 0 {
        let name_record_header = NameRecordHeader::unpack_from_slice(&name_account.data.borrow())?;
        name_record_header.owner
    } else {
        Pubkey::default()
    };

    let (account_key, bump) = Pubkey::find_program_address(
        &[
            &solclout_instance.key.to_bytes()[..32],
            &name_account.key.to_bytes()[..32],
        ],
        program_id,
    );
    if account_key != *account.key {
        return Err(SolcloutError::InvalidProgramAddress.into());
    }

    if account.data.borrow().len() > 0
        && SolcloutCreator::unpack_from_slice(&account.data.borrow())?.initialized
    {
        return Err(SolcloutError::AlreadyInitialized.into());
    }

    create_or_allocate_account_raw(
        *program_id,
        account,
        rent,
        system_account_info,
        payer,
        SolcloutCreator::LEN,
        &[
            &solclout_instance.key.to_bytes()[..32],
            &name_account.key.to_bytes()[..32],
            &[bump],
        ],
    )?;

    let rewards_owned_by_founder = founder_rewards_account_data.owner == name_account_owner;
    let rewards_owned_by_program = founder_rewards_account_data.owner == authority;
    if !(rewards_owned_by_founder | rewards_owned_by_program) {
        return Err(SolcloutError::InvalidFounderRewardsOwner.into());
    }

    if *solclout_instance.owner != *program_id {
        return Err(SolcloutError::InvalidSolcloutInstanceOwner.into());
    }

    if *creator_mint.owner != solclout_instance_data.token_program_id {
        return Err(SolcloutError::AccountWrongTokenProgram.into());
    }

    let creator_mint_data = Mint::unpack(*creator_mint.data.borrow())?;
    if creator_mint_data.mint_authority.unwrap() != authority {
        return Err(SolcloutError::InvalidMintAuthority.into());
    }

    if creator_mint_data.freeze_authority.unwrap() != authority {
        return Err(SolcloutError::InvalidFreezeAuthority.into());
    }

    if try_from_slice_unchecked::<SolcloutCreator>(&account.data.borrow())?.initialized {
        return Err(SolcloutError::AlreadyInitialized.into());
    }

    if *founder_rewards_account.owner != solclout_instance_data.token_program_id {
        return Err(SolcloutError::AccountWrongTokenProgram.into());
    }

    if founder_rewards_account_data.mint != *creator_mint.key {
        return Err(SolcloutError::InvalidFounderRewardsAccountType.into());
    }

    if !payer.is_signer {
        return Err(SolcloutError::MissingSigner.into());
    }

    let new_account_data = SolcloutCreator {
        key: Key::SolcloutCreatorV1,
        creator_token: *creator_mint.key,
        solclout_instance: *solclout_instance.key,
        founder_rewards_account: *founder_rewards_account.key,
        name: *name_account.key,
        founder_reward_percentage,
        initialized: true,
        authority_nonce: nonce,
    };
    new_account_data.serialize(&mut *account.try_borrow_mut_data()?)?;

    Ok(())
}

/// Price is 0.003 * supply^2.
/// But since we're buying multiple, the total price is
/// Intregral[(curr_supply, end_supply), 0.003 * supply^2.]
/// This is 0.001 * (end_supply^3 - curr_supply^3)
/// Since both are in lamports, we need to divide again by lamports^3 then multiply by lamports
/// to get back to lamports output.
fn price(supply: u64, lamports: u64) -> u64 {
    let lamports_conf = 10_f64.powi(native_mint::DECIMALS as i32);
    let supplyF: f64 = supply.to_f64().unwrap() / lamports_conf;
    let lamportsF = lamports.to_f64().unwrap() / lamports_conf;
    let numerator: f64 = ((lamportsF + supplyF).powi(3_i32) - supplyF.powi(3_i32));
    let denominator: f64 = 1000_f64;
    ((numerator / denominator) * lamports_conf)
        .to_u64()
        .unwrap()
}

fn process_buy_creator_coins(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    lamports: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let solclout_instance = next_account_info(accounts_iter)?;
    let creator = next_account_info(accounts_iter)?;
    let creator_mint = next_account_info(accounts_iter)?;
    let creator_mint_authority = next_account_info(accounts_iter)?;
    let solclout_storage_acc = next_account_info(accounts_iter)?;
    let founder_rewards_acc = next_account_info(accounts_iter)?;
    let purchase_account = next_account_info(accounts_iter)?;
    let purchase_authority = next_account_info(accounts_iter)?;
    let destination = next_account_info(accounts_iter)?;
    let token_program_id = next_account_info(accounts_iter)?;
    let creator_mint_data = Mint::unpack(*creator_mint.data.borrow())?;

    let solclout_instance_data: SolcloutInstance =
        try_from_slice_unchecked(*solclout_instance.data.borrow())?;
    let creator_data: SolcloutCreator = try_from_slice_unchecked(*creator.data.borrow())?;
    let creator_mint_key = creator_data.creator_token;
    let authority_key = authority_id(program_id, creator.key, creator_data.authority_nonce)?;

    if *token_program_id.key != solclout_instance_data.token_program_id {
        return Err(SolcloutError::InvalidTokenProgramId.into());
    }

    if creator_mint_key != *creator_mint.key {
        return Err(SolcloutError::InvalidCreatorMint.into());
    }

    if creator_data.solclout_instance != *solclout_instance.key {
        return Err(SolcloutError::SolcloutInstanceMismatch.into());
    }

    if *creator.owner != *program_id {
        return Err(SolcloutError::InvalidCreatorOwner.into());
    }

    if *solclout_instance.owner != *program_id {
        return Err(SolcloutError::InvalidSolcloutInstanceOwner.into());
    }

    if *solclout_storage_acc.key != solclout_instance_data.solclout_storage {
        return Err(SolcloutError::InvalidSolcloutStorage.into());
    }

    if creator_data.founder_rewards_account != *founder_rewards_acc.key {
        return Err(SolcloutError::InvalidFounderRewardsAccount.into());
    }

    let price = price(creator_mint_data.supply, lamports);

    let founder_cut = lamports * (creator_data.founder_reward_percentage as u64) / 10000;
    let purchaser_cut = lamports - founder_cut;

    msg!(
        "Attempting to buy {} creator lamports for {} solclout lamports",
        lamports,
        price
    );
    msg!("Paying into solclout storage");
    let pay_money = spl_token::instruction::transfer(
        &token_program_id.key,
        purchase_account.key,
        solclout_storage_acc.key,
        purchase_authority.key,
        &[],
        price,
    )?;
    invoke_signed(
        &pay_money,
        &[
            purchase_account.clone(),
            solclout_storage_acc.clone(),
            purchase_authority.clone(),
            token_program_id.clone(),
        ],
        &[],
    )?;
    msg!("Done");
    let authority_seed = &[
        &creator.key.to_bytes()[..32],
        &[creator_data.authority_nonce],
    ];
    // Mint the required lamports
    msg!("Paying founder {} creator lamports", founder_cut);
    msg!(
        "Accs {} {} {}",
        token_program_id.key,
        creator_mint_key,
        founder_rewards_acc.key
    );
    let give_founder_cut = spl_token::instruction::mint_to(
        &token_program_id.key,
        &creator_mint_key,
        &founder_rewards_acc.key,
        &creator_mint_authority.key,
        &[],
        founder_cut,
    )?;
    invoke_signed(
        &give_founder_cut,
        &[
            token_program_id.clone(),
            creator_mint.clone(),
            founder_rewards_acc.clone(),
            creator_mint_authority.clone(),
        ],
        &[authority_seed],
    )?;
    msg!("Done");

    msg!("Receiving  {} creator lamports", purchaser_cut);
    let give_purchaser_cut = spl_token::instruction::mint_to(
        &token_program_id.key,
        &creator_mint_key,
        &destination.key,
        &creator_mint_authority.key,
        &[],
        purchaser_cut,
    )?;
    invoke_signed(
        &give_purchaser_cut,
        &[
            token_program_id.clone(),
            creator_mint.clone(),
            destination.clone(),
            creator_mint_authority.clone(),
        ],
        &[authority_seed],
    )?;

    Ok(())
}

fn process_sell_creator_coins(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    lamports: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.into_iter();
    let solclout_instance = next_account_info(accounts_iter)?;
    let creator = next_account_info(accounts_iter)?;
    let creator_mint = next_account_info(accounts_iter)?;
    let solclout_storage_acc = next_account_info(accounts_iter)?;
    let solclout_storage_authority = next_account_info(accounts_iter)?;
    let sell_account = next_account_info(accounts_iter)?;
    let sell_authority = next_account_info(accounts_iter)?;
    let destination = next_account_info(accounts_iter)?;
    let token_program_id = next_account_info(accounts_iter)?;
    let creator_mint_data = Mint::unpack(*creator_mint.data.borrow())?;

    let solclout_instance_data: SolcloutInstance =
        try_from_slice_unchecked(*solclout_instance.data.borrow())?;
    let creator_data: SolcloutCreator = try_from_slice_unchecked(*creator.data.borrow())?;
    let creator_mint_key = creator_data.creator_token;

    let (solclout_storage_authority_key, nonce) =
        Pubkey::find_program_address(&[&solclout_instance.key.to_bytes()[..32]], program_id);

    if *solclout_storage_authority.key != solclout_storage_authority_key {
        return Err(SolcloutError::InvalidAuthority.into());
    }

    if *token_program_id.key != solclout_instance_data.token_program_id {
        return Err(SolcloutError::InvalidTokenProgramId.into());
    }

    if creator_mint_key != *creator_mint.key {
        return Err(SolcloutError::InvalidCreatorMint.into());
    }

    if creator_data.solclout_instance != *solclout_instance.key {
        return Err(SolcloutError::SolcloutInstanceMismatch.into());
    }

    if *creator.owner != *program_id {
        return Err(SolcloutError::InvalidCreatorOwner.into());
    }

    if *solclout_instance.owner != *program_id {
        return Err(SolcloutError::InvalidSolcloutInstanceOwner.into());
    }

    if *solclout_storage_acc.key != solclout_instance_data.solclout_storage {
        return Err(SolcloutError::InvalidSolcloutStorage.into());
    }

    let reclaimed_amount = price(creator_mint_data.supply - lamports, lamports);

    msg!(
        "Attempting to burn {} creator lamports for {} solclout lamports",
        lamports,
        reclaimed_amount
    );
    msg!("Paying from solclout storage");
    let pay_money = spl_token::instruction::transfer(
        &token_program_id.key,
        solclout_storage_acc.key,
        destination.key,
        solclout_storage_authority.key,
        &[],
        reclaimed_amount,
    )?;
    let authority_seed = &[&solclout_instance.key.to_bytes()[..32], &[nonce]];
    invoke_signed(
        &pay_money,
        &[
            destination.clone(),
            solclout_storage_acc.clone(),
            solclout_storage_authority.clone(),
            token_program_id.clone(),
        ],
        &[authority_seed],
    )?;
    msg!("Done");
    // Burn the required lamports
    msg!("Burning  {} creator lamports", lamports);
    let burn = spl_token::instruction::burn(
        &token_program_id.key,
        &sell_account.key,
        &creator_mint.key,
        &sell_authority.key,
        &[],
        lamports,
    )?;
    invoke_signed(
        &burn,
        &[
            token_program_id.clone(),
            sell_account.clone(),
            creator_mint.clone(),
            sell_authority.clone(),
        ],
        &[],
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use solana_program::rent::Rent;
    use solana_program::{
        account_info::IntoAccountInfo, clock::Epoch, instruction::Instruction, sysvar::rent,
    };
    use solana_sdk::account::{
        create_account_for_test, create_is_signer_account_infos, Account as SolanaAccount,
        ReadableAccount,
    };
    use solana_sdk::program_option::COption;
    use solana_sdk::signature::Keypair;
    use spl_name_service::state::NameRecordHeader;
    use spl_token::solana_program::program_pack::Pack;
    use spl_token::state::AccountState;

    use crate::instruction::*;

    use super::*;

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

    fn rent_sysvar() -> SolanaAccount {
        create_account_for_test(&Rent::default())
    }

    fn program_id_sysvar() -> SolanaAccount {
        create_account_for_test(&Rent::default())
    }

    fn get_account(space: usize, owner: &Pubkey) -> (Pubkey, SolanaAccount) {
        let key = Pubkey::new_unique();
        (key, SolanaAccount::new(0, space, owner))
    }

    fn initialize_spl_account(
        account: &mut SolanaAccount,
        token_program_id: &Pubkey,
        mint: &Pubkey,
        owner: &Pubkey,
    ) {
        let mut account_data = vec![0; Account::get_packed_len()];
        Account::pack(
            Account {
                mint: *mint,
                owner: *owner,
                amount: 0,
                delegate: COption::None,
                state: AccountState::Initialized,
                is_native: COption::None,
                delegated_amount: 0,
                close_authority: COption::None,
            },
            &mut account_data,
        );
        account.data = account_data;
    }

    #[test]
    fn test_initialize_solclout() {
        let name_program_id = Pubkey::new_unique();
        let program_id = Pubkey::new_unique();
        let payer_key = Pubkey::new_unique();
        let mut payer = SolanaAccount::new(100000, 0, &program_id);
        let (mint_key, mut mint) = get_account(SolcloutInstance::LEN as usize, &program_id);
        let (instance_key, _) =
            Pubkey::find_program_address(&[&mint_key.to_bytes()[..32]], &program_id);
        let mut instance = SolanaAccount::new(0, SolcloutInstance::LEN, &program_id);
        let account_seeds = &[&instance_key.to_bytes()[..32]];
        let (authority_key, nonce) = Pubkey::find_program_address(account_seeds, &program_id);
        let token_program_id = Pubkey::new_unique();
        let (account_key, mut account) = get_account(Account::LEN as usize, &token_program_id);
        initialize_spl_account(&mut account, &token_program_id, &mint_key, &authority_key);

        assert_eq!(
            Ok(()),
            do_process_instruction(
                initialize_solclout(
                    &program_id,
                    &payer_key,
                    &instance_key,
                    &account_key,
                    &token_program_id,
                    &name_program_id,
                    nonce
                ),
                vec![
                    &mut payer,
                    &mut instance,
                    &mut account,
                    &mut program_id_sysvar(),
                    &mut rent_sysvar()
                ],
            )
        );

        let mut instance_data: SolcloutInstance =
            try_from_slice_unchecked::<SolcloutInstance>(&instance.data).unwrap();
        assert_eq!(instance_data.token_program_id, token_program_id);
        assert_eq!(instance_data.name_program_id, name_program_id);
        assert_eq!(instance_data.initialized, true);
        assert_eq!(instance_data.solclout_storage, account_key);
        assert_eq!(instance_data.solclout_token, mint_key);
    }

    #[test]
    fn test_initialize_creator() {
        let program_id = Pubkey::new_unique();
        let name_program_id = Pubkey::new_unique();
        let payer_key = Pubkey::new_unique();
        let mut payer = SolanaAccount::new(100000, 0, &program_id);

        let solclout_instance_key = Pubkey::new_unique();
        let mut solclout_instance =
            SolanaAccount::new(0, SolcloutInstance::LEN as usize, &program_id);
        let (name_key, mut name) = get_account(NameRecordHeader::LEN, &name_program_id);
        let (account_key, _) = Pubkey::find_program_address(
            &[
                &solclout_instance_key.to_bytes()[..32],
                &name_key.to_bytes()[..32],
            ],
            &program_id,
        );
        let mut account = SolanaAccount::new(0, SolcloutCreator::LEN as usize, &program_id);
        let token_program_id = Pubkey::new_unique();
        let founder_rewards_account_key = Pubkey::new_unique();
        let mut founder_rewards_account = SolanaAccount::new(0, 0, &token_program_id);
        let (authority_key, nonce) =
            Pubkey::find_program_address(&[&account_key.to_bytes()[..32]], &program_id);
        let creator_mint_key = Pubkey::new_unique();
        let mut creator_mint = SolanaAccount::new(0, Mint::LEN as usize, &token_program_id);
        let solclout_instance_data = SolcloutInstance {
            key: Key::SolcloutInstanceV1,
            solclout_token: Pubkey::new_unique(),
            solclout_storage: Pubkey::new_unique(),
            name_program_id,
            token_program_id,
            initialized: true,
        };
        let mut new_data = solclout_instance_data.try_to_vec().unwrap();
        solclout_instance.data = new_data;

        let mut creator_mint_data = vec![0; Mint::get_packed_len()];
        Mint::pack(
            Mint {
                mint_authority: COption::Some(authority_key),
                supply: 20,
                decimals: 5,
                is_initialized: true,
                freeze_authority: COption::Some(authority_key),
            },
            &mut creator_mint_data,
        );
        creator_mint.data = creator_mint_data;
        let mut founder_rewards_account_data = vec![0; Account::get_packed_len()];
        Account::pack(
            Account {
                mint: creator_mint_key,
                owner: authority_key,
                amount: 20,
                delegate: COption::None,
                state: AccountState::Initialized,
                is_native: COption::None,
                delegated_amount: 0,
                close_authority: COption::None,
            },
            &mut founder_rewards_account_data,
        );
        founder_rewards_account.data = founder_rewards_account_data;
        let acc = Account::unpack(&founder_rewards_account.data).unwrap();

        assert_eq!(
            Ok(()),
            do_process_instruction(
                initialize_creator(
                    &program_id,
                    &payer_key,
                    &account_key,
                    &solclout_instance_key,
                    &name_key,
                    &founder_rewards_account_key,
                    &creator_mint_key,
                    1000,
                    nonce
                ),
                vec![
                    &mut payer,
                    &mut account,
                    &mut solclout_instance,
                    &mut name,
                    &mut founder_rewards_account,
                    &mut creator_mint,
                    &mut program_id_sysvar(),
                    &mut rent_sysvar()
                ],
            )
        );

        let mut solclout_account: SolcloutCreator =
            try_from_slice_unchecked::<SolcloutCreator>(&account.data).unwrap();
        assert_eq!(solclout_account.founder_reward_percentage, 1000);
        assert_eq!(solclout_account.solclout_instance, solclout_instance_key);
        assert_eq!(solclout_account.creator_token, creator_mint_key);
        assert_eq!(
            solclout_account.founder_rewards_account,
            founder_rewards_account_key
        );
        assert_eq!(solclout_account.name, name_key);
    }

    #[test]
    fn test_price() {
        assert_eq!(price(0, 1000000000), 1000000);
        assert_eq!(price(1000000000, 1000000000), 7000000);
        assert_eq!(price(10001 * 10_u64.pow(9), 10000), 3000599975);
    }

    #[test]
    fn test_buy() {
        let name_program_id = Pubkey::new_unique();
        let program_id = Pubkey::new_unique();
        let (token_program_id, mut token_program) = get_account(0, &program_id);
        let (solclout_instance_key, mut solclout_instance) =
            get_account(SolcloutInstance::LEN, &program_id);
        let (solclout_storage_key, mut solclout_storage) = get_account(Account::LEN, &program_id);
        let solclout_instance_data = SolcloutInstance {
            key: Key::SolcloutInstanceV1,
            solclout_token: Pubkey::new_unique(),
            solclout_storage: solclout_storage_key,
            name_program_id,
            token_program_id,
            initialized: true,
        };
        let mut new_data = solclout_instance_data.try_to_vec().unwrap();
        solclout_instance.data = new_data;

        let (solclout_authority_key, solclout_authority_nonce) =
            Pubkey::find_program_address(&[&solclout_instance_key.to_bytes()[..32]], &program_id);
        let (solclout_mint_key, mut solclout_mint) = get_account(Mint::LEN, &token_program_id);
        let mut solclout_mint_data = vec![0; Mint::get_packed_len()];
        Mint::pack(
            Mint {
                mint_authority: COption::Some(solclout_authority_key),
                supply: 0,
                decimals: native_mint::DECIMALS,
                is_initialized: true,
                freeze_authority: COption::Some(solclout_authority_key),
            },
            &mut solclout_mint_data,
        );
        solclout_mint.data = solclout_mint_data;

        let (founder_rewards_account_key, mut founder_rewards_account) =
            get_account(Account::LEN, &token_program_id);
        initialize_spl_account(
            &mut founder_rewards_account,
            &token_program_id,
            &solclout_mint_key,
            &solclout_authority_key,
        );

        let (name_key, name) = get_account(NameRecordHeader::LEN, &name_program_id);

        let (creator_key, mut creator) = get_account(SolcloutCreator::LEN, &program_id);
        let (creator_mint_key, mut creator_mint) = get_account(Mint::LEN, &token_program_id);
        let (authority_key, nonce) =
            Pubkey::find_program_address(&[&creator_key.to_bytes()[..32]], &program_id);
        let mut creator_mint_data = vec![0; Mint::get_packed_len()];
        Mint::pack(
            Mint {
                mint_authority: COption::Some(authority_key),
                supply: 0,
                decimals: native_mint::DECIMALS,
                is_initialized: true,
                freeze_authority: COption::Some(authority_key),
            },
            &mut creator_mint_data,
        );
        creator_mint.data = creator_mint_data;

        let creator_data = SolcloutCreator {
            key: Key::SolcloutCreatorV1,
            creator_token: creator_mint_key,
            solclout_instance: solclout_instance_key,
            founder_rewards_account: founder_rewards_account_key,
            founder_reward_percentage: 10000,
            initialized: true,
            authority_nonce: solclout_authority_nonce,
            name: name_key,
        };
        creator.data = creator_data.try_to_vec().unwrap();

        let (purchase_key, mut purchase_account) = get_account(Account::LEN, &token_program_id);
        let (purchase_authority_key, mut purchase_authority) = get_account(0, &token_program_id);
        let (destination_key, mut destination) = get_account(Account::LEN, &token_program_id);
        initialize_spl_account(
            &mut purchase_account,
            &token_program_id,
            &solclout_mint_key,
            &purchase_authority_key,
        );
        initialize_spl_account(
            &mut destination,
            &token_program_id,
            &creator_mint_key,
            &purchase_key,
        );

        let authority_key = authority_id(
            &program_id,
            &solclout_instance_key,
            creator_data.authority_nonce,
        )
        .unwrap();
        let mut authority = SolanaAccount::new(0, 0, &program_id);

        assert_eq!(
            Ok(()),
            do_process_instruction(
                buy_creator_coins(
                    &program_id,
                    &solclout_instance_key,
                    &creator_key,
                    &creator_mint_key,
                    &authority_key,
                    &solclout_storage_key,
                    &founder_rewards_account_key,
                    &purchase_key,
                    &purchase_authority_key,
                    &destination_key,
                    &token_program_id,
                    1000000000,
                ),
                vec![
                    &mut solclout_instance,
                    &mut creator,
                    &mut creator_mint,
                    &mut authority,
                    &mut solclout_storage,
                    &mut founder_rewards_account,
                    &mut purchase_account,
                    &mut purchase_authority,
                    &mut destination,
                    &mut token_program
                ],
            )
        );
    }
}
