import {Account} from "@solana/web3.js";

function polling() {
  console.log("polling");
  setTimeout(polling, 1000 * 30);
}

polling();

let error: string | null = null
let account: Account | null = null

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type == 'ACCOUNT') {
    error = msg.data.error
    account = msg.data.account
  }
})

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "popup");
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.type == 'ACCOUNT') {
      port.postMessage({account, error})
    }
  })
})

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type == 'LOAD_ACCOUNT') {
    error && sendResponse({ data: { error }, type: 'ACCOUNT' })
    account && sendResponse({ data: { account }, type: 'ACCOUNT' })
  }
})