"use strict";

const {$, BUGZILLA, Splinter} = window.wrappedJSObject;
const bug_id = BUGZILLA.bug_id || (Splinter && Splinter.bugId);
const {user, api_token} = BUGZILLA;

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

async function request_cgi() {
  const user = document.querySelector("#moz_login span.anchor").textContent;
  const headers = document.querySelectorAll("h3");
  for (const h of headers) {
    if (!h.textContent.endsWith("review")) {
      continue;
    }
    for (const tr of h.nextElementSibling.querySelectorAll("tr")) {
      const a = tr.querySelector("a[href^='show_bug.cgi?id=']");
      const bug_id = a && a.href.match(/(\d+)$/)[1];
      const bug = a && await storage(bug_id);
      const td = tr.firstElementChild;

      if (!td.textContent.includes(user) && bug && !bug.visible) {
        td.textContent = "[redacted]";
      }
    }
  }
}

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

function splinter() {
  const author = document.querySelector("#attachCreator");
  const observer = new MutationObserver(splinterActual);
  observer.observe(author, {childList: true});
}

async function onChild(records) {
  for (const record of records) {
    for (const flag of record.addedNodes) {
      const [author, type, bug] = flag.children;
      const {visible} = await storage(bug && bug.textContent);

      if (type && type.textContent === "review" && !visible) {
        author.textContent = "[redacted]";
      }
    }
  }
}

function dashboard() {
  const observer = new MutationObserver(onChild);
  const table = document.querySelector("#requestee_table");
  observer.observe(table, {childList: true, subtree: true});
}

function page_cgi() {
  const dash = location.search.startsWith("?id=mydashboard.html");
  const page = dash ? dashboard : splinter;
  page();
}

function init() {
  const PAGES = {
    "/show_bug.cgi": show_bug,
    "/request.cgi": request_cgi,
    "/page.cgi": page_cgi,
  };
  PAGES[window.location.pathname]();
}

init();
