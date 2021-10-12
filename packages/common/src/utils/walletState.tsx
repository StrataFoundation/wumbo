import { PublicKey } from "@solana/web3.js";
import { AccountInfo as TokenAccountInfo, Token } from "@solana/spl-token";
import { useEffect, useMemo, useState } from "react";
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
    }).catch(() => {});
  }, [wallet, mint]);

  return state;
}

export interface AssociatedAccountState {
  associatedAccount?: TokenAccountInfo;
  associatedAccountKey?: PublicKey;
  loading: boolean;
}
export function useAssociatedAccount(
  walletOrAta: PublicKey | undefined | null,
  mint: PublicKey | undefined
): AssociatedAccountState {
  const { result: associatedTokenAddress, loading: associatedTokenLoading } =
    useAssociatedTokenAddress(walletOrAta, mint);
  const parser = (pubkey: PublicKey, acct: AccountInfo<Buffer>) => {
    return TokenAccountParser(pubkey, acct)?.info;
  }
  const { info: associatedAccount, loading } = useAccount(
    associatedTokenAddress,
    parser
  );
  const { info: account, loading: loading2 } = useAccount(
    walletOrAta || undefined,
    parser
  );

  const result = useMemo(() => {
    if (account?.mint === mint) { // The passed value is the ata
      return account;
    } else {
      return associatedAccount
    }
  }, [associatedAccount, account])

  return {
    associatedAccount: result,
    loading: loading || loading2,
    associatedAccountKey: associatedTokenAddress
  };
}
