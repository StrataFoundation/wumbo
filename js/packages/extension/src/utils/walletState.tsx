import { PublicKey } from "@solana/web3.js";
import { AccountInfo as TokenAccountInfo, Token } from "@solana/spl-token";
import { useEffect, useState } from "react";
import {
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "../constants/globals";
import { TokenAccountParser } from "@oyster/common";
import { useAccount } from "./account";
import { AccountInfo } from "@solana/web3.js";

const fetch = (wallet: PublicKey, mint: PublicKey) =>
  Token.getAssociatedTokenAddress(
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    wallet
  );

interface AssocState {
  loading: boolean;
  result?: PublicKey;
}
export function useAssociatedTokenAddress(
  wallet: PublicKey | undefined | null,
  mint: PublicKey | undefined
): AssocState {
  const [state, setState] = useState<AssocState>({ loading: true });
  useEffect(() => {
    if (!mint || !wallet) {
      return;
    }

    fetch(wallet, mint).then((result) => {
      if (!state.result || result.toString() != state.result.toString()) {
        setState({ result, loading: false });
      }
    });
  }, [wallet, mint]);

  return state;
}

export interface AssociatedAccountState {
  associatedAccount?: TokenAccountInfo;
  loading: boolean;
}
export function useAssociatedAccount(
  wallet: PublicKey | undefined | null,
  mint: PublicKey | undefined
): AssociatedAccountState {
  const { result: associatedTokenAddress, loading: associatedTokenLoading } =
    useAssociatedTokenAddress(wallet, mint);
  const { info: associatedAccount, loading } = useAccount(
    associatedTokenAddress,
    (pubkey: PublicKey, acct: AccountInfo<Buffer>) => {
      return TokenAccountParser(pubkey, acct).info;
    }
  );

  return {
    associatedAccount,
    loading,
  };
}
