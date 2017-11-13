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

observer.on("li.js-notification>span>a", a => {
  if (parsePR(a.href)) {
    a.closest("li").classList.add("br-blind");
  }
});

observer.on("li.js-issue-row>div>div>a", a => {
  if (parsePR(a.href)) {
    a.closest("li").classList.add("br-blind");
  }
});
