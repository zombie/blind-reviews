"use strict";

/* import-globals-from common.js */

// Send the blind review flag CC via the bugzilla rest API
function sendFlag(flag) {
  const url = `https://${location.host}/rest/bug/${bug_id}?Bugzilla_api_token=${api_token}`;
  return fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: new Headers({"Content-Type": "application/json"}),
    body: JSON.stringify({cc: {add: [`${flag}-blind-review@mozilla.bugs`]}}),
  });
}

// Add the <select> box for setting the blind review flag
function addFlagging(bug) {
  const box = document.querySelector("#buttonBox");
  const publish = document.querySelector("#publishButton");

  const options = ["don't log this review", "fully blind", "partially blind"];
  const select = document.createElement("select");
  select.append(...options.map(o => new Option(o)));

  select.selectedIndex = !bug.visible;
  publish.addEventListener("click", () => {
    storage(bug_id, {visible: true, published: true});
    if (select.selectedIndex > 0) {
      sendFlag(select.selectedIndex === 1 ? "fully" : "partially");
    }
  });

  box.insertBefore(select, box.firstChild);
  box.insertBefore(icon(), select);
}

async function splinterActual() {
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

  const intro = document.querySelectorAll("#patchIntro>.pre-wrap");
  for (const line of intro) {
    if (line.textContent.startsWith("# User ")) {
      line.textContent = "# User [redacted]";
    }
  }

  setVisible(bug.visible);
  if (!bug.published) {
    addFlagging(bug);
  }
}

function init() {
  const author = document.querySelector("#attachCreator");
  const observer = new MutationObserver(splinterActual);
  observer.observe(author, {childList: true});
}

init();
