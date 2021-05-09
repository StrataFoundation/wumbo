use std::process::exit;
use std::str::FromStr;

use clap::{
    App, AppSettings, Arg, crate_description, crate_name, crate_version, SubCommand,
    value_t_or_exit,
};
use solana_clap_utils::fee_payer::fee_payer_arg;
use solana_clap_utils::input_validators::{is_parsable, is_url_or_moniker, is_valid_pubkey, is_valid_signer, normalize_to_url_if_moniker};
use solana_clap_utils::keypair::signer_from_path;
use solana_client::client_error::ClientError;
use solana_client::rpc_client::RpcClient;
use solana_client::rpc_config::RpcSendTransactionConfig;
use solana_sdk::commitment_config::{CommitmentConfig, CommitmentLevel};
use solana_sdk::instruction::Instruction;
use solana_sdk::pubkey::Pubkey;
use solana_sdk::signature::{Keypair, read_keypair_file, Signer, write_keypair_file};
use solana_sdk::system_instruction::create_account;
use solana_sdk::transaction::Transaction;
use spl_associated_token_account::solana_program::program_pack::Pack;
use spl_token::instruction::{initialize_account, initialize_mint};
use spl_token::native_mint;
use spl_token::state::Account;
use spl_token::state::Mint;
use spl_token_swap::curve::base::{CurveType, SwapCurve};
use spl_token_swap::curve::fees::Fees;
use spl_token_swap::instruction as token_swap_instruction;
use spl_token_swap::state::SwapVersion;

const TOKEN_SWAP_PROGRAM_ID_STR: &str = "F2LtPFtixA8vKbg8ark5zswM4QuJKBn85KZcqrzWNe4K";
const TOKEN_PROGRAM_ID_STR: &str = "CiBbJADtSJnVQEsgXZpRfLyLNqDjwfvua8EMe9tPhKvo";

fn main() {
    let default_decimals = &format!("{}", native_mint::DECIMALS);
    let TOKEN_SWAP_PROGRAM_ID: Pubkey = Pubkey::from_str(TOKEN_SWAP_PROGRAM_ID_STR).unwrap();
    // let TOKEN_PROGRAM_ID: Pubkey = Pubkey::from_str(TOKEN_PROGRAM_ID_STR).unwrap();
    // let TOKEN_SWAP_PROGRAM_ID: Pubkey = spl_token_swap::id();
    let TOKEN_PROGRAM_ID: Pubkey = spl_token::id();

    let app_matches = App::new(crate_name!())
        .about(crate_description!())
        .version(crate_version!())
        .setting(AppSettings::SubcommandRequiredElseHelp)
        .arg({
            let arg = Arg::with_name("config_file")
                .short("C")
                .long("config")
                .value_name("PATH")
                .takes_value(true)
                .global(true)
                .help("Configuration file to use");
            if let Some(ref config_file) = *solana_cli_config::CONFIG_FILE {
                arg.default_value(&config_file)
            } else {
                arg
            }
        })
        .arg(
            Arg::with_name("json_rpc_url")
                .short("u")
                .long("url")
                .value_name("URL_OR_MONIKER")
                .takes_value(true)
                .global(true)
                .validator(is_url_or_moniker)
                .help(
                    "URL for Solana's JSON RPC or moniker (or their first letter): \
                       [mainnet-beta, testnet, devnet, localhost]"
                ),
        )
        .arg(fee_payer_arg().required(false))
        .subcommand(
            SubCommand::with_name("initialize-solclout-token")
                .about("Create a new solclout token")
                .arg(
                    Arg::with_name("decimals")
                        .long("decimals")
                        .validator(is_parsable::<u8>)
                        .value_name("DECIMALS")
                        .takes_value(true)
                        .default_value(&default_decimals)
                        .help("Number of base 10 digits to the right of the decimal place"),
                )
                .arg(
                    Arg::with_name("enable_freeze")
                        .long("enable-freeze")
                        .takes_value(false)
                        .help(
                            "Enable the mint authority to freeze associated token accounts."
                        ),
                )
        )
        .subcommand(
            SubCommand::with_name("create-solclout-sol-pool")
                .about("Create a pool of solclout x sol")
                .arg(
                    Arg::with_name("solclout_token")
                        .validator(is_valid_pubkey)
                        .value_name("TOKEN_ADDRESS")
                        .takes_value(true)
                        .index(1)
                        .required(true)
                        .help("The solclout token to make a pool from")
                )
        )
        .get_matches();

    let (sub_command, sub_matches) = app_matches.subcommand();
    let client = RpcClient::new(
        normalize_to_url_if_moniker(
            app_matches
                .value_of("json_rpc_url")
                .unwrap_or("devnet"),
        )
    );
    let cli_config = if let Some(config_file) = app_matches.value_of("config_file") {
        solana_cli_config::Config::load(config_file).unwrap_or_default()
    } else {
        solana_cli_config::Config::default()
    };
    let fee_payer = signer_from_path(
            &app_matches,
            app_matches.value_of("fee_payer").unwrap_or(&cli_config.keypair_path),
            "fee_payer",
            &mut None,
        )
            .unwrap_or_else(|e| {
                eprintln!("error: {}", e);
                exit(1);
            });


    let create_token = |fee_payer: &Signer, authority: &Signer, decimals: u8| {
        let keypair = Keypair::new();
        let token = keypair.pubkey();

        let minimum_balance_for_rent_exemption =
            client.get_minimum_balance_for_rent_exemption(Mint::LEN).unwrap();

        let instructions = vec![
            create_account(
                &authority.pubkey(),
                &token,
                minimum_balance_for_rent_exemption,
                Mint::LEN as u64,
                &TOKEN_PROGRAM_ID,
            ),
            initialize_mint(
                &TOKEN_PROGRAM_ID,
                &token,
                &authority.pubkey(),
                Some(&authority.pubkey()),
                decimals,
            ).unwrap(),
        ];

        (keypair, instructions)
    };
    let create_token_account = |fee_payer: &dyn Signer, authority: &Pubkey, token: &Pubkey| {
        let keypair = Keypair::new();
        let account = keypair.pubkey();
        let balance = client.get_minimum_balance_for_rent_exemption(Account::LEN).unwrap();

        let instructions = vec![
            create_account(
                &fee_payer.pubkey(),
                &account,
                balance,
                Account::LEN as u64,
                &TOKEN_PROGRAM_ID,
            ),
            initialize_account(
                &TOKEN_PROGRAM_ID,
                &account,
                &token,
                &authority
            ).unwrap()
        ];

        (keypair, instructions)
    };
    match (sub_command, sub_matches) {
        ("initialize-solclout-token", Some(arg_matches)) => {
            let decimals = value_t_or_exit!(arg_matches, "decimals", u8);

            let (token, instructions) =
                create_token(fee_payer.as_ref(), fee_payer.as_ref(), decimals);
            let mut transaction = Transaction::new_with_payer(&instructions, Some(&fee_payer.pubkey()));
            let recent_blockhash = client.get_recent_blockhash().unwrap().0;
            transaction.sign(&vec![fee_payer.as_ref(), &token], recent_blockhash);
            client.send_transaction(&transaction).unwrap();
            println!("Solclout token {} created!", token.pubkey());
        },
        ("create-solclout-sol-pool", Some(arg_matches)) => {
            let solclout_token_id = Pubkey::from_str(
                arg_matches.value_of("solclout_token").unwrap()
            ).unwrap();
            let token_swap_account = Keypair::new();
            let token_pool_state_account = Keypair::new();
            let (token_pool, token_pool_instrutions) =
                create_token(fee_payer.as_ref(), fee_payer.as_ref(), native_mint::DECIMALS);
            let (authority, nonce) = Pubkey::find_program_address(
                &[&token_swap_account.pubkey().to_bytes()],
                &TOKEN_SWAP_PROGRAM_ID
            );
            let balance_needed_for_pool_state =
                client.get_minimum_balance_for_rent_exemption(SwapVersion::LATEST_LEN).unwrap();

            let (token_a_account, a_instructions) = create_token_account(
                fee_payer.as_ref(),
                &authority,
                &spl_token::native_mint::id()
            );
            let (token_b_account, b_instructions) = create_token_account(
                fee_payer.as_ref(),
                &authority,
                &solclout_token_id
            );
            let (fee_payer_token_account, fee_payer_instructions) = create_token_account(
                fee_payer.as_ref(),
                &authority,
                &solclout_token_id
            );

            let swap_instructions = vec![
                create_account(
                    &fee_payer.pubkey(),
                    &token_pool_state_account.pubkey(),
                    balance_needed_for_pool_state,
                    SwapVersion::LATEST_LEN as u64,
                    &TOKEN_PROGRAM_ID,
                ),
                token_swap_instruction::initialize(
                    &TOKEN_SWAP_PROGRAM_ID,
                    &TOKEN_PROGRAM_ID,
                    &token_swap_account.pubkey(), // token swap account (signer). Used to refer to swap
                    &authority, // authority, program derived -- authority
                    &token_a_account.pubkey(),
                    &token_b_account.pubkey(),
                    &token_pool.pubkey(), // Actual mint for pool coins -- tokenPool
                    &fee_payer_token_account.pubkey(),
                    &token_pool_state_account.pubkey(),
                    nonce,
                    Fees {
                        trade_fee_numerator: 25,
                        trade_fee_denominator: 10000,
                        owner_trade_fee_numerator: 5,
                        owner_trade_fee_denominator: 10000,
                        owner_withdraw_fee_numerator: 0,
                        owner_withdraw_fee_denominator: 0,
                        host_fee_numerator: 20,
                        host_fee_denominator: 100,
                    },
                    SwapCurve::default()
                ).unwrap(),
            ];

            let instructions: Vec<Instruction> = token_pool_instrutions.into_iter()
                .chain(a_instructions.into_iter())
                .chain(b_instructions.into_iter())
                .chain(fee_payer_instructions.into_iter())
                .collect();

            let mut transaction = Transaction::new_with_payer(&instructions, Some(&fee_payer.pubkey()));
            let recent_blockhash = client.get_recent_blockhash().unwrap().0;
            transaction.sign(&vec![
                fee_payer.as_ref(),
                &token_pool,
                &token_a_account,
                &token_b_account,
                &fee_payer_token_account,
            ], recent_blockhash);
            client.send_transaction(&transaction).unwrap();
            println!("Sol x SolClout defined at {}", token_swap_account.pubkey())
        },
        _ => unreachable!(),
    }“
}
