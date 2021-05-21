import {useEffect, useState} from "react";
import {Connection, PublicKey} from "@solana/web3.js";
import {AccountInfo as TokenAccountInfo, Token} from "@solana/spl-token";
import {SolcloutInstance} from "../solclout-api/state";
import {SOLCLOUT_INSTANCE_KEY, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID,} from "../constants/globals";
import {useConnection} from "@oyster/common/lib/contexts/connection";
import {TokenAccountParser} from "@oyster/common/lib/contexts/accounts";

interface AccountInfo {
  error?: string;
  publicKey?: PublicKey;
  solcloutAccount?: TokenAccountInfo;
}

// TODO: Logged in account provider
export const useLoggedInAccount = (): AccountInfo => {
  const [publicKey, setPublicKey] = useState<PublicKey>();
  const [error, setError] = useState<string>();
  const [solcloutAccount, setSolcloutAccount] = useState<TokenAccountInfo>();
  const connection = useConnection();

  useEffect(() => {
    async function accountMsgListener(msg: any) {
      if (msg && msg.type == "WALLET") {
        msg.error && setError(error);
        if (msg.data.publicKey) {
          try {
            console.log(msg.data);
            const publicKeyParsed = new PublicKey(msg.data.publicKey.data);
            if (
              !publicKey ||
              publicKeyParsed.toString() != publicKey.toString()
            ) {
              setPublicKey(publicKeyParsed);

              const solcloutAccountFetched = await getAssociatedSolcloutAccount(
                connection,
                publicKeyParsed
              );
              setSolcloutAccount(solcloutAccountFetched || undefined);
            }
          } catch (e) {
            console.error(e);
            setError(e);
          }
        } else {
          setPublicKey(undefined);
        }
      }
    }

    const port = chrome.runtime.connect({ name: "popup" });

    chrome.runtime.sendMessage({ type: "LOAD_WALLET" }, accountMsgListener);

    // For popup
    port.onMessage.addListener(accountMsgListener);
    chrome.runtime.onMessage.addListener(accountMsgListener);
  }, []);

  return {
    publicKey,
    error,
    solcloutAccount,
  };
};

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
