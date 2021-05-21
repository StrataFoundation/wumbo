import {PublicKey} from "@solana/web3.js";
import {AccountInfo as TokenAccountInfo, Token} from "@solana/spl-token";
import {useReactiveAccount} from "./creatorState";
import {useEffect, useState} from "react";
import {SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID,} from "../constants/globals";
import {TokenAccountParser} from "@oyster/common/lib/contexts/accounts";

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
  wallet: PublicKey,
  mint: PublicKey
): AssocState {
  const [state, setState] = useState<AssocState>({ loading: true });
  useEffect(() => {
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
  wallet: PublicKey,
  mint: PublicKey
): AssociatedAccountState {
  const {
    result: associatedTokenAddress,
    loading: associatedTokenLoading,
  } = useAssociatedTokenAddress(wallet, mint);
  const { account, loading } = useReactiveAccount(associatedTokenAddress);
  const [state, setState] = useState<TokenAccountInfo>();

  useEffect(() => {
    associatedTokenAddress &&
      account &&
      setState(TokenAccountParser(associatedTokenAddress, account).info);
  }, [associatedTokenAddress, account]);

  return {
    loading: loading || associatedTokenLoading,
    associatedAccount: state,
  };
}
