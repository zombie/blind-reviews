'use strict';

const {$, BUGZILLA} = window.wrappedJSObject;
const icon = browser.runtime.getURL('icon.png');

/**
 * Toggles the page between blinded and revealed modes.
 */
function toggle() {
  document.body.classList.toggle('br-blinded');
}

/**
 * Detects any active review requests on the bug page.
 * @return {Set<vcard_ID>} set of user ID css classes
 */
function requesters() {
  const user = BUGZILLA.user.id;
  const mentions = document.querySelectorAll(`div.attach-flag .vcard_${user}`);
  const result = new Set();

  for (const m of mentions) {
    const flag = m.previousElementSibling.textContent.trim();
    const user = m.parentElement.firstElementChild.className.match(/vcard_\d+/);
    if (user && flag === 'review?') {
      result.add(user[0]);
    }
  }
  return result;
}

/**
 * Detects any active review requests on the bug page.
 * @arg {String} user vcard ID css class
 */
function augment(user) {
  const vcards = document.querySelectorAll(`.${user}`);
  for (const vcard of vcards) {
    vcard.innerHTML = `
      <img class=br-icon src="${icon}" title="Blind Reviews">
      <span class=br-redacted>[redacted]</span>
      <span class=br-original>${vcard.innerHTML}</span>`;
    vcard.firstElementChild.addEventListener('click', () => {
      // Work around double context menus for the icon.
      $.contextMenu('destroy', `.${user}`);
    });
  }
}

/**
 * Activate the extension if there are any review requests.
 */
function activate() {
  const users = requesters();
  if (!users.size) {
    return;
  }
  for (const user of users) {
    augment(user);
  }

  const options = {
    trigger: 'left',
    selector: `.br-icon`,
    items: [{name: 'Toggle'}],
    callback: toggle,
  };
  $.contextMenu(cloneInto(options, window, {cloneFunctions: true}));

  // The people module summary reveals assignee.
  document.getElementById('module-people-subtitle').innerHTML = '';
  toggle();
}

activate();
