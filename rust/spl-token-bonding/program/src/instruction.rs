use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        instruction::{AccountMeta, Instruction},
        sysvar, pubkey::Pubkey,
    }
};

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct Creator {
    pub address: Pubkey,
    pub verified: bool,
    // In percentages, NOT basis points ;) Watch out!
    pub share: u8,
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct Data {
    /// The name of the asset
    pub name: String,
    /// The symbol for the asset
    pub symbol: String,
    /// URI pointing to JSON representing the asset
    pub uri: String,
    /// Royalty basis points that goes to creators in secondary sales (0-10000)
    pub seller_fee_basis_points: u16,
    /// Array of creators, optional
    pub creators: Option<Vec<Creator>>,
}

/// Instructions supported by the Metadata program.
#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub enum MetadataInstruction {
    /// Create Metadata object.
    ///   0. `[writable]`  Metadata key (pda of ['metadata', program id, mint id])
    ///   1. `[]` Mint of token asset
    ///   2. `[signer]` Mint authority
    ///   3. `[signer]` payer
    ///   4. `[]` update authority info
    ///   5. `[]` System program
    ///   6. `[]` Rent info
    CreateMetadataAccount(CreateMetadataAccountArgs),
}

#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
/// Args for create call
pub struct CreateMetadataAccountArgs {
    /// Note that unique metadatas are disabled for now.
    pub data: Data,
    /// Whether you want your metadata to be updateable in the future.
    pub is_mutable: bool,
}

/// Instructions supported by the Solclout program.
#[derive(BorshSerialize, BorshDeserialize, Clone)]
pub enum TokenBondingInstruction {
    /// Initialize a log curve.
    /// 
    /// If normal log curve, c * log(1 + (g * x))
    /// If base relative, c * log(1 + (g * x) / (base_supply))
    ///
    ///   0. `[signer]` Payer
    ///   1. `[signer writeable]` Curve to create
    ///   2. `[]` System program id
    ///   3. `[]` Rent sysvar
    CreateLogCurveV0 {
        g: u128,
        c: u128,
        taylor_iterations: u16,
        is_base_relative: bool
    },

    /// Initialize a new Token Bonding account. Note that you must already have created the base mint,
    /// target mint, Founder rewards vault token (FVT) mint
    /// The authority is a PDA of this program that gives it full authority of the target mint. No coins will be minted outside of this program
    ///
    ///   0. `[writeable signer]` Payer
    ///   1. `[writeable]` Token bonding account to create. Pda of ['token-bonding', target mint]
    ///   2. `[]` Bonding Curve, see Create<Type>Curve instructions
    ///   3. `[]` Base coin mint
    ///   4. `[]` Target coin mint. Must have mint and freeze authority as `create_program_address(['target-authority', target.pubKey])`
    ///   5. `[]` Founder rewards account. Founder rewards will be distributed to this account
    ///   6. `[]` Base coin storage account. Must be an empty account, bonding will initialize this for you
    ///   7. `[]` Base coin storage authority. Must be an empty account with key ['base-storage-authority', base storage.pubkey]
    ///   8. `[]` Token program id
    ///   9. `[]` System program id
    ///   10. `[]` Rent sysvar
    InitializeTokenBondingV0 {
        /// Percentage of purchases that go to the founder
        /// Percentage Value is (founder_reward_percentage / 10,000) * 100
        founder_reward_percentage: u16,
        // The maximum number of target tokens that can be minted.
        mint_cap: Option<u64>,
        token_bonding_authority: Option<Pubkey>
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
    ///   11. `[]` System Program
    BuyV0 {
        /// Number to purchase. This is including the decimal value. So 1 is the lowest possible fraction of a coin
        amount: u64,
        // Maximum price to pay for this amount. ALlows users to account and fail-fast for slippage.
        max_price: u64,
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
    ///   10. `[]` System Program
    SellV0 {
        /// Number to sell. This is including the decimal value. So 1 is the lowest possible fraction of a coin
        amount: u64,
        // Minimum amount of base to receive for this amount. Allows users to account and fail-fast for slippage.
        min_price: u64,
    },

    /// Freeze BUY on the bonding curve. Tokens can no longer be bought/minted
    ///   0. `[writeable]` Token bonding account
    ///   1. `[signer]` Token bonding authority
    FreezeBuyV0,

    /// Thaw BUY on the bonding curve. Tokens can no longer be bought/minted
    ///   0. `[writeable]` Token bonding account
    ///   1. `[signer]` Token bonding authority
    ThawBuyV0,

    /// Freeze SELL on the bonding curve. Tokens can no longer be sold, refunding money from the base account.
    ///   0. `[writeable]` Token bonding account
    ///   1. `[signer]` Token bonding authority
    FreezeSellV0,

    /// Thaw SELL on the bonding curve. Tokens can no longer be sold, refunding money from the base account.
    ///   0. `[writeable]` Token bonding account
    ///   1. `[signer]` Token bonding authority
    ThawSellV0,

    /// Change the authority on the bonding curve.
    ///   0. `[writeable]` Token bonding account
    ///   1. `[signer]` Token bonding authority
    ChangeAuthorityV0 {
        new_authority: Option<Pubkey>
    },

    /// Proxy to the token metadata contract, first verifying that the authority of this curve signs off on the action.
    ///   0. `[]` Token Bonding
    ///   1. `[signer]` Token bonding authority
    ///   1. `[]` Spl token metadata program id (will be checked against spl_token_metadata::id(), but needs to be inflated)
    ///   ... all accounts on the CreateMetadataAccount call...
    CreateTokenMetadata(CreateMetadataAccountArgs)
}

/// Creates an CreateMetadataAccounts instruction
#[allow(clippy::too_many_arguments)]
pub fn create_metadata_accounts(
    program_id: Pubkey,
    token_bonding: Pubkey,
    token_bonding_authority: Pubkey,
    spl_token_metadata_program_id: Pubkey,
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
          AccountMeta::new_readonly(token_bonding, false),
          AccountMeta::new_readonly(token_bonding_authority, true),
          AccountMeta::new_readonly(spl_token_metadata_program_id, false),
          AccountMeta::new(metadata_account, false),
          AccountMeta::new_readonly(mint, false),
            AccountMeta::new_readonly(mint_authority, false),
            AccountMeta::new(payer, true),
            AccountMeta::new_readonly(update_authority, update_authority_is_signer),
            AccountMeta::new_readonly(solana_program::system_program::id(), false),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
        ],
        data: TokenBondingInstruction::CreateTokenMetadata(args)
        .try_to_vec()
        .unwrap(),
    }
}


/// Creates an InitializeTokenBondingV0 instruction
pub fn initialize_token_bonding_v0(
    program_id: &Pubkey,
    token_program_id: &Pubkey,
    payer: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: Option<Pubkey>,
    curve: &Pubkey,
    base_mint: &Pubkey,
    target_mint: &Pubkey,
    founder_rewards: &Pubkey,
    base_storage: &Pubkey,
    base_storage_authority: &Pubkey,
    founder_reward_percentage: u16,
    mint_cap: Option<u64>,
) -> Instruction {
    let accounts = vec![
        AccountMeta::new(*payer, true),
        AccountMeta::new(*token_bonding, false),
        AccountMeta::new_readonly(*curve, false),
        AccountMeta::new_readonly(*base_mint, false),
        AccountMeta::new_readonly(*target_mint, false),
        AccountMeta::new_readonly(*founder_rewards, false),
        AccountMeta::new(*base_storage, false),
        AccountMeta::new_readonly(*base_storage_authority, false),
        AccountMeta::new_readonly(*token_program_id, false),
        AccountMeta::new_readonly(solana_program::system_program::id(), false),
        AccountMeta::new_readonly(sysvar::rent::id(), false),
    ];
    Instruction {
        program_id: *program_id,
        accounts,
        data: TokenBondingInstruction::InitializeTokenBondingV0 {
            founder_reward_percentage,
            mint_cap,
            token_bonding_authority
        }
        .try_to_vec()
        .unwrap(),
    }
}

pub fn buy_v0_instruction(
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
    max_price: u64,
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
            AccountMeta::new_readonly(solana_program::system_program::id(), false),
        ],
        data: TokenBondingInstruction::BuyV0 { amount, max_price }
            .try_to_vec()
            .unwrap(),
    }
}

pub fn sell_v0_instruction(
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
    min_price: u64,
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
            AccountMeta::new_readonly(solana_program::system_program::id(), false),
        ],
        data: TokenBondingInstruction::SellV0 { amount, min_price }
            .try_to_vec()
            .unwrap(),
    }
}

pub fn create_log_curve_v0(
    program_id: &Pubkey,
    payer: &Pubkey,
    curve: &Pubkey,
    g: u128,
    c: u128,
    taylor_iterations: u16,
    is_base_relative: bool,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*payer, true),
            AccountMeta::new(*curve, true),
            AccountMeta::new_readonly(sysvar::rent::id(), false),
        ],
        data: TokenBondingInstruction::CreateLogCurveV0 {
                g,
                c,
                taylor_iterations,
                is_base_relative
            }
            .try_to_vec()
            .unwrap(),
    }
}

pub fn freeze_buy_v0_instruction(
    program_id: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: &Pubkey,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*token_bonding, false),
            AccountMeta::new_readonly(*token_bonding_authority, true),
        ],
        data: TokenBondingInstruction::FreezeBuyV0 {}
            .try_to_vec()
            .unwrap(),
    }
}

pub fn thaw_buy_v0_instruction(
    program_id: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: &Pubkey,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*token_bonding, false),
            AccountMeta::new_readonly(*token_bonding_authority, true),
        ],
        data: TokenBondingInstruction::ThawBuyV0 {}
            .try_to_vec()
            .unwrap(),
    }
}

pub fn freeze_sell_v0_instruction(
    program_id: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: &Pubkey,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*token_bonding, false),
            AccountMeta::new_readonly(*token_bonding_authority, true),
        ],
        data: TokenBondingInstruction::FreezeSellV0 {}
            .try_to_vec()
            .unwrap(),
    }
}

pub fn thaw_sell_v0_instruction(
    program_id: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: &Pubkey,
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*token_bonding, false),
            AccountMeta::new_readonly(*token_bonding_authority, true),
        ],
        data: TokenBondingInstruction::ThawSellV0 {}
            .try_to_vec()
            .unwrap(),
    }
}

pub fn change_authority_v0_instruction(
    program_id: &Pubkey,
    token_bonding: &Pubkey,
    token_bonding_authority: &Pubkey,
    new_authority: Option<Pubkey>
) -> Instruction {
    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*token_bonding, false),
            AccountMeta::new_readonly(*token_bonding_authority, true),
        ],
        data: TokenBondingInstruction::ChangeAuthorityV0 {
            new_authority
        }
            .try_to_vec()
            .unwrap(),
    }
}
