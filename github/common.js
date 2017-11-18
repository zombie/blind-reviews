"use strict";

function parsePR(url) {
  const match = url.match(/^https\:\/\/github.com\/([\w-]+\/[\w-]+\/pull\/[\d]+)/);
  return match && match[1];
}

const observer = {
  listeners: new Map(),

  observe(mutations) {
    // Multiple events get coalesced when inserting nested nodes,
    // using a Set ensures we run the listener once per matched node.
    for (const [selector, listener] of observer.listeners) {
      const matched = new Set();

      for (const record of mutations) {
        for (const node of record.addedNodes) {
          if (node instanceof Element) {
            node.querySelectorAll(selector).forEach(m => matched.add(m));
          }
        }
      }
      matched.forEach(listener);
    }
  },

  on(selector, listener) {
    if (!this.observer) {
      this.observer = new MutationObserver(this.observe);
      this.observer.observe(document, {childList: true, subtree: true});
    }

    this.listeners.set(selector, listener);
    document.querySelectorAll(selector).forEach(listener);
  },
};

observer.on("li.js-notification>span>svg.octicon-git-pull-request", a => {
  a.closest("li").classList.add("br-blind");
});

observer.on("li.js-issue-row>div>div>span>svg.octicon-git-pull-request", a => {
  a.closest("li").classList.add("br-blind");
});

observer.on("div.js-comment-container:first-child a.author", a => {
  const author = a.textContent;
  for (const x of document.querySelectorAll(`a[href="/${author}"],img[alt="@${author}"]`)) {
    x.style.visibility = "hidden";
  }
});

observer.on("div.pull-request-tab-content img.avatar, div.pull-request-tab-content a.commit-author", x => {
  x.style.visibility = "hidden";
});
