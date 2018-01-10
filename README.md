Blind Reviews
=============
Blind Reviews Experiment, a browser extension to redact authors of review
requests on Bugzilla and Github


Background
----------
See [Web Extension for Debiasing Code Reviews in Splinter Experiment][1366429].

Using the latest release
------------------------
Visit the [Blind Reviews][amo] page on addons.mozilla.org to add the current
version to Firefox.

Using a development version
---------------------------
Download the code and load it as a temporary extension from `about:debugging`
(or `chrome:extensions` in Chrome).

Running Tests
-------------
Clone, install and run tests:

    git clone https://github.com/zombie/blind-reviews
    cd blind-reviews
    npm install
    npm test

[![status]][travis]

License
-------
MIT


Related projects
----------------

 * [Anonymous Github](http://anonymous.4open.science/) is a proxy server to support anonymous browsing of Github repositories for open-science code and data.  You can use it to anonymize Github repositories before referring to them in a double-blind paper submission. ([source repository](https://github.com/tdurieux/anonymous_github/))

 * [Gitmask](http://www.gitmask.com/) is a service that will strip out and replace embedded identification info from commits that you submit, including author names, email and timestamps. ([source repository](https://github.com/AnalogJ/gitmask))


[1366429]:
  https://bugzilla.mozilla.org/show_bug.cgi?id=1366429
[amo]:
  https://addons.mozilla.org/firefox/addon/blind-reviews/
[status]:
  https://travis-ci.org/zombie/blind-reviews.svg
[travis]:
  https://travis-ci.org/zombie/blind-reviews
