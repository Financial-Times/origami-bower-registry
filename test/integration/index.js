'use strict';

const itRespondsWithContentType = require('./helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('./helpers/it-responds-with-status');
const setupRequest = require('./helpers/setup-request');

describe('GET /', function() {
	setupRequest('GET', '/');
	itRespondsWithStatus(200);
	itRespondsWithContentType('text/html');
});
