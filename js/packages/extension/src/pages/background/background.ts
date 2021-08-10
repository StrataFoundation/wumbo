// Tie into when extension icon is clicked
chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id as any, { type: "TOGGLE_WUMBO" }, () => {});
  });
});

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  // @ts-ignore
  (async () => {
    // Forward along
    if (msg.type == "CLAIM") {
      chrome.tabs.query({}, function (tabs) {
        tabs.forEach((tab) => tab.id && chrome.tabs.sendMessage(tab.id, msg, () => {}));
      });
    }
  })();

  return true;
});
