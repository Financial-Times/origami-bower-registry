'use strict';

const assert = require('proclaim');
const itRespondsWithContentType = require('./helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('./helpers/it-responds-with-status');
const setupRequest = require('./helpers/setup-request');

describe('GET /packages', function() {

	setupRequest('GET', '/packages');
	itRespondsWithStatus(200);
	itRespondsWithContentType('application/json');

	it('responds with packages list', function(done) {
		this.request.expect(response => {
			assert.isString(response.text);
			const json = JSON.parse(response.text);
			assert.deepEqual(json, [
				// TODO this should be real
			]);
		}).end(done);
	});

});
