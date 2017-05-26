'use strict';

const cacheControl = require('@financial-times/origami-service').middleware.cacheControl;
const httpError = require('http-errors');
const verifyGithubWebhook = require('verify-github-webhook');

module.exports = app => {

	const packageCacheControl = cacheControl({
		maxAge: '10m',
		staleIfError: '7d'
	});

	// List all packages
	function allPackagesRoute(request, response, next) {
		app.origami.packageData.promise()
			.then(packages => {
				response.send(packages);
			})
			.catch(error => {
				error.status = 503;
				next(error);
			});
	};
	app.get('/packages', packageCacheControl, allPackagesRoute);
	app.get('/packages/search', packageCacheControl, allPackagesRoute);

	// Search packages
	app.get('/packages/search/:query', packageCacheControl, (request, response, next) => {
		app.origami.packageData.promise()
			.then(packages => {
				response.send(packages.filter(pkg => {
					return (pkg.name.toLowerCase().indexOf(request.params.query) !== -1);
				}));
			})
			.catch(error => {
				error.status = 503;
				next(error);
			});
	});

	// Lookup package
	app.get('/packages/:name', packageCacheControl, (request, response, next) => {
		app.origami.packageData.promise()
			.then(packages => {
				const namedPackage = packages.find((pkg) => {
					return (pkg.name === request.params.name);
				});
				if (!namedPackage) {
					return next(httpError(404));
				}
				response.send(namedPackage);
			})
			.catch(error => {
				error.status = 503;
				next(error);
			});
	});

	// Package stats
	app.get('/stats', packageCacheControl, (request, response, next) => {
		app.origami.packageData.promise()
			.then(packages => {
				response.send({
					packages: packages.length
				});
			})
			.catch(error => {
				error.status = 503;
				next(error);
			});
	});

	app.get('/refresh-packages', (request, response) => {
		if (verifyGithubWebhook(request.get('X-Hub-Signature'), JSON.stringify(request.body), app.origami.githubSecret)) {
			app.origami.packageData.loadFromGithub();
		}
		response.send('OK');
	});

};
