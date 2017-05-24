'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;

module.exports = app => {

	// Packages endpoint (list all packages)
	app.get(
		'/packages',
		cacheControl({
			maxAge: '10m',
			staleIfError: '7d'
		}),
		(request, response) => {
			response.send([]);
		}
	);

};
