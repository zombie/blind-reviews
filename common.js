"use strict";

const {$, BUGZILLA, Splinter} = window.wrappedJSObject;
const bug_id = BUGZILLA.bug_id || (Splinter && Splinter.bugId);
const {user, api_token} = BUGZILLA;

/* exported user api_token storage icon setVisible */

async function storage(id, data = {}) {
  const bug = (await browser.storage.local.get({[id]: {}}))[id];
  if (data.author) {
    bug.author = data.author;
  }
  if (data.published) {
    bug.published = data.published;
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

function icon() {
  const img = document.createElement("img");
  img.src = browser.runtime.getURL("icon.png");
  img.title = "Blind Reviews";
  img.className = "br-icon";
  return img;
}
