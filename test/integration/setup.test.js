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
				awsAccessKey: 'aws-access',
				awsSecretKey: 'aws-secret',
				environment: 'test',
				log: mockLog,
				githubToken: '',
				githubSecret: 'secret',
				githubOrganisations: [
					'financial-times'
				],
				port: 0,
				packageDataStore: this.mockPackageStore.address,
				privateRepoWhitelist: [],
				requestLogFormat: null,
				s3Buckets: []
			}).listen();
		})
		.then(app => {
			this.agent = supertest.agent(app);
			this.app = app;
		});
});

after(function() {
	this.app.ft.server.close();
});
