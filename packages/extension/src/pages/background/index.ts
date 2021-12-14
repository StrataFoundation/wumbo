chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  // Forward along
  if (msg.type == "CLAIM") {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(
        (tab) => tab.id && chrome.tabs.sendMessage(tab.id, msg, () => {})
      );
    });
  }

  sendResponse();
  return true;
});
