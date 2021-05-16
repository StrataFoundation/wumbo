import {Account} from "@solana/web3.js";
import {AccountInfo as MintAccountInfo} from "@solana/spl-token";

let error: string | null = null
let account: Account | null = null
let solcloutAccount: MintAccountInfo | null = null


function setAccount(msg: any) {
  if (msg.type == 'ACCOUNT') {
    error = msg.data.error
    account = msg.data.account
    solcloutAccount = msg.data.solcloutAccount
  }
}

chrome.runtime.onMessage.addListener(setAccount)

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "popup");
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    setAccount(msg)
    if (msg.type == 'ACCOUNT') {
      port.postMessage({account, error, solcloutAccount})
    }
  })
})

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type == 'LOAD_ACCOUNT') {
    sendResponse({ data: { account, solcloutAccount, error }, type: 'ACCOUNT' })
  }
})