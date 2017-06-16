"use strict";

const {$, BUGZILLA} = window.wrappedJSObject;
const icon = browser.runtime.getURL("icon.png");

/**
 * Toggles the page between blinded and revealed modes.
 */
function toggle() {
  document.body.classList.toggle("br-blinded");
}

/**
 * Detect an active review requests on the bug page.
 * @returns {string} the submitter's vcard ID css class
 */
function submitter() {
  const user = BUGZILLA.user.id;
  const flags = document.querySelectorAll(`div.attach-flag .vcard_${user}`);

  for (const f of flags) {
    const type = f.previousElementSibling.textContent.trim();
    const vcard = f.parentNode.firstElementChild.className.match(/vcard_\d+/);
    if (vcard && type === "review?") {
      return vcard[0];
    }
  }
}

/**
 * Detects any active review requests on the bug page.
 * @arg {string} user vcard_ID css class
 */
function augment(user) {
  const vcards = document.querySelectorAll(`.${user}`);
  for (const vcard of vcards) {
    vcard.innerHTML = `
      <img class=br-icon src="${icon}" title="Blind Reviews">
      <span class=br-redacted>[redacted]</span>
      <span class=br-original>${vcard.innerHTML}</span>`;
    vcard.firstElementChild.addEventListener("click", () => {
      // Work around double context menus for the icon.
      $.contextMenu("destroy", `.${user}`);
    });
  }
}

/**
 * Activate the extension if there are any review requests.
 */
function activate() {
  const user = submitter();
  if (!user) {
    return;
  }
  augment(user);

  const options = {
    trigger: "left",
    selector: `.br-icon`,
    items: [{name: "Toggle"}],
    callback: toggle,
  };
  $.contextMenu(cloneInto(options, window, {cloneFunctions: true}));

  // The people module summary reveals assignee.
  document.getElementById("module-people-subtitle").innerHTML = "";
  toggle();
}

activate();
