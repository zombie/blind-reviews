"use strict";

async function storage(id, visible) {
  if (visible != null) {
    return browser.storage.sync.set({[id]: visible | 0});
  }
  return (await browser.storage.sync.get(String(id)))[id];
}

async function init() {
  const meta = document.querySelector(".review-request-meta");
  const author = document.querySelector("#mozreview-review-header>a+a");
  const bug_id = author.textContent.match(/\d+/)[0];
  const visible = await storage(bug_id);

  if (!visible) {
    meta.firstChild.textContent = "[redacted]";
  }
}

init();
