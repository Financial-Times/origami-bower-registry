'use strict';

const dotenv = require('dotenv');
const service = require('./lib/service');
const throng = require('throng');

dotenv.load({
	silent: true
});
const options = {
	defaultLayout: 'main',
	log: console,
	name: 'Origami Bower Registry',
	packageDataStore: process.env.PACKAGE_DATA_STORE || 'https://www.ft.com/__origami/service/bower-registry-data',
	workers: process.env.WEB_CONCURRENCY || 1
};

throng({
	workers: options.workers,
	start: startWorker
});

function startWorker(id) {
	console.log(`Started worker ${id}`);
	service(options).listen().catch(() => {
		process.exit(1);
	});
}
