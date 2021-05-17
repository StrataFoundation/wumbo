let error: string | null = null
let openloginKey: string | null = null

function setAccount(msg: any) {
  if (msg.type == 'ACCOUNT') {
    error = msg.data.error
    openloginKey = msg.data.openloginKey
  }
}

chrome.runtime.onMessage.addListener(setAccount)

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "popup");
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    setAccount(msg)
    if (msg.type == 'ACCOUNT') {
      port.postMessage({ openloginKey, error })
    }
  })
})

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type == 'LOAD_ACCOUNT') {
    sendResponse({ data: { openloginKey, error }, type: 'ACCOUNT' })
  }
})