use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        sysvar,
    },
};

/// Instructions supported by the Solclout program.
#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub enum SolcloutInstruction {
    /// Initialize Solclout. Must provide an authority over the solclout token acct that is a PDA
    /// of this program. This will give the program full authority over the account.
    ///
    ///   0. `[writable signer]` Payer
    ///   1. `[writable]` New Solclout instance to create. Program derived address of [Mint pkey]
    ///   2. `[]` solclout token Account. Must be non zero, with owner `create_program_address(&[Solclout instance account])`
    InitializeSolclout {
        token_program_id: Pubkey,
        name_program_id: Pubkey,
        /// Nonce used to derive authority program address
        nonce: u8,
    },

    /// Initialize a new solclout account. Note that you must already have created the mint,
    /// founder rewards account, and authority. The authority is a PDA of this program that gives it
    /// full authority of the creator coin mint. No coins will be minted outside of this program
    ///
    ///   0. `[writeable]` Payer
    ///   0. `[writeable]` Solclout account to create, Program derived address of [Solclout Instance, Name pkey]
    ///   1. `[]` Solclout instance.
    ///   2. `[]` Name service name
    ///   3. `[]` Founder rewards account, token program as owner, initialized in spl-token with creator coin mint.
    ///             Owner in the mint program should be either (a) The owner of the name service name or
    ///                                                        (b) Authority from `create_program_address(&[Solclout account])` with nonce specified in the args
    ///   4. `[]` creator coin with mint and freeze authority set to `create_program_address(&[Solclout account])`, with nonce specified in the args
    InitializeCreator {
        /// Percentage of purchases that go to the founder
        /// Percentage Value is (founder_reward_percentage / 10,000) * 100
        founder_reward_percentage: u16,
        /// Nonce used to derive authority program address
        nonce: u8,
    },

    /// Buy creator coins
    ///   0. `[]` Solclout instance
    ///   1. `[]` Solclout Creator to purchase creator coins of. This should be an initialized acct in solclout
    ///   2. `[writeable]` Solclout Creator coin mint
    ///   3. `[]` Solclout Creator mint authority
    ///   4. `[writeable]` Solclout storage account from the SolcloutInstance
    ///   5. `[writeable]` Creator's founder rewards account
    ///   6. `[writeable]`  Purchasing account, this is an account owned by the token program with
    ///                            the solclout mint
    ///   7. `[signer]`  Purchasing authority. This must be the authority on the purchasing account
    ///   8. `[writeable]`  Destination account, this is an account owned by the token program with
    ///                            the creator mint
    ///   9. `[]` Token program id
    BuyCreatorCoins {
        /// Number of lamports to purchase, since creator coins use the same decimal as sol
        lamports: u64,
    },

    /// Sell creator coins
    ///   0. `[]` Solclout instance
    ///   1. `[]` Solclout Creator to sell creator coins of. This should be an initialized acct in solclout
    ///   2. `[]` Solclout Creator coin mint
    ///   3. `[writeable]` Solclout storage account from the SolcloutInstance
    ///   4. `[]` Solclout storage authority from the SolcloutInstance
    ///   5. `[writeable]` Selling account, this is an account owned by the token program with
    ///                            the creator coin mint
    ///   6. `[signer]`  Selling authority. This must be the authority on the selling account
    ///   7. `[writeable]`  Destination account, this is an account owned by the token program with
    ///                            the solclout mint
    ///   8. `[]` Token program id
    SellCreatorCoins {
        /// Number of lamports to purchase, since creator coins use the same decimal as sol
        lamports: u64,
    },
}

/// Creates an InitializeSolclout instruction
pub fn initialize_solclout(
    program_id: &Pubkey,
    payer: &Pubkey,
    solclout_instance: &Pubkey,
    solclout_storage_account: &Pubkey,
    token_program_id: &Pubkey,
    name_program_id: &Pubkey,
    nonce: u8,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*payer, true),
            AccountMeta::new(*solclout_instance, false),
            AccountMeta::new_readonly(*solclout_storage_account, false),
            AccountMeta::new_readonly(solana_program::system_program::id(), false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
        ],
        data: SolcloutInstruction::InitializeSolclout {
            token_program_id: *token_program_id,
            name_program_id: *name_program_id,
            nonce,
        }
        .try_to_vec()
        .unwrap(),
    }
}

/// Creates an InitializeCreator instruction
pub fn initialize_creator(
    program_id: &Pubkey,
    payer: &Pubkey,
    solclout_account: &Pubkey,
    solclout_instance: &Pubkey,
    name: &Pubkey,
    founder_rewards_account: &Pubkey,
    creator_mint: &Pubkey,
    founder_reward_percentage: u16,
    nonce: u8,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*payer, true),
            AccountMeta::new(*solclout_account, false),
            AccountMeta::new_readonly(*solclout_instance, false),
            AccountMeta::new_readonly(*name, false),
            AccountMeta::new_readonly(*founder_rewards_account, false),
            AccountMeta::new_readonly(*creator_mint, false),
            AccountMeta::new_readonly(solana_program::system_program::id(), false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
        ],
        data: SolcloutInstruction::InitializeCreator {
            founder_reward_percentage,
            nonce,
        }
        .try_to_vec()
        .unwrap(),
    }
}

pub fn buy_creator_coins(
    program_id: &Pubkey,
    solclout_instance: &Pubkey,
    solclout_creator: &Pubkey,
    solclout_creator_mint: &Pubkey,
    solclout_creator_mint_authority: &Pubkey,
    solclout_storage_account: &Pubkey,
    founder_rewards_account: &Pubkey,
    purchase_account: &Pubkey,
    purchase_authority: &Pubkey,
    destination: &Pubkey,
    token_program_id: &Pubkey,
    lamports: u64,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*solclout_instance, false),
            AccountMeta::new_readonly(*solclout_creator, false),
            AccountMeta::new(*solclout_creator_mint, false),
            AccountMeta::new_readonly(*solclout_creator_mint_authority, false),
            AccountMeta::new(*solclout_storage_account, false),
            AccountMeta::new(*founder_rewards_account, false),
            AccountMeta::new(*purchase_account, false),
            AccountMeta::new_readonly(*purchase_authority, true),
            AccountMeta::new(*destination, false),
            AccountMeta::new_readonly(*token_program_id, false),
        ],
        data: SolcloutInstruction::BuyCreatorCoins { lamports }
            .try_to_vec()
            .unwrap(),
    }
}

pub fn sell_creator_coins(
    program_id: &Pubkey,
    solclout_instance: &Pubkey,
    solclout_creator: &Pubkey,
    solclout_creator_mint: &Pubkey,
    solclout_storage_account: &Pubkey,
    sell_account: &Pubkey,
    sell_authority: &Pubkey,
    destination: &Pubkey,
    token_program_id: &Pubkey,
    lamports: u64,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*solclout_instance, false),
            AccountMeta::new_readonly(*solclout_creator, false),
            AccountMeta::new(*solclout_creator_mint, false),
            AccountMeta::new(*solclout_storage_account, false),
            AccountMeta::new(*sell_account, false),
            AccountMeta::new_readonly(*sell_authority, true),
            AccountMeta::new(*destination, false),
            AccountMeta::new_readonly(*token_program_id, false),
        ],
        data: SolcloutInstruction::SellCreatorCoins { lamports }
            .try_to_vec()
            .unwrap(),
    }
}
