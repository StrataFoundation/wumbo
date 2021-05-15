import React, {useContext, useState} from "react";
import {Mint, SolcloutCreator} from "../solclout-api/state";
import {buyCreatorCoinsWithWallet} from "../solclout-api/bindings";
import {KEYPAIR, SOLCLOUT_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID} from "../globals";
import {Account} from "@solana/web3.js";
import {useConnection} from "@oyster/common/lib/contexts/connection"

export interface Action {
  type: string,
  prettyName: string,
  data: ActionData
}

export interface ActionData {
  creator: SolcloutCreator,
  mint: Mint,
  creatorName: string
}

type Dispatch = (action: Action) => void
export const DispatchActionContext = React.createContext<Dispatch>(() => {})

export const useCreatorActions = () => {
  const dispatch = useContext(DispatchActionContext)

  return dispatch
}

export const useBuyAction = ({ creator }: ActionData): [(amount: number) => Promise<void>, string | undefined] => {
  const [error, setError] = useState<string>()
  const connection = useConnection()

  return [
    (amount) => {
      try {
        throw "somerr"
        return buyCreatorCoinsWithWallet(connection, {
          programId: SOLCLOUT_PROGRAM_ID,
          splAssociatedTokenAccountProgramId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
          solcloutCreator: creator.publicKey,
          purchaserWallet: new Account(KEYPAIR.secretKey),
          lamports: Math.floor(amount * Math.pow(10, 9))
        })
          .catch(err => setError(err.toString()))
      } catch (e) {
        setError(e)
        throw e
      }
    },
    error
  ]
}