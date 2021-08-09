chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  // @ts-ignore
  (async () => {
    // Forward along
    if (msg.type == "CLAIM") {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach(
          (tab) => tab.id && chrome.tabs.sendMessage(tab.id, msg, () => {})
        );
      });
    }
  })();

  return true;
});
