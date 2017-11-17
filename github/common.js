"use strict";

function parsePR(url) {
  const match = url.match(/^https\:\/\/github.com\/([\w-]+\/[\w-]+\/pull\/[\d]+)/);
  return match && match[1];
}

const observer = {
  listeners: new Map(),

  emit(node) {
    if (node instanceof Element) {
      for (const [selector, listener] of observer.listeners) {
        node.querySelectorAll(selector).forEach(listener);
      }
    }
  },

  observe(mutations) {
    for (const record of mutations) {
      record.addedNodes.forEach(observer.emit);
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

observer.on("div.pull-request-tab-content :-moz-any(img.avatar, a.commit-author)", x => {
  x.style.visibility = "hidden";
});
