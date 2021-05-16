import {Account, Connection} from "@solana/web3.js";
import {AccountInfo as MintAccountInfo, Token} from "@solana/spl-token";
import {useEffect, useState} from "react";
import {SolcloutInstance} from "../solclout-api/state";
import {SOLCLOUT_INSTANCE_KEY} from "../globals";
import {useConnection} from "@oyster/common/lib/contexts/connection"
import OpenLogin from "@toruslabs/openlogin";
import {getED25519Key} from "@toruslabs/openlogin-ed25519";

const getSolanaPrivateKey = (openloginKey: string) => {
  console.log(`Openlogin: ${openloginKey}`)
  const  { sk } = getED25519Key(openloginKey)
  return sk
}

interface AccountInfo {
  error?: string,
  account?: Account,
  solcloutAccount?: MintAccountInfo
}

const customauth = new OpenLogin({
  clientId: "BHgxWcEBp7kICzfoIUlL9kCmope2NRhrDz7d8ugBucqQqBel1Q7yDvkPfLrgZh140oLxyN0MgpmziL7UG7jZuWk",
  network: "testnet",
  // network: new Set(["devnet", "testnet", "localnet"]).has(connectionConfig.env) ? "testnet" : "mainnet",
  uxMode: 'popup'
});

const sendAccount = (openloginKey: string) => {
  const secretKey = getSolanaPrivateKey(openloginKey);
  const account = new Account(secretKey)

  // const solcloutAccount = await createAssociatedSolcloutMint(connection, account)
  chrome.runtime.sendMessage({
    type: 'ACCOUNT',
    data: {
      account,
      solcloutAccount: undefined
    }
  })
}

export const useLoggedInAccount = (): AccountInfo => {
  const [account, setAccount] = useState<Account>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    customauth.init()
      .catch(setError)
      .then(() => {
        if (customauth.privKey) {
          sendAccount(customauth.privKey)
        }
      })

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
  login: () => Promise<void>,
  logout: () => Promise<void>,
  accountInfo: AccountInfo
}
export const useLoginFromPopup = (): LoginState => {
  const accountInfo = useLoggedInAccount()

  const sendMsg = (type: string) => {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            type
          }
        );
      }
    });

    return Promise.resolve(undefined)
  }

  return {
    login: () => sendMsg("LOGIN"),
    logout: () => sendMsg("LOGOUT"),
    accountInfo
  }
}

const createAssociatedSolcloutMint = async (connection: Connection, account: Account): Promise<MintAccountInfo> => {
  const solcloutInstance = await SolcloutInstance.retrieve(connection, SOLCLOUT_INSTANCE_KEY)

  const solcloutMint = new Token(
    connection,
    solcloutInstance.solcloutToken,
    solcloutInstance.tokenProgramId,
    account
  )

  return solcloutMint.getOrCreateAssociatedAccountInfo(account.publicKey)
}

export const useLogin = (): LoginState => {
  const connection = useConnection()
  const [login, setLogin] = useState<() => Promise<void>>(() => Promise.resolve())
  const [logout, setLogout] = useState<() => Promise<void>>(() => Promise.resolve())

  const accountInfo = useLoggedInAccount()

  useEffect(() => {
    setLogout(() => async () =>{
      await customauth.logout()
      chrome.runtime.sendMessage({
        type: 'ACCOUNT',
        data: {}
      })
    })
    setLogin( () => async () => {
      try {
        let privateKey: string
        if (customauth.privKey) {
          privateKey = customauth.privKey;
        } else {
          const {privKey} = await customauth.login();
          privateKey = privKey
        }
        sendAccount(privateKey)
      } catch(e) {
        console.error(e)
        chrome.runtime.sendMessage({
          type: 'ACCOUNT',
          data: {
            error: e
          }
        })
      }
    })
  }, [connection])

  return {
    accountInfo,
    login,
    logout
  }
}
