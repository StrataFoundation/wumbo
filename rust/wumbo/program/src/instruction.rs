use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        sysvar,
    },
};

/// Instructions supported by the Wumbo program.
#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub enum WumboInstruction {
    /// Initialize Wumbo. Must provide an authority over the wumbo token acct that is a PDA
    /// of this program. This will give the program full authority over the account.
    ///
    ///   0. `[writable signer]` Payer
    ///   1. `[writable]` New Wumbo instance to create. Program derived address of ['wumbo', Mint pkey]
    ///   2. `[]` Wumbo mint
    ///   3. `[]` Base Curve
    InitializeWumboV0 {
        name_program_id: Pubkey,
    },

    /// Initialize a new wumbo account. Note that you must already have created the mint,
    /// founder rewards account, and authority. The authority is a PDA of this program that gives it
    /// full authority of the creator coin mint. No coins will be minted outside of this program
    ///
    ///   0. `[writeable signer]` Payer
    ///   1. `[writeable]` Creator account to create, Program derived address of ['creator', Wumbo Instance, Name pkey]
    ///   2. `[]` Wumbo instance.
    ///   3. `[]` Name service name
    ///   4. `[]` Founder rewards account
    ///   5. `[]` Token bonding. Authority must be set to program derived address of ['bonding-authority', Creator Pubkey]. Curve must be the base curve if name owner not signing
    ///   7. `[]` System Program
    ///   8. `[]` Rent sysvar
    ///   9. (optional) `[signer]` Name service owner. If this is set, will not verify the owner of the founder rewards account
    InitializeCreatorV0,

    /// Opt out of Wum.bo
    ///   0. `[]` Creator to opt out
    ///   1. `[writeable]` Token bonding for the creator
    ///   2. `[] Token bonding authority. Should be a pda of ['bonding-authority', Creator Pubkey]
    ///   3. `[]` Name service name
    ///   4. `[signer]` Name service owner. If this is set, will not verify the owner of the founder rewards account
    OptOutV0,

    /// Opt out of Wum.bo
    ///   0. `[]` Creator to opt out
    ///   1. `[writeable]` Token bonding for the creator
    ///   2. `[] Token bonding authority. Should be a pda of ['bonding-authority', Creator Pubkey]
    ///   3. `[]` Name service name
    ///   4. `[signer]` Name service owner. If this is set, will not verify the owner of the founder rewards account
    OptInV0,
}

/// Creates an InitializeWumboV0 instruction
pub fn initialize_wumbo(
    program_id: &Pubkey,
    payer: &Pubkey,
    wumbo_instance: &Pubkey,
    wumbo_mint: &Pubkey,
    base_curve: &Pubkey,
    name_program_id: &Pubkey,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*payer, true),
            AccountMeta::new(*wumbo_instance, false),
            AccountMeta::new_readonly(*wumbo_mint, false),
            AccountMeta::new_readonly(*base_curve, false),
            AccountMeta::new_readonly(solana_program::system_program::id(), false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
        ],
        data: WumboInstruction::InitializeWumboV0{
            name_program_id: *name_program_id,
        }
        .try_to_vec()
        .unwrap(),
    }
}

/// Creates an InitializeCreatorV0 instruction
pub fn initialize_creator(
    program_id: &Pubkey,
    payer: &Pubkey,
    creator: &Pubkey,
    wumbo_instance: &Pubkey,
    name: &Pubkey,
    founder_rewards_account: &Pubkey,
    token_bonding: &Pubkey,
    name_owner: Option<&Pubkey>,
) -> Instruction {
    let mut accounts = vec![
        AccountMeta::new(*payer, true),
        AccountMeta::new(*creator, false),
        AccountMeta::new_readonly(*wumbo_instance, false),
        AccountMeta::new_readonly(*name, false),
        AccountMeta::new_readonly(*founder_rewards_account, false),
        AccountMeta::new_readonly(*token_bonding, false),
        AccountMeta::new_readonly(solana_program::system_program::id(), false),
        AccountMeta::new_readonly(sysvar::rent::id(), false),
    ];
    name_owner.map(|owner| 
        accounts.push(AccountMeta::new_readonly(*owner, true))
    );
    Instruction {
        program_id: *program_id,
        accounts,
        data: WumboInstruction::InitializeCreatorV0
        .try_to_vec()
        .unwrap(),
    }
}

pub fn opt_out_v0_instruction(
    program_id: &Pubkey,
    creator: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: &Pubkey,
    name: &Pubkey,
    name_owner: &Pubkey,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*creator, false),
            AccountMeta::new(*token_bonding, false),
            AccountMeta::new_readonly(*token_bonding_authority, false),
            AccountMeta::new_readonly(*name, false),
            AccountMeta::new_readonly(*name_owner, true),
        ],
        data: WumboInstruction::OptOutV0 {}
            .try_to_vec()
            .unwrap(),
    }
}

pub fn opt_in_v0_instruction(
    program_id: &Pubkey,
    creator: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: &Pubkey,
    name: &Pubkey,
    name_owner: &Pubkey,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*creator, false),
            AccountMeta::new(*token_bonding, false),
            AccountMeta::new_readonly(*token_bonding_authority, false),
            AccountMeta::new_readonly(*name, false),
            AccountMeta::new_readonly(*name_owner, true),
        ],
        data: WumboInstruction::OptOutV0 {}
            .try_to_vec()
            .unwrap(),
    }
}
