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

async function init() {
  const author = submitter();
  const bug = await storage(bug_id, {author});
  if (bug.author) {
    augment(bug.author);
    setVisible(bug.visible);

    // The people module summary reveals assignee.
    document.getElementById("module-people-subtitle").innerHTML = "";
  }
}

init();
