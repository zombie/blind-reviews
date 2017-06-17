"use strict";

const {$, BUGZILLA: {bug_id, user}} = window.wrappedJSObject;

async function storage(id, data = {}) {
  const bug = (await browser.storage.local.get({[id]: {}}))[id];
  if (data.author) {
    bug.author = data.author;
  }
  if ("visible" in data) {
    bug.visible = data.visible;
  }
  if (Object.keys(bug).length) {
    await browser.storage.local.set({[id]: bug});
  }
  return bug;
}

function setVisible(visible) {
  const options = {
    trigger: "left",
    selector: `.br-icon`,
    items: [{
      name: visible ? "Redact" : "Uncover",
    }],
    async callback() {
      await storage(bug_id, {visible: !visible});
      setVisible(!visible);
    },
  };
  $.contextMenu("destroy", ".br-icon");
  $.contextMenu(cloneInto(options, window, {cloneFunctions: true}));

  document.body.classList.toggle("br-blinded", !visible);
}

// Detect an active review request on the bug page.
function submitter() {
  const flags = document.querySelectorAll(`div.attach-flag .vcard_${user.id}`);

  for (const f of flags) {
    const type = f.previousElementSibling.textContent.trim();
    const vcard = f.parentNode.firstElementChild.className.match(/vcard_\d+/);
    if (vcard && type === "review?") {
      return vcard[0];
    }
  }
}

// Augment any mention of the author across the bug page.
function augment(author) {
  const vcards = document.querySelectorAll(`.${author}`);
  for (const vcard of vcards) {
    const icon = document.createElement("img");
    icon.src = browser.runtime.getURL("icon.png");
    icon.title = "Blind Reviews";
    icon.className = "br-icon";

    vcard.parentElement.insertBefore(icon, vcard);
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
