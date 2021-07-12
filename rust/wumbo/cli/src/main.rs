use std::process::exit;
use std::str::FromStr;

use clap::{
    App, AppSettings, Arg, crate_description, crate_name, crate_version, SubCommand,
};
use spl_wumbo::processor::wumbo_authority;
use solana_clap_utils::fee_payer::fee_payer_arg;
use solana_clap_utils::input_validators::{is_url_or_moniker, is_valid_pubkey, normalize_to_url_if_moniker};
use solana_clap_utils::keypair::signer_from_path;
use solana_client::rpc_client::RpcClient;
use solana_sdk::transaction::Transaction;
use solana_program::pubkey::Pubkey;
use spl_wumbo::instruction::initialize_wumbo;

const NAME_PROGRAM_ID_STR: &str = "FV42ih6c4jfUTHRbqT8tCVo67UYFMssjavmT3XeNBsdX";
const WUMBO_PORGRAM_ID_STR: &str = "AyvifSXGFuXadeve8y66cLQaPgRLfWwDBb8H7TJvTSse";
// BRbG1myx3zXz8JMBTuvyJPbTwgpSPZdxypVcvbGGnPcE
fn main() {
    // let TOKEN_SWAP_PROGRAM_ID: Pubkey = Pubkey::from_str(TOKEN_SWAP_PROGRAM_ID_STR).unwrap();
    // let TOKEN_PROGRAM_ID: Pubkey = Pubkey::from_str(TOKEN_PROGRAM_ID_STR).unwrap();
    let NAME_PROGRAM_ID: Pubkey = Pubkey::from_str(NAME_PROGRAM_ID_STR).unwrap();
    let WUMBO_PORGRAM_ID: Pubkey = Pubkey::from_str(WUMBO_PORGRAM_ID_STR).unwrap();

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
            SubCommand::with_name("create-wumbo-instance")
                .about("Create a wumbo instance")
                .arg(
                    Arg::with_name("wumbo_token")
                        .validator(is_valid_pubkey)
                        .value_name("TOKEN_ADDRESS")
                        .takes_value(true)
                        .index(1)
                        .required(true)
                        .help("The wumbo token to make an instance from")
                )
                .arg(
                    Arg::with_name("curve")
                        .validator(is_valid_pubkey)
                        .value_name("TOKEN_ADDRESS")
                        .takes_value(true)
                        .index(2)
                        .required(true)
                        .help("The curve to use"),
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


    match (sub_command, sub_matches) {
        ("create-wumbo-instance", Some(arg_matches)) => {
            let curve_key = Pubkey::from_str(arg_matches.value_of("curve").unwrap()).unwrap();
            let wumbo_token_id = Pubkey::from_str(
                arg_matches.value_of("wumbo_token").unwrap()
            ).unwrap();
            let (wumbo_instance, _) = wumbo_authority(&WUMBO_PORGRAM_ID, &wumbo_token_id);
            let instructions = [
                initialize_wumbo(
                    &WUMBO_PORGRAM_ID,
                    &fee_payer.pubkey(),
                    &wumbo_instance,
                    &wumbo_token_id,
                    &curve_key,
                    &NAME_PROGRAM_ID,
                ),
            ];
            let mut transaction = Transaction::new_with_payer(&instructions, Some(&fee_payer.pubkey()));
            let recent_blockhash = client.get_recent_blockhash().unwrap().0;
            transaction.sign(&vec![fee_payer.as_ref()], recent_blockhash);
            client.send_transaction(&transaction).unwrap();
            println!("Wumbo instance created at {}", wumbo_instance)
        },
        _ => unreachable!(),
    }
}
