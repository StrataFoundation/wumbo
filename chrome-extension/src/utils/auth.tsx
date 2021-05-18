import {Account, Connection, PublicKey} from "@solana/web3.js";
import {AccountInfo as TokenAccountInfo, Token} from "@solana/spl-token";
import {useEffect, useState} from "react";
import {SolcloutInstance} from "../solclout-api/state";
import {SOLCLOUT_INSTANCE_KEY} from "../globals";
import {useConnection} from "@oyster/common/lib/contexts/connection"
import OpenLogin from "@toruslabs/openlogin";
import {getED25519Key} from "@toruslabs/openlogin-ed25519";

const getSolanaPrivateKey = (openloginKey: string) => {
  console.log("Open:" + openloginKey)
  const  { pk, sk } = getED25519Key(openloginKey)
  console.log(`Key: ${new PublicKey(pk).toBase58()}`)
  return sk
}

const getSolanaAccount = (openloginKey: string) => {
  const secretKey = getSolanaPrivateKey(openloginKey);
  return new Account(secretKey)
}

interface AccountInfo {
  error?: string,
  account?: Account,
  solcloutAccount?: TokenAccountInfo
}

const customauth = new OpenLogin({
  clientId: "BHgxWcEBp7kICzfoIUlL9kCmope2NRhrDz7d8ugBucqQqBel1Q7yDvkPfLrgZh140oLxyN0MgpmziL7UG7jZuWk",
  network: "testnet",
  // network: new Set(["devnet", "testnet", "localnet"]).has(connectionConfig.env) ? "testnet" : "mainnet",
  uxMode: 'popup'
});

const sendAccount = (openloginKey: string) => {
  console.log(`SENDING OPEN ${openloginKey}`)
  chrome.runtime.sendMessage({
    type: 'ACCOUNT',
    data: {
      openloginKey
    }
  })
}


export const useLoggedInAccount = (): AccountInfo => {
  const [account, setAccount] = useState<Account>()
  const [error, setError] = useState<string>()
  const [solcloutAccount, setSolcloutAccount] = useState<TokenAccountInfo>()
  const connection = useConnection()

  useEffect(() => {
    async function accountMsgListener(msg: any) {
      if (msg.type == 'ACCOUNT') {
        msg.data.error && setError(error)
        if (msg.data.openloginKey) {
          try {
            const account = getSolanaAccount(msg.data.openloginKey)
            setAccount(account)

            console.log(account.secretKey)
            const solcloutAccountFetched = await getOrCreateAssociatedSolcloutMint(connection, account)
            setSolcloutAccount(solcloutAccountFetched)
          } catch (e) {
            setError(e)
          }
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
    error,
    solcloutAccount
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

const getOrCreateAssociatedSolcloutMint = async (connection: Connection, account: Account): Promise<TokenAccountInfo> => {
  const solcloutInstance = await SolcloutInstance.retrieve(connection, SOLCLOUT_INSTANCE_KEY)

  const solcloutMint = new Token(
    connection,
    solcloutInstance.solcloutToken,
    solcloutInstance.tokenProgramId,
    account
  )

  return solcloutMint.getOrCreateAssociatedAccountInfo(account.publicKey)
}

const attemptCachedLogin = () => {
  useEffect(() => {
    customauth.init()
      .then(async () => {
        if (customauth.privKey) {
          sendAccount(customauth.privKey)
        }
      })
      .catch((e) => {
        console.error(e)
      })
  }, [])
}
export const useLogin = (): LoginState => {
  attemptCachedLogin()
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
