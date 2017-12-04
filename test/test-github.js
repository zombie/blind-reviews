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
    expect(prInfo).to.match(/^#1 opened \d+ days ago by$/);
  });
});
