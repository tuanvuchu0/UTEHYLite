chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.remove("autoLogin");
});
