'use strict';

const express = require('express');

module.exports = createMockPackageStore;

function createMockPackageStore() {
	const mockPackageStore = express();

	mockPackageStore.get('/packages.json', (request, response) => {
		response.send([
			{
				name: 'mock-package-1',
				url: 'https://github.com/Financial-Times/mock-package-1.git'
			},
			{
				name: 'mock-package-2',
				url: 'https://github.com/Financial-Times/mock-package-2.git'
			}
		]);
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
