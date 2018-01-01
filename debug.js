"use strict";

chrome.storage.sync.get(null, storage => {
  const pre = document.createElement("pre");
  pre.textContent = JSON.stringify(storage, null, 2);
  document.body.appendChild(pre);
});

document.addEventListener("click", e => {
  chrome.storage.sync.clear();
});
