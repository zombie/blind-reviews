"use strict";

/* import-globals-from common.js */

// Detect an active review request on the bug page.
function submitter() {
  const flags = document.querySelectorAll(`div.attach-flag .vcard_${user.id}`);

  for (const f of flags) {
    const type = f.previousElementSibling;
    const vcard = f.parentNode.firstElementChild.className.match(/vcard_\d+/);
    if (vcard && type && type.textContent.endsWith("review?")) {
      return vcard[0];
    }
  }
}

// Augment any mention of the author across the bug page.
function augment(author) {
  const vcards = document.querySelectorAll(`.${author}`);
  for (const vcard of vcards) {
    const img = icon();
    vcard.parentElement.insertBefore(img, vcard);
    vcard.classList.toggle("br-vcard", true);
  }
}

async function mozreview(records) {
  const visible = await storage(bug_id);
  for (const record of records) {
    for (const tr of record.addedNodes) {
      const td = tr.firstElementChild;
      if (td && td.textContent && !visible) {
        td.textContent = "";
      }
    }
  }
}

async function init() {
  const author = submitter();
  const visible = await storage(bug_id);
  if (author) {
    augment(author);
    setVisible(visible);

    const changes = document.querySelectorAll(".activity>.change");
    for (const c of changes) {
      if (c.textContent.startsWith("Assignee:")) {
        c.textContent = "Assignee: [redacted]";
      }
    }

    // The people module summary reveals assignee.
    document.getElementById("module-people-subtitle").innerHTML = "";

    const tbody = document.querySelector("tbody.mozreview-request");
    const observer = new MutationObserver(mozreview);
    observer.observe(tbody, {childList: true});
  }
}

init();
