import {Connection, PublicKey} from "@solana/web3.js";
import {AccountInfo as TokenAccountInfo, Token} from "@solana/spl-token";
import {SolcloutInstance} from "../solclout-api/state";
import {SOLCLOUT_INSTANCE_KEY, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID,} from "../constants/globals";
import {TokenAccountParser} from "@oyster/common/lib/contexts/accounts";

const getAssociatedSolcloutAccount = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<TokenAccountInfo | null> => {
  const solcloutInstance = await SolcloutInstance.retrieve(
    connection,
    SOLCLOUT_INSTANCE_KEY
  );

  const associatedToken = await Token.getAssociatedTokenAddress(
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    solcloutInstance.solcloutToken,
    publicKey
  );
  const accountInfo = await connection.getAccountInfo(publicKey);
  return accountInfo && TokenAccountParser(associatedToken, accountInfo).info;
};
