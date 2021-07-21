use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        sysvar,
    }
};
use spl_token_bonding::instruction::{CreateMetadataAccountArgs};

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
    /// full authority of the social token mint. No coins will be minted outside of this program
    ///
    ///   0. `[writeable signer]` Payer
    ///   1. `[writeable]` Token Ref account to create, 
    ///             If unclaimed, program derived address of ['unclaimed-ref', Wumbo Instance, Name pkey]
    ///             If claimed, program derived address of ['claimed-ref', Wumbo Instance, Name service owner pkey]
    ///   2. `[]` Wumbo instance.
    ///   3. `[]` Name service name
    ///   4. `[]` Founder rewards account
    ///   5. `[]` Token bonding. Authority must be set to program derived address of ['bonding-authority', token ref pubkey]. Curve must be the base curve if name owner not signing
    ///   6. `[]` System Program
    ///   7. `[]` Rent sysvar
    ///   8. (optional) `[signer]` Name service owner. If this is set, will not verify the owner of the founder rewards account
    InitializeSocialTokenV0,

    /// Opt out of Wum.bo
    ///   0. `[]` Token ref to opt out
    ///   1. `[writeable]` Token bonding for the user
    ///   2. `[] Token bonding authority. Should be a pda of ['bonding-authority', token ref pubkey]
    ///   3. `[signer]` Owner of the token ref
    OptOutV0,

    /// Opt back in of Wum.bo
    ///   0. `[]` Token ref to opt in
    ///   1. `[writeable]` Token bonding for the user
    ///   2. `[] Token bonding authority. Should be a pda of ['bonding-authority', token ref pubkey]
    ///   3. `[signer]` Owner of the token ref
    OptInV0,

    /// Proxy to the token metadata contract, first verifying that the owner of the founder rewards account signs off on this action
    ///   0. `[]` claimed token ref
    ///   1. `[signer]` claimed token ref owner
    ///   2. `[]` Token bonding
    ///   3. `[]` Token bonding authority (pda of ['bonding-authority', token ref pubkey])
    ///   4. `[]` Spl token bonding program id (will be checked against spl_token_bonding::id(), but needs to be inflated)
    ///   5. `[]` Spl token metadata program id (will be checked against spl_token_metadata::id(), but needs to be inflated)
    ///   ... all accounts on the CreateMetadataAccount call...
    CreateTokenMetadata(CreateMetadataAccountArgs)
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

/// Creates an InitializeSocialTokenV0 instruction
pub fn initialize_creator(
    program_id: &Pubkey,
    payer: &Pubkey,
    token_ref: &Pubkey,
    wumbo_instance: &Pubkey,
    name: &Pubkey,
    founder_rewards_account: &Pubkey,
    token_bonding: &Pubkey,
    name_owner: Option<&Pubkey>,
) -> Instruction {
    let mut accounts = vec![
        AccountMeta::new(*payer, true),
        AccountMeta::new(*token_ref, false),
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
        data: WumboInstruction::InitializeSocialTokenV0
        .try_to_vec()
        .unwrap(),
    }
}

pub fn opt_out_v0_instruction(
    program_id: &Pubkey,
    token_ref: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: &Pubkey,
    name: &Pubkey,
    name_owner: &Pubkey,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*token_ref, false),
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
    token_ref: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: &Pubkey,
    name: &Pubkey,
    name_owner: &Pubkey,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*token_ref, false),
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
