'use strict';
var request = require('request');
var bodyParser = require('body-parser');

/* set up the route */
function init(app, done) {
  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true }));
  app.post('/_structured_data_proxy_', _proxyHandler);
  done();
}

/** For some reason structured data tool comes
 *  back with )]}' at the start of the response
 *  makes invalid json so strip it out
 */
function _getValidJson(str) {
  if (str.split(')]}\'').length > 1) {
    return str.split(')]}\'')[1];
  } else {
    return str;
  }
}

/** Request data from structured data tool from proxy request */
function _proxyHandler(req, res) {
  getStructuredDataResults(req.body.html, function(response) {
    res.status(response.statusCode);
    res.json(response.data);
  });
}

/** Request data from structured data tool */
function getStructuredDataResults(html, callback) {
  var url = 'https://search.google.com/structured-data/testing-tool/validate';
  request.post({
      url: url,
      form: {
        html: html
      }
    },
    function(error, response) {
      if (!error) {
        callback({
          status: 'success',
          statusCode: 200,
          data: JSON.parse(_getValidJson(response.body))
        });
      } else {
        callback({
          status: 'failure',
          statusCode: 500,
          data: 'Something blew up'
        });
      }
    });
}

module.exports = {
  init: init,
  getStructuredDataResults: getStructuredDataResults
};
