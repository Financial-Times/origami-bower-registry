'use strict';

const purgeUrls = require('@financial-times/origami-service').middleware.purgeUrls;

module.exports = app => {

	// Paths to purge
	const paths = [
		'/',
		'/__about'
	];

	// Purge page
	app.post('/purge', purgeUrls({
		urls: paths.map(path => `https://origami-bower-registry.ft.com${path}`)
	}));

};
