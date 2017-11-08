"use strict";

/* import-globals-from common.js */

async function init() {
  const user = document.querySelector("#moz_login span.anchor").textContent;
  const headers = document.querySelectorAll("h3");
  for (const h of headers) {
    if (!h.textContent.endsWith("review")) {
      continue;
    }
    for (const tr of h.nextElementSibling.querySelectorAll("tr")) {
      const a = tr.querySelector("a[href^='show_bug.cgi?id=']");
      const bug_id = a && a.href.match(/(\d+)$/)[1];
      const visible = await storage(bug_id);
      const td = tr.firstElementChild;

      if (a && !td.textContent.includes(user) && !visible) {
        td.textContent = "[redacted]";
      }
    }
  }
}

init();
