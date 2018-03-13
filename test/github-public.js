"use strict";

const {expect} = require("chai");
const {resolve} = require("path");
const {launch} = require('puppeteer');

const HOST = "https://github.com/";
const UNPACKED = resolve(__dirname, "..");

module.exports = {

  async before() {
    this.browser = await launch({
      headless: false,
      args: [
        '--no-sandbox',
        `--load-extension=${UNPACKED}`,
        `--disable-extensions-except=${UNPACKED}`,
      ],
    });
    this.page = await this.browser.newPage();
  },

  "Pull Request page": {
    async before() {
      await this.page.goto(`${HOST}/zombie/blind-reviews/pull/29`);
    },

    async "Main toggle added and visible"() {
      const toggle = await this.page.$("#br-toggle");
      const box = await toggle.boundingBox();
      expect(box.width).to.be.above(30);
    },
  },

  async after() {
    await this.browser.close();    
  }
};
