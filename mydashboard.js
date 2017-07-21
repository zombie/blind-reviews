"use strict";

/* import-globals-from common.js */

async function onChild(records) {
  for (const record of records) {
    for (const flag of record.addedNodes) {
      const [author, type, bug] = flag.children;
      const visible = await storage(bug.textContent);

      if (type && type.textContent === "review" && !visible) {
        author.textContent = "[redacted]";
      }
    }
  }
}

function init() {
  const observer = new MutationObserver(onChild);
  const table = document.querySelector("#requestee_table");
  observer.observe(table, {childList: true, subtree: true});
}

init();
