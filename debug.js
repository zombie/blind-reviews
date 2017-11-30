"use strict";

chrome.storage.sync.get(null, storage => {
  document.body.innerHTML = "<pre>" + JSON.stringify(storage, null, 2) + "</pre>";
});

document.addEventListener("click", e => {
  chrome.storage.sync.clear();
});
