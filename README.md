# WCT structured data testing

[![Build Status](https://travis-ci.org/thearegee/wct-structured-data-testing.svg?branch=master)](https://travis-ci.org/thearegee/wct-structured-data-testing)

A small extension to use with [web-component-tester](https://github.com/Polymer/web-component-tester) as a `wct.hook` that allows you to test your components markup with Google's [Structured Data Testing Tool](https://developers.google.com/structured-data/testing-tool/).

Currently doesn't work with versions of WCT newer than: 4.3.1.

## Install

`npm install wct-structured-data-testing --save-dev`

## Example usage with WTC

Add the following to `wct.conf.js`

```javascript
var structuredDataProxy = require('wct-structured-data-proxy');

module.exports = {
  /* example test config */
  "verbose": true,
  "plugins": {
    "local": {
      "browsers": ["chrome", "firefox"]
    }
  },
  /* set up test server hooks */
  registerHooks: function(wct) {
    wct.hook('prepare:webserver', structuredDataProxy.init);
  }
};
```

This has now created the following route in your test framework:
`/_structured_data_proxy_`

You can then do an XHR POST from the browser, to the local server (which acts as the proxy), within your test suite and validate the results.
You should send the html you want to validate in the POST body, using the key `html`.
Here is an example:

```html
  <my-element></my-element>

  <script>


    suite('<nap-seed-element> structured data', function() {

      var structuredDataResponse;

      suiteSetup((done) => {
          var elementHTML = fixture('my-element-fixture').outerHTML;
          getStructuredData(elementHTML, function(response){
            structuredDataResponse = response;
            done();
          });
      });

      /* Simple test for checking there are no structured data errors */
      test('No errors in the structured data', function() {
        assert.equal(structuredDataResponse.errors, 0);
      });

    });

    /**
    * Helper function to pass HTML to proxy API for google structured data tool
      <https://developers.google.com/structured-data/testing-tool/>
    */
    function getStructuredData(elementHTML, callback) {
      var request = new XMLHttpRequest();
      request.open('POST', '/_structured_data_proxy_');
      request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

      request.onload = function(e) {
        if (request.status == 200) {
          var json = JSON.parse(request.response);
          callback(json);
        } else {
          callback();
        }
      }
      request.send(JSON.stringify({ html: elementHTML }));
    }

```

### Why is this so awful?

Mainly because [Structured Data Testing Tool](https://developers.google.com/structured-data/testing-tool/) is not really a public API. I wanted to see if I could automate "SEO" testing, it was pretty straight forward when hijacking this service from the server but WCT tests are written in the browser.

The other problem was that SDT doesn't have cross origin headers - if it did, this would been a walk in the park.

## I don't want to use WCT but I want to validate my HTML!

No worries, if you just want to get the data:

```javascript
var structuredDataProxy = require('wct-structured-data-proxy');

var myHTML = '<h1>You knows it mate<h1>';

structuredDataProxy.getStructuredDataResults(myHTML, function(response){
  /**
  *  response.status = 'success'
  *  response.statusCode = 200
  *  response.data  = {
  *                    "cse":[..],
  *                    "errors":[..],
  *                    ...
  *                  }
  */
})
```

# Notes
* This only works via command line test script script: wct --plugin local it will NOT work via polyserve localhost:8080/components/my-element/test/
* Need to investigate why this isn't working on the newer versions of wct
* This will stop working when Google say, "what is going on here..." *block
