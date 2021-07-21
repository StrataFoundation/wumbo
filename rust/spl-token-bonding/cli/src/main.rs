use std::process::exit;
use std::str::FromStr;

use clap::{
    crate_description, crate_name, crate_version, value_t_or_exit, App, AppSettings, Arg,
    SubCommand,
};
use solana_clap_utils::fee_payer::fee_payer_arg;
use solana_clap_utils::input_validators::{
    is_parsable, is_url_or_moniker, is_valid_pubkey, normalize_to_url_if_moniker,
};
use spl_associated_token_account::create_associated_token_account;
use solana_clap_utils::keypair::signer_from_path;
use solana_client::rpc_client::RpcClient;
use solana_program::{instruction::Instruction, pubkey::Pubkey};
use solana_sdk::signature::{Keypair, Signer};
use solana_sdk::system_instruction::create_account;
use solana_sdk::transaction::Transaction;
use spl_associated_token_account::{get_associated_token_address, solana_program::program_pack::Pack};
use spl_token::instruction::initialize_account;
use spl_token::native_mint;
use spl_token::state::{Mint, Account};
use spl_token_bonding::{
    instruction::{create_log_curve_v0, initialize_token_bonding_v0},
    processor::{target_authority, storage_authority, storage_key},
    state::{LogCurveV0, TokenBondingV0}
};

const TOKEN_SWAP_PROGRAM_ID_STR: &str = "F2LtPFtixA8vKbg8ark5zswM4QuJKBn85KZcqrzWNe4K";
const TOKEN_PROGRAM_ID_STR: &str = "CiBbJADtSJnVQEsgXZpRfLyLNqDjwfvua8EMe9tPhKvo";
const NAME_PROGRAM_ID_STR: &str = "CiBbJADtSJnVQEsgXZpRfLyLNqDjwfvua8EMe9tPhKvo";
const TOKEN_BONDING_PROGRAM_ID_STR: &str = "4K8fnycnTESeyad4DqfXPF8TbkuyscPK4EjAwY35emyW";
// const TOKEN_BONDING_PROGRAM_ID_STR: &str = "CBvX6GXQ7CfoqWNG99wW22zzufz1owyH2tPSfEyus7JV";

fn main() {
    let default_decimals = &format!("{}", native_mint::DECIMALS);
    // let TOKEN_SWAP_PROGRAM_ID: Pubkey = Pubkey::from_str(TOKEN_SWAP_PROGRAM_ID_STR).unwrap();
    // let TOKEN_PROGRAM_ID: Pubkey = Pubkey::from_str(TOKEN_PROGRAM_ID_STR).unwrap();
    let TOKEN_SWAP_PROGRAM_ID: Pubkey = spl_token_swap::id();
    let TOKEN_PROGRAM_ID: Pubkey = spl_token::id();
    let TOKEN_BONDING_PROGRAM_ID: Pubkey = Pubkey::from_str(TOKEN_BONDING_PROGRAM_ID_STR).unwrap();

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
                       [mainnet-beta, testnet, devnet, localhost]",
                ),
        )
        .arg(fee_payer_arg().required(false))
        .subcommand(
            SubCommand::with_name("create-log-curve")
                .about("Create a new log curve")
                .arg(
                    Arg::with_name("g")
                        .long("g")
                        .validator(is_parsable::<u128>)
                        .value_name("g")
                        .takes_value(true)
                        .index(1)
                        .help("g in the log equation"),
                )
                .arg(
                    Arg::with_name("c")
                        .long("c")
                        .validator(is_parsable::<u128>)
                        .value_name("C")
                        .takes_value(true)
                        .index(2)
                        .help("c in the log equation"),
                )
                .arg(
                    Arg::with_name("max_iterations")
                        .long("max_iterations")
                        .validator(is_parsable::<u128>)
                        .value_name("MAX_ITERATIONS")
                        .takes_value(true)
                        .index(3)
                        .help("Max taylor expansion iterations on the log function"),
                )
                .arg(
                    Arg::with_name("base-relative")
                        .long("base-relative")
                        .validator(is_parsable::<bool>)
                        .value_name("IS_BASE_RELATIVE")
                        .help("Whether to price relative tot he base token"),
                ),
        )
        .subcommand(
            SubCommand::with_name("create-bonding")
                .about("Create a bonding curve from base to target")
                .arg(
                    Arg::with_name("curve")
                        .validator(is_valid_pubkey)
                        .value_name("TOKEN_ADDRESS")
                        .takes_value(true)
                        .index(1)
                        .required(true)
                        .help("The curve to use"),
                )
                .arg(
                    Arg::with_name("base")
                        .validator(is_valid_pubkey)
                        .value_name("TOKEN_ADDRESS")
                        .takes_value(true)
                        .index(2)
                        .required(true)
                        .help("The base token"),
                )
        )
        .get_matches();

    let (sub_command, sub_matches) = app_matches.subcommand();
    let client = RpcClient::new(normalize_to_url_if_moniker(
        app_matches.value_of("json_rpc_url").unwrap_or("devnet"),
    ));
    let cli_config = if let Some(config_file) = app_matches.value_of("config_file") {
        solana_cli_config::Config::load(config_file).unwrap_or_default()
    } else {
        solana_cli_config::Config::default()
    };
    let fee_payer = signer_from_path(
        &app_matches,
        app_matches
            .value_of("fee_payer")
            .unwrap_or(&cli_config.keypair_path),
        "fee_payer",
        &mut None,
    )
    .unwrap_or_else(|e| {
        eprintln!("error: {}", e);
        exit(1);
    });

    let create_token = |token: &Pubkey, fee_payer: &Signer, authority: &Pubkey, decimals: u8| {
        let minimum_balance_for_rent_exemption =
            client.get_minimum_balance_for_rent_exemption(Mint::LEN).unwrap();

        vec![
            create_account(
                &fee_payer.pubkey(),
                &token,
                minimum_balance_for_rent_exemption,
                Mint::LEN as u64,
                &TOKEN_PROGRAM_ID,
            ),
            spl_token::instruction::initialize_mint(
                &TOKEN_PROGRAM_ID,
                &token,
                &authority,
                Some(&authority),
                decimals,
            ).unwrap(),
        ]
    };
    let create_token_account =
        |account: &Pubkey, fee_payer: &dyn Signer, authority: &Pubkey, token: &Pubkey| {
            let balance = client
                .get_minimum_balance_for_rent_exemption(Account::LEN)
                .unwrap();

            let instructions = vec![
                create_account(
                    &fee_payer.pubkey(),
                    &account,
                    balance,
                    Account::LEN as u64,
                    &TOKEN_PROGRAM_ID,
                ),
                initialize_account(&TOKEN_PROGRAM_ID, &account, &token, &authority).unwrap(),
            ];

            instructions
        };

    match (sub_command, sub_matches) {
        ("create-log-curve", Some(arg_matches)) => {
            let g = value_t_or_exit!(arg_matches, "g", u128);
            let c = value_t_or_exit!(arg_matches, "c", u128);
            let taylor_iterations = value_t_or_exit!(arg_matches, "max_iterations", u16);
            let is_base_relative = value_t_or_exit!(arg_matches, "base-relative", bool);
            let curve = Keypair::new();
            let curve_key = curve.pubkey();
            let balance = client
                .get_minimum_balance_for_rent_exemption(LogCurveV0::LEN)
                .unwrap();

            let len = LogCurveV0::LEN;
            let instructions = [
                create_account(
                    &fee_payer.pubkey(),
                    &curve_key,
                    balance,
                    LogCurveV0::LEN as u64,
                    &TOKEN_BONDING_PROGRAM_ID,
                ),
                create_log_curve_v0(
                    &TOKEN_BONDING_PROGRAM_ID,
                    &fee_payer.pubkey(),
                    &curve_key,
                    g,
                    c,
                    taylor_iterations,
                    is_base_relative,
                ),
            ];
            let mut transaction =
                Transaction::new_with_payer(&instructions, Some(&fee_payer.pubkey()));
            let recent_blockhash = client.get_recent_blockhash().unwrap().0;
            transaction.sign(&vec![fee_payer.as_ref(), &curve], recent_blockhash);
            client.send_transaction(&transaction).unwrap();
            println!("Log curve {} created!", curve_key);
        }
        ("create-bonding", Some(arg_matches)) => {
            let base_key = Pubkey::from_str(arg_matches.value_of("base").unwrap()).unwrap();
            let target = Keypair::new();
            let target_key = target.pubkey();
            let curve_key = Pubkey::from_str(arg_matches.value_of("curve").unwrap()).unwrap();

            let (target_authority_key, _) =
                target_authority(&TOKEN_BONDING_PROGRAM_ID, &target_key);
            let create_token_instructions = create_token(&target.pubkey(), fee_payer.as_ref(), &target_authority_key, 9);
            let founder_rewards_key = get_associated_token_address(&fee_payer.pubkey(), &target.pubkey());
            let founder_rewards_instructions: Vec<Instruction> = vec![
                create_associated_token_account(
                    &fee_payer.pubkey(),
                    &fee_payer.pubkey(),
                    &target_key
                )
            ];

            let (token_bonding_key, _) = spl_token_bonding::processor::token_bonding_key(&TOKEN_BONDING_PROGRAM_ID, &target_key);
            let (base_storage_key, _) = storage_key(&TOKEN_BONDING_PROGRAM_ID, &token_bonding_key);
            let (storage_authority_key, _) =
                storage_authority(&TOKEN_BONDING_PROGRAM_ID, &base_storage_key);

            let create_instructions: Vec<Instruction> = vec![
                initialize_token_bonding_v0(
                    &TOKEN_BONDING_PROGRAM_ID,
                    &TOKEN_PROGRAM_ID,
                    &fee_payer.pubkey(),
                    &token_bonding_key,
                    Some(fee_payer.pubkey()),
                    &curve_key,
                    &base_key,
                    &target_key,
                    &founder_rewards_key,
                    &base_storage_key,
                    &storage_authority_key,
                    1000,
                    None
                )
            ];
            let instructions: Vec<Instruction> = create_token_instructions
                .into_iter()
                .chain(founder_rewards_instructions.into_iter())
                .chain(create_instructions.into_iter())
                .collect();

            let mut transaction =
                Transaction::new_with_payer(&instructions, Some(&fee_payer.pubkey()));
            let recent_blockhash = client.get_recent_blockhash().unwrap().0;
            transaction.sign(
                &vec![fee_payer.as_ref(), &target],
                recent_blockhash,
            );
            client.send_transaction(&transaction).unwrap();
            println!("Token defined at {}", target_key.to_string());
            println!("Bonding defined at {}", token_bonding_key)
        }
        _ => unreachable!(),
    }
}
