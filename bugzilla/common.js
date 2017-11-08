"use strict";

const {$, BUGZILLA, Splinter} = window.wrappedJSObject;
const bug_id = BUGZILLA.bug_id || (Splinter && Splinter.bugId);
const {user, api_token} = BUGZILLA;

/* exported user api_token storage icon setVisible */

async function storage(id, visible) {
  if (visible != null) {
    return browser.storage.sync.set({[id]: visible | 0});
  }
  return (await browser.storage.sync.get(String(id)))[id];
}

function setVisible(visible) {
  const options = {
    trigger: "left",
    selector: `.br-icon`,
    items: [{
      name: visible ? "Redact" : "Uncover",
    }],
    async callback() {
      await storage(bug_id, !visible);
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
