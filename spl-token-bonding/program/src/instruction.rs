use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        instruction::{AccountMeta, Instruction},
        sysvar, pubkey::Pubkey,
    },
};

/// Instructions supported by the Solclout program.
#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub enum TokenBondingInstruction {
    /// Initialize a log curve.
    /// 
    /// If normal log curve, c * log(1 + (numerator * x) / denominator)
    /// If base relative, c * log(1 + (numerator * x) / (denominator * base_supply))
    ///
    ///   0. `[signer]` Payer
    ///   1. `[signer writeable]` Curve to create
    ///   2. `[]` Program id
    ///   3. `[]` Rent sysvar
    CreateLogCurveV0 {
        numerator: u64,
        denominator: u64,
        c: u64,
        is_base_relative: bool
    },

    /// Initialize a new Token Bonding account. Note that you must already have created the base mint,
    /// target mint, Founder rewards vault token (FVT) mint
    /// The authority is a PDA of this program that gives it full authority of the target mint. No coins will be minted outside of this program
    ///
    ///   0. `[writeable signer]` Payer
    ///   1. `[writeable signer]` Token bonding account to create
    ///   2. `[]` Bonding Curve Authority
    ///   3. `[]` Bonding Curve, see Create<Type>Curve instructions
    ///   4. `[]` Base coin mint
    ///   5. `[]` Target coin mint. Must have mint and freeze authority as `create_program_address(['target-authority', target.pubKey])`
    ///   6. `[]` Founder rewards account. Founder rewards will be distributed to this account
    ///   7. `[]` Base coin storage account. Buy will result in deposits here. Authority should be `create_program_address(['storage-authority', baseStorage.pubKey])`
    ///   8. `[]` System Program
    ///   9. `[]` Rent sysvar
    InitializeTokenBondingV0 {
        /// Percentage of purchases that go to the founder
        /// Percentage Value is (founder_reward_percentage / 10,000) * 100
        founder_reward_percentage: u16
    },

    /// Buy creator coins
    ///   0. `[]` Token bonding account
    ///   1. `[]` Price curve
    ///   2. `[]` Base coin mint
    ///   3. `[writeable]` Target coin mint
    ///   4. `[]` Target coin mint authority
    ///   5. `[writeable]` Founder rewards account. Founder rewards will be distributed to this account
    ///   6. `[writeable]` Base coin storage account
    ///   7. `[writeable]`  Purchasing account, this is an account owned by the token program with
    ///                            the base mint
    ///   8. `[signer]`  Purchasing authority. This must be the authority on the purchasing account
    ///   9. `[writeable]`  Destination account, this is an account owned by the token program with
    ///                            the target coin mint
    ///   10. `[]` Token program id
    BuyV0 {
        /// Number to purchase. This is including the decimal value. So 1 is the lowest possible fraction of a coin
        amount: u64,
    },

    /// Sell creator coins
    ///   0. `[]` Token bonding account
    ///   1. `[]` Price curve
    ///   2. `[]` Base coin mint
    ///   3. `[writeable]` Target coin mint
    ///   4. `[writeable]` Base storage account
    ///   5. `[]` Base storage account authority
    ///   6. `[writeable]`  Selling account, this is an account owned by the token program with
    ///                            the target mint
    ///   7. `[signer]`  Selling authority. This must be the authority on the selling account
    ///   8. `[writeable]`  Destination account, this is an account owned by the token program with
    ///                            the base mint
    ///   9. `[]` Token program id
    SellV0 {
        /// Number to sell. This is including the decimal value. So 1 is the lowest possible fraction of a coin
        amount: u64,
    },
}

/// Creates an InitializeCreator instruction
pub fn initialize_token_bonding_v0(
    program_id: &Pubkey,
    payer: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: &Pubkey,
    curve: &Pubkey,
    base_mint: &Pubkey,
    target_mint: &Pubkey,
    founder_rewards: &Pubkey,
    base_storage: &Pubkey,
    founder_reward_percentage: u16
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*payer, true),
            AccountMeta::new(*token_bonding, true),
            AccountMeta::new_readonly(*token_bonding_authority, false),
            AccountMeta::new_readonly(*curve, false),
            AccountMeta::new_readonly(*base_mint, false),
            AccountMeta::new_readonly(*target_mint, false),
            AccountMeta::new_readonly(*founder_rewards, false),
            AccountMeta::new_readonly(*base_storage, false),
            AccountMeta::new_readonly(solana_program::system_program::id(), false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
        ],
        data: TokenBondingInstruction::InitializeTokenBondingV0 {
            founder_reward_percentage,
        }
        .try_to_vec()
        .unwrap(),
    }
}

pub fn buy_creator_coins(
    program_id: &Pubkey,
    token_bonding: &Pubkey,
    curve: &Pubkey,
    base_mint: &Pubkey,
    target_mint: &Pubkey,
    target_mint_authority: &Pubkey,
    founder_rewards: &Pubkey,
    base_storage: &Pubkey,
    purchase_account: &Pubkey,
    purchase_authority: &Pubkey,
    destination: &Pubkey,
    token_program_id: &Pubkey,
    amount: u64,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*token_bonding, false),
            AccountMeta::new_readonly(*curve, false),
            AccountMeta::new_readonly(*base_mint, false),
            AccountMeta::new(*target_mint, false),
            AccountMeta::new_readonly(*target_mint_authority, false),
            AccountMeta::new(*founder_rewards, false),
            AccountMeta::new(*base_storage, false),
            AccountMeta::new(*purchase_account, false),
            AccountMeta::new_readonly(*purchase_authority, true),
            AccountMeta::new(*destination, false),
            AccountMeta::new_readonly(*token_program_id, false),
        ],
        data: TokenBondingInstruction::BuyV0 { amount }
            .try_to_vec()
            .unwrap(),
    }
}

pub fn sell_creator_coins(
    program_id: &Pubkey,
    token_bonding: &Pubkey,
    base_mint: &Pubkey,
    target_mint: &Pubkey,
    founder_rewards: &Pubkey,
    base_storage: &Pubkey,
    base_storage_authority: &Pubkey,
    sell_account: &Pubkey,
    sell_authority: &Pubkey,
    destination: &Pubkey,
    token_program_id: &Pubkey,
    amount: u64,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new_readonly(*token_bonding, false),
            AccountMeta::new_readonly(*base_mint, false),
            AccountMeta::new(*target_mint, false),
            AccountMeta::new(*founder_rewards, false),
            AccountMeta::new(*base_storage, false),
            AccountMeta::new_readonly(*base_storage_authority, false),
            AccountMeta::new(*sell_account, false),
            AccountMeta::new_readonly(*sell_authority, true),
            AccountMeta::new(*destination, false),
            AccountMeta::new_readonly(*token_program_id, false),
        ],
        data: TokenBondingInstruction::BuyV0 { amount }
            .try_to_vec()
            .unwrap(),
    }
}

pub fn create_log_curve_v0(
    program_id: &Pubkey,
    payer: &Pubkey,
    curve: &Pubkey,
    numerator: u64,
    denominator: u64,
    c: u64,
    is_base_relative: bool,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*payer, true),
            AccountMeta::new(*curve, true),
            AccountMeta::new_readonly(solana_program::system_program::id(), false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
        ],
        data: TokenBondingInstruction::CreateLogCurveV0 {
                numerator,
                denominator,
                c,
                is_base_relative
            }
            .try_to_vec()
            .unwrap(),
    }
}