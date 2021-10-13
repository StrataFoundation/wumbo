import { Connection, PublicKey } from "@solana/web3.js";
import { AccountInfo as TokenAccountInfo, Token } from "@solana/spl-token";
import { WumboInstance } from "@wum.bo/spl-wumbo";
import {
  WUMBO_INSTANCE_KEY,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "wumbo-common";
import { TokenAccountParser } from "@oyster/common";

const getAssociatedSolcloutAccount = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<TokenAccountInfo | null> => {
  const wumboInstance = await WumboInstance.retrieve(
    connection,
    WUMBO_INSTANCE_KEY
  );

  const associatedToken = await Token.getAssociatedTokenAddress(
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    wumboInstance.wumboMint,
    publicKey
  );
  const accountInfo = await connection.getAccountInfo(publicKey);
  return accountInfo && TokenAccountParser(associatedToken, accountInfo).info;
};
