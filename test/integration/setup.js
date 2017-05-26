'use strict';

const createMockPackageStore = require('./mock/package-store');
const service = require('../..');
const supertest = require('supertest');

const noop = () => {};
const mockLog = {
	info: noop,
	error: noop,
	warn: noop
};

before(function() {
	return Promise.resolve()
		.then(() => {
			return createMockPackageStore();
		})
		.then(mockPackageStore => {
			this.mockPackageStore = mockPackageStore;
		})
		.then(() => {
			return service({
				environment: 'test',
				log: mockLog,
				githubToken: '',
				githubSecret: 'secret',
				port: null,
				packageDataStore: this.mockPackageStore.address,
				requestLogFormat: null
			}).listen();
		})
		.then(app => {
			this.agent = supertest.agent(app);
			this.app = app;
		});
});

after(function() {
	this.app.origami.server.close();
});
