'use strict';

const healthChecks = require('./health-checks');
const origamiService = require('@financial-times/origami-service');
const PackageData = require('./package-data');
const requireAll = require('require-all');

module.exports = service;

function service(options) {

	const packageData = new PackageData(options);
	packageData.loadInitialData();

	const health = healthChecks(options, packageData);
	options.healthCheck = health.checks();
	options.goodToGoTest = health.gtg();
	options.about = require('../about.json');

	const app = origamiService(options);

	app.origami.packageData = packageData;

	app.use(origamiService.middleware.getBasePath());
	mountRoutes(app);
	app.use(origamiService.middleware.notFound());
	app.use(origamiService.middleware.errorHandler());

	return app;
}

function mountRoutes(app) {
	requireAll({
		dirname: `${__dirname}/routes`,
		resolve: initRoute => initRoute(app)
	});
}
