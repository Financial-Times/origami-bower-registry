'use strict';

const request = require('request-promise-native');

/**
 * Class representing Bower package data.
 */
module.exports = class PackageData {

	/**
	 * Create a package data object.
	 * @param {Object} options - The package data options.
	 * @param {String} options.packageDataStore - The base URL of the service where initial package data will be loaded from.
	 * @throws {TypeError} Will throw if any options are invalid.
	 */
	constructor(options = {}) {
		this.options = options;
		this.log = options.log;

		if (typeof options.packageDataStore !== 'string') {
			throw new TypeError('The packageDataStore option must be a string');
		}
		options.packageDataStore = options.packageDataStore.replace(/\/$/, '');

		this.initialLoadComplete = false;
		this.data = null;
	}

	/**
	 * Load initial package data into the object, using the package data store and GitHub.
	 */
	loadInitialData() {
		return Promise.all([
			this.loadFromPackageDataStore(),
			this.loadFromGitHub()
		])
		.then(() => {
			this.initialLoadComplete = true;
		});
	}

	/**
	 * Load package data from the package data store and cache it in memory.
	 * If data is already available then the result of this call will be ignored.
	 */
	loadFromPackageDataStore() {
		return request({
			uri: `${this.options.packageDataStore}/packages.json`,
			json: true
		})
		.then(packages => {
			if (!this.data) {
				this.data = packages;
			}
			return packages;
		})
		.catch(error => {
			if (this.log && this.log.error) {
				this.log.error(`Packages could not be loaded from the data store: ${error.message}`);
			}
		});
	}

	/**
	 * Load package data from GitHub and cache it in memory.
	 */
	loadFromGitHub() {
		// TODO
		return Promise.resolve();
	}

	/**
	 * Get a promise which resolves with the package data.
	 * @returns {Promise} A promise which will resolve with package data or an error if no data is available.
	 */
	promise() {
		// If we have data loaded, we resolve with
		// that data (regardless of origin)
		if (this.data) {
			return Promise.resolve(this.data);

		// If the initial load has been completed but
		// we still don't have data, this is classed
		// as a critical error
		} else if (this.initialLoadComplete) {
			const error = new Error('Initial packages could not be loaded from S3 or GitHub');
			error.code = 'E_PACKAGES_NOT_LOADED';
			return Promise.reject(error);

		// This means that the initial load is not
		// complete, and we're still waiting for the
		// package data
		} else {
			const error = new Error('Initial data has not been loaded yet');
			error.code = 'E_NO_INITIAL_DATA';
			return Promise.reject(error);
		}
	}

};
