"use strict";

const {$, BUGZILLA, Splinter} = window.wrappedJSObject;
const bug_id = BUGZILLA.bug_id || Splinter.bugId;
const user = BUGZILLA.user;

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

function icon() {
  const img = document.createElement("img");
  img.src = browser.runtime.getURL("icon.png");
  img.title = "Blind Reviews";
  img.className = "br-icon";
  return img;
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

async function show_bug() {
  const author = submitter();
  const bug = await storage(bug_id, {author});
  if (bug.author) {
    augment(bug.author);
    setVisible(bug.visible);

    // The people module summary reveals assignee.
    document.getElementById("module-people-subtitle").innerHTML = "";
  }
}

async function splinter() {
  const bug = await storage(bug_id);
  const ac = document.querySelector("#attachCreator");
  const br = document.querySelector("#bugReporter");
  const mentions = [ac];

  if (ac.textContent === br.textContent) {
    mentions.push(br);
  }

  const flags = document.querySelectorAll(`#flags span[title="${ac.textContent}"]`);
  for (const f of flags) {
    mentions.push(f);
  }

  for (const m of mentions) {
    const img = icon();
    const fn = document.createElement("span");
    fn.className = "br-r";

    m.parentNode.insertBefore(img, m);
    m.parentNode.insertBefore(fn, m);
    m.parentNode.classList.toggle("br-vcard", true);
  }

  const comments = document.querySelectorAll("#patchIntro>.pre-wrap");
  for (const c of comments) {
    if (!bug.visible && c.textContent.startsWith("# User ")) {
      c.textContent = "# User [redacted]";
    }
  }

  setVisible(bug.visible);
}

function init() {
  const PAGES = {
    "/show_bug.cgi": show_bug,
    "/page.cgi": window.addEventListener("load", splinter),
  };
  PAGES[window.location.pathname]();
}

init();
