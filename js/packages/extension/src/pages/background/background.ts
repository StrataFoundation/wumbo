let activeTabId: number | undefined;

const toggleIcon = (url: string | undefined) => {
  let allowedUrls = ["twitter.com"];
  if (!url) return;

  if (!allowedUrls.some((subUrl) => url.includes(subUrl))) {
    chrome.browserAction.setIcon({
      path: {
        "16": "/assets/img/disabled-icon16.png",
        "32": "/assets/img/disabled-icon32.png",
      },
    });
  } else {
    chrome.browserAction.setIcon({
      path: {
        "16": "/assets/img/icon16.png",
        "32": "/assets/img/icon32.png",
      },
    });
  }
};

chrome.tabs.onActivated.addListener((activeInfo) => {
  let queryOptions = { active: true, currentWindow: true };
  activeTabId = activeInfo.tabId;

  chrome.tabs.query(queryOptions, (result) => {
    const [tab] = result;
    if (tab?.url) toggleIcon(tab.url);
  });
});

chrome.tabs.onUpdated.addListener((tabId, _, tab) => {
  if (tabId !== activeTabId || !tab.url) return;

  if (tab.url) toggleIcon(tab.url);
});

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
