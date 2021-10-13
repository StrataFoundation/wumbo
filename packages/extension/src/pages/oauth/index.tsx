const params = new URLSearchParams(window.location.search);
chrome.runtime.sendMessage({
  type: "CLAIM",
  data: {
    code: params.get("code"),
    name: params.get("name"),
  },
});
