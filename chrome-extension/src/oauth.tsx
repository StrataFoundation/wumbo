chrome.runtime.sendMessage({
  type: "CLAIM", data: {
    code: new URLSearchParams(window.location.search).get("code")
  }
})
window.close()