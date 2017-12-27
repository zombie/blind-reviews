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

    const prInfo = $(".opened-by").getText();
    expect(prInfo).to.equal("#1 opened on Nov 23 by");
  });
});

describe("(single) Pull Request Page", () => {
  it("should redact the author", () => {
    browser.url("/zombie/testing-reviews/pull/3");

    const topFlash = $("div.flash > div").getText();
    expect(topFlash).to.equal("requested your review on this pull request.");

    const commentInfo = $("h3.timeline-comment-header-text").getText();
    expect(commentInfo).to.equal("commented on Nov 23");

    const avatar = $("a.participant-avatar").isVisible();
    expect(avatar).to.be.false;
  });
});
