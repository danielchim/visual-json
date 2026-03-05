chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("openMode", (result) => {
    applyOpenMode(result.openMode ?? "popup");
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.openMode) {
    applyOpenMode(changes.openMode.newValue);
  }
});

function applyOpenMode(mode: string) {
  if (mode === "tab") {
    chrome.action.setPopup({ popup: "" });
  } else {
    chrome.action.setPopup({ popup: "src/popup/index.html" });
  }
}

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("src/tab/index.html") });
});
