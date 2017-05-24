'use strict';

const HealthCheck = require('@financial-times/health-check');

module.exports = healthChecks;

function healthChecks(options) {

	// Create and return the health check
	return new HealthCheck({
		checks: [

			// TODO add some health checks here

		],
		log: options.log
	});
}
