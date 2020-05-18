'use strict';

const AWS = require('aws-sdk');
const request = require('request-promise-native');
const githubPublicOrganisationRepositories = require('github-public-organisation-repositories');

/**
 * Class representing Bower package data.
 */
module.exports = class PackageData {

	/**
	 * Create a package data object.
	 * @param {Object} options - The package data options.
	 * @param {String} options.packageDataStore - The base URL of the service where initial package data will be loaded from.
	 * @param {String} options.githubToken - The oauth token to use when communicating with the Github API.
	 * @param {Array} options.githubOrganisations - An array of GitHub organisations to get packages for.
	 * @param {Array} options.privateRepoWhitelist - An array of private repo names which should be injested.
	 * @param {String} options.awsAccessKey - The access key to use when communicating with S3.
	 * @param {String} options.awsSecretKey - The secret key to use when communicating with S3.
	 * @param {String[]} options.s3Buckets - An array of S3 bucket names to upload packages data to.
	 * @throws {TypeError} Will throw if any options are invalid.
	 */
	constructor(options = {}) {
		this.options = options;
		this.log = options.log;

		if (typeof options.packageDataStore !== 'string') {
			throw new TypeError('The packageDataStore option must be a string');
		}

		if (typeof options.githubToken !== 'string') {
			throw new TypeError('The githubToken option must be a string');
		}

		if (typeof options.awsAccessKey !== 'string') {
			throw new TypeError('The awsAccessKey option must be a string');
		}

		if (typeof options.awsSecretKey !== 'string') {
			throw new TypeError('The awsSecretKey option must be a string');
		}

		if (!Array.isArray(options.s3Buckets)) {
			throw new TypeError('The s3Buckets option must be an array');
		}

		if (!Array.isArray(options.githubOrganisations)) {
			throw new TypeError('The githubOrganisations option must be an array');
		}

		options.packageDataStore = options.packageDataStore.replace(/\/$/, '');
		this.packageDataStorePath = `${this.options.packageDataStore}/packages.json`;

		this.initialLoadComplete = false;
		this.data = null;
	}

	/**
	 * Load initial package data into the object, using the package data store and GitHub.
	 * @returns {Promise} Will always return a promise which resolves to `undefined`.
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
	 * @returns {Promise} Will always return a promise which resolves with either an array of packages or `undefined`.
	 */
	loadFromPackageDataStore() {
		return request({
			uri: this.packageDataStorePath,
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
	 * @returns {Promise} Will always return a promise which resolves with either an array of packages or `undefined`.
	 */
	loadFromGitHub() {
		return Promise.resolve()
			.then(() => {
				const getPublicOrganisationRepositories = githubPublicOrganisationRepositories(this.options.githubToken);
				return Promise.all(this.options.githubOrganisations.map(githubOrganisation => {
					return getPublicOrganisationRepositories(githubOrganisation, this.options.privateRepoWhitelist);
				}));
			})
			.then(packages => {
				this.data = [].concat(...packages).sort(sortAlphabeticallyByProperty('name'));
				return this.publishToS3();
			})
			.then(() => {
				return this.data;
			})
			.catch(error => {
				if (this.log && this.log.error) {
					this.log.error(`Packages could not be loaded from Github: ${error.message}`);
				}
			});
	}

	/**
	 * Save the local cache of package data to S3.
	 * @returns {Promise} Will always return a promise which resolves with `undefined`.
	 */
	publishToS3() {
		const s3 = new AWS.S3({
			accessKeyId: this.options.awsAccessKey,
			secretAccessKey: this.options.awsSecretKey
		});
		const uploadConfig = {
			ACL: 'public-read',
			Body: JSON.stringify(this.data),
			ContentType: 'application/json',
			Key: 'packages.json'
		};
		return Promise.all(this.options.s3Buckets.map(bucket => {
			if (this.log && this.log.info) {
				this.log.info(`Publishing package data to S3 bucket: ${bucket}…`);
			}
			return s3.upload(Object.assign({
				Bucket: bucket
			}, uploadConfig)).promise();
		}))
		.then(() => {
			this.log.info('Package data published to S3');
		})
		.catch(error => {
			if (this.log && this.log.error) {
				this.log.error(`Packages could not be published to S3: ${error.message}`);
			}
		});
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

// Create a function that sorts an array alphabetically by object properties
function sortAlphabeticallyByProperty(property) {
	return (a, b) => {
		a = a[property].toLowerCase();
		b = b[property].toLowerCase();
		if (a < b) {
			return -1;
		}
		if (a > b) {
			return 1;
		}
		return 0;
	};
}
