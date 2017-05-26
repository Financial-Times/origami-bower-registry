'use strict';

const HealthCheck = require('@financial-times/health-check');

module.exports = healthChecks;

function healthChecks(options) {

	// Create and return the health check
	return new HealthCheck({
		checks: [

			// TODO add a health check for if no data can be retrieved

			// This check ensures that the package data
			// store is available. It will fail on a non-200
			// response
			{
				type: 'ping-url',
				url: () => {
					const packageDataStoreBaseUrl = (options.packageDataStore ? options.packageDataStore.replace(/\/$/, '') : '');
					return `${packageDataStoreBaseUrl}/packages.json`;
				},
				interval: 30000,
				id: 'package-data-store',
				name: 'Package data can be retrieved from the store',
				severity: 2,
				businessImpact: 'Users may not be able to list or install packages',
				technicalSummary: 'Hits the given url and checks that it responds successfully',
				panicGuide: `Check that ${options.packageDataStore}/__gtg is responding with a 200 status and that the AWS Region is up`
			},

			// This check ensures that GitHub is available
			// on port 80. It will fail on a bad response
			// or socket timeout
			{
				type: 'tcp-ip',
				host: 'github.com',
				port: 443,
				interval: 10 * 60 * 1000, // 10 minutes
				id: 'github-tcp-port-443',
				name: 'Availability of Github (TCP/IP connectivity to github.com on port 443)',
				severity: 2,
				businessImpact: 'Users may not be able to list or install packages',
				technicalSummary: 'Connects to the given host/port and checks that it responds successfully',
				panicGuide: 'Check whether `github.com` loads in a web browser and https://status.github.com/ for reported downtime.'
			},

			// This check monitors the process memory usage
			// It will fail if usage is above the threshold
			{
				type: 'memory',
				threshold: 75,
				interval: 15000,
				id: 'system-memory',
				name: 'System memory usage is below 75%',
				severity: 1,
				businessImpact: 'Application may not be able to serve all package requests',
				technicalSummary: 'Process has run out of available memory',
				panicGuide: 'Restart the service dynos on Heroku'
			},

			// This check monitors the system CPU usage
			// It will fail if usage is above the threshold
			{
				type: 'cpu',
				threshold: 125,
				interval: 15000,
				id: 'system-load',
				name: 'System CPU usage is below 125%',
				severity: 1,
				businessImpact: 'Application may not be able to serve all package requests',
				technicalSummary: 'Process is hitting the CPU harder than expected',
				panicGuide: 'Restart the service dynos on Heroku'
			}

		],
		log: options.log
	});
}
