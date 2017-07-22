"use strict";

/* import-globals-from common.js */

const FLAGS = ["fully-blind-review@mozilla.bugs", "partially-blind-review@mozilla.bugs"];

// Make a Bugzilla rest API request
async function rest(method, data) {
  const url = `https://${location.host}/rest/bug/${bug_id}?Bugzilla_api_token=${api_token}`;
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: new Headers({"Content-Type": "application/json"}),
    body: JSON.stringify(data),
  });
  return response.json();
}

// Add <select> for picking the blind review flag
function addTracking(visible) {
  const box = document.querySelector("#buttonBox");

  const options = ["fully blind", "partially blind", "don't track this review"];

  const select = document.createElement("select");
  select.append(...options.map(o => new Option(o)));
  select.selectedIndex = [undefined, 0, 1].indexOf(visible);

  const original = document.querySelector("#publishButton");
  const publish = original.cloneNode();
  original.replaceWith(publish);

  publish.addEventListener("click", async () => {
    if (select.selectedIndex < 2) {
      await rest("PUT", {cc: {add: [FLAGS[select.selectedIndex]]}});
    }
    await storage(bug_id, true);
    Splinter.publishReview();
  });

  box.insertBefore(select, box.firstChild);
  box.insertBefore(icon(), select);
}

async function splinter() {
  const visible = await storage(bug_id);
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

  setVisible(visible);

  const json = await rest();
  if (!json.bugs[0].cc.some(m => FLAGS.includes(m))) {
    addTracking(visible);
  }
}

function init() {
  const author = document.querySelector("#attachCreator");
  if (author.textContent) {
    splinter();
  } else {
    const observer = new MutationObserver(splinter);
    observer.observe(author, {childList: true});
  }
}

init();
