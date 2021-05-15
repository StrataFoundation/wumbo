import React, {useContext, useEffect, useState} from "react";
import {Mint, SolcloutCreator} from "../solclout-api/state";
import {buyCreatorCoinsWithWallet} from "../solclout-api/bindings";
import {KEYPAIR, SOLCLOUT_PROGRAM_ID, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID} from "../globals";
import {Account} from "@solana/web3.js";
import {ENDPOINTS, useConnection, useConnectionConfig} from "@oyster/common/lib/contexts/connection"
import {getED25519Key} from "@toruslabs/openlogin-ed25519"
import OpenLogin from "@toruslabs/openlogin"

const getSolanaPrivateKey = (openloginKey: string) => {
  const  { sk } = getED25519Key(openloginKey)
  return sk
}


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

interface AccountInfo {
  error?: string,
  account?: Account,
}

export const useLoggedInAccount = (): AccountInfo => {
  const [account, setAccount] = useState<Account>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    function accountMsgListener(msg: any) {
      if (msg.type == 'ACCOUNT') {
        msg.data.error && setError(error)
        if (msg.data.account) {
          const account = msg.data.account
          setAccount(new Account(account._keypair.privateKey))
        }
      }
    }

    const port = chrome.runtime.connect({ name: "popup" })

    chrome.runtime.sendMessage({type: 'LOAD_ACCOUNT'}, accountMsgListener)

    // For popup
    port.onMessage.addListener(accountMsgListener)
    chrome.runtime.onMessage.addListener(accountMsgListener)
  }, [])

  return {
    account,
    error
  }
}

interface LoginState {
  login: () => Promise<Account | undefined>,
  error?: string,
  account?: Account
}
export const useLoginFromPopup = (): LoginState => {
  const { account, error } = useLoggedInAccount()

  const login = () => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: 'LOGIN'
          }
        );
      }
    });

    return Promise.resolve(undefined)
  }

  return {
    login,
    account,
    error
  }
}

export const useLogin = (): LoginState => {
  const connectionConfig = useConnectionConfig()
  connectionConfig.setEndpoint(ENDPOINTS[3].endpoint)
  connectionConfig.env = "devnet"

  const { account, error } = useLoggedInAccount()

  const customauth = new OpenLogin({
    clientId: "BHgxWcEBp7kICzfoIUlL9kCmope2NRhrDz7d8ugBucqQqBel1Q7yDvkPfLrgZh140oLxyN0MgpmziL7UG7jZuWk",
    network: new Set(["devnet", "testnet", "localnet"]).has(connectionConfig.env) ? "testnet" : "mainnet",
    uxMode: 'popup'
  });

  const login = async () => {
    try {
      await customauth.init()

      if (customauth.privKey) {
        const privateKey = customauth.privKey;
        const secretKey = getSolanaPrivateKey(privateKey);
        const account = new Account(secretKey)
        console.log("Sending... in here")
        chrome.runtime.sendMessage({
          type: 'ACCOUNT',
          data: {
            account
          }
        })
        return account
      } else {
        const {privKey} = await customauth.login();
        const secretKey = getSolanaPrivateKey(privKey);
        console.log("Sending...")
        chrome.runtime.sendMessage({
          type: 'ACCOUNT',
          data: {
            account: new Account(secretKey)
          }
        })
      }
      // const res = await customauth
      //   .triggerLogin({
      //     typeOfLogin: "twitter",
      //     verifier: "dev-chewingglass",
      //     clientId: "bdwH3UjEErqOK55fZL7EQnURT13hXMXm",
      //     jwtParams: { domain: "https://dev-chewingglass.us.auth0.com" },
      //   })
      //
      //   // const userInfo = res.userInfo;
      // const { sk } = OpenloginUtils.getED25519Key(res.privateKey);
      // setAccount(new Account(sk))
    } catch(e) {
      console.error(e)
      chrome.runtime.sendMessage({
        type: 'ACCOUNT',
        data: {
          error: e
        }
      })
    }
  }
  return {
    account,
    error,
    login
  }
}