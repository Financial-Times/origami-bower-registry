'use strict';

const express = require('express');
const packageList = require('./package-list.json');

module.exports = createMockPackageStore;

function createMockPackageStore() {
	const mockPackageStore = express();

	mockPackageStore.get('/packages.json', (request, response) => {
		response.send(packageList);
	});

	return new Promise((resolve, reject) => {
		const server = mockPackageStore.listen((error) => {
			if (error) {
				return reject(error);
			}
			const port = server.address().port;
			mockPackageStore.server = server;
			mockPackageStore.address = `http://localhost:${port}/`;
			resolve(mockPackageStore);
		});
	});
}
