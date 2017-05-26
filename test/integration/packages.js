'use strict';

const assert = require('proclaim');
const itRespondsWithContentType = require('./helpers/it-responds-with-content-type');
const itRespondsWithStatus = require('./helpers/it-responds-with-status');
const packageList = require('./mock/package-list.json');
const setupRequest = require('./helpers/setup-request');

describe('GET /packages', function() {

	setupRequest('GET', '/packages');
	itRespondsWithStatus(200);
	itRespondsWithContentType('application/json');

	it('responds with packages list', function(done) {
		this.request.expect(response => {
			assert.isString(response.text);
			const json = JSON.parse(response.text);
			assert.deepEqual(json, packageList);
		}).end(done);
	});

});

describe('GET /packages/search', function() {

	setupRequest('GET', '/packages/search');
	itRespondsWithStatus(200);
	itRespondsWithContentType('application/json');

	it('responds with a full packages list', function(done) {
		this.request.expect(response => {
			assert.isString(response.text);
			const json = JSON.parse(response.text);
			assert.deepEqual(json, packageList);
		}).end(done);
	});

});

describe('GET /packages/search/:query', function() {

	setupRequest('GET', '/packages/search/example');
	itRespondsWithStatus(200);
	itRespondsWithContentType('application/json');

	it('responds with a full packages list', function(done) {
		this.request.expect(response => {
			assert.isString(response.text);
			const json = JSON.parse(response.text);
			assert.deepEqual(json, [
				{
					"name": "example-package",
					"url": "https://github.com/Financial-Times/example-package.git"
				},
				{
					"name": "package-example",
					"url": "https://github.com/Financial-Times/package-example.git"
				}
			]);
		}).end(done);
	});

});

describe('GET /packages/:name', function() {

	setupRequest('GET', '/packages/mock-package-1');
	itRespondsWithStatus(200);
	itRespondsWithContentType('application/json');

	it('responds with the requested package', function(done) {
		this.request.expect(response => {
			assert.isString(response.text);
			const json = JSON.parse(response.text);
			assert.deepEqual(json, {
				name: 'mock-package-1',
				url: 'https://github.com/Financial-Times/mock-package-1.git'
			});
		}).end(done);
	});

	describe('when the package does not exist', function() {

		setupRequest('GET', '/packages/not-a-package');
		itRespondsWithStatus(404);
		itRespondsWithContentType('text/html');

	});

});

describe('GET /stats', function() {

	setupRequest('GET', '/stats');
	itRespondsWithStatus(200);
	itRespondsWithContentType('application/json');

	it('responds with some package statistics', function(done) {
		this.request.expect(response => {
			assert.isString(response.text);
			const json = JSON.parse(response.text);
			assert.deepEqual(json, {
				packages: packageList.length
			});
		}).end(done);
	});

});

describe('GET /refresh-packages', function() {

	setupRequest('GET', '/refresh-packages');
	itRespondsWithStatus(200);

	it('responds with "OK"', function(done) {
		this.request.expect(response => {
			assert.isString(response.text);
			assert.equal(response.text, 'OK');
		}).end(done);
	});

});
