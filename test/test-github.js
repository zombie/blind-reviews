"use strict";

const {expect} = require("chai");

before(() => {
  browser.url("/login");

  browser.setCookie({
    name: "user_session",
    value: process.env.USER_SESSION,
  });
});

describe("Pull Requests (listings)", () => {
  it("should redact the author", () => {
    browser.url("/pulls/mentioned");

    const prInfo = browser.getText(".opened-by");
    expect(prInfo[0]).to.not.contain("zombie");

    // But don't redact user's own PRs in listings.
    expect(prInfo[1]).to.contain("blindreviews3");
  });
});

describe("(single) Pull Request Page", () => {
  it("should redact the author", () => {
    browser.url("/zombie/testing-reviews/pull/3");

    const topFlash = $("div.flash > div").getText();
    expect(topFlash).to.equal("requested your review on this pull request.");

    const commentInfo = $("h3.timeline-comment-header-text").getText();
    expect(commentInfo).to.not.contain("zombie");

    const avatar = $("a.participant-avatar").isVisible();
    expect(avatar).to.be.false;
  });
});
