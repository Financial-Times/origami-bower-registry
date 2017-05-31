/**
 * Module to create a health check object that checks for the presence of initial data.
 */
'use strict';

const Check = require('@financial-times/health-check').Check;
const isPlainObject = require('lodash/isPlainObject');
const PackageData = require('../package-data');

/**
 * Class representing a single health check that checks initial data.
 */
module.exports = class InitialDataCheck extends Check {

	/**
	 * Create an initial data health check. Accepts the same options as Check, but with a few additions.
	 * @param {Object} options - The health check options.
	 * @param {String} options.packageData - The package data instance to use in the check.
	 * @throws {TypeError} Will throw if any options are invalid.
	 */
	constructor(options) {
		InitialDataCheck.assertOptionValidity(options);
		super(options);
	}

	/**
	 * Actually perform the health check. This updates the relevant properties.
	 * @returns {Promise} A promise which resolves with undefined.
	 */
	run() {
		return this.options.packageData.promise()
			.then(() => {
				this.severity = 1;
				this.ok = true;
				this.checkOutput = '';
				this.lastUpdated = new Date();
			})
			.catch(error => {
				this.ok = false;
				this.checkOutput = error.message;
				this.lastUpdated = new Date();
				this.severity = 3;
				if (error.code === 'E_PACKAGES_NOT_LOADED') {
					this.severity = 1;
				}
				this.log.error(`Health check "${this.options.name}" failed: ${error.message}`);
			});
	}

	/**
	 * Validate health check options against the standard.
	 * @param {Object} options - The options to check.
	 * @returns {(Boolean|TypeError)} Will return `true` if the options are valid, or a descriptive error if not.
	 */
	static validateOptions(options) {
		if (!isPlainObject(options)) {
			return new TypeError('Options must be an object');
		}
		if (!(options.packageData instanceof PackageData)) {
			return new TypeError('Invalid option: packageData must be an instance of PackageData');
		}
		return true;
	}

	/**
	 * Assert that health check options are valid.
	 * @param {Object} options - The options to assert validity of.
	 * @throws {TypeError} Will throw if the options are invalid.
	 */
	static assertOptionValidity(options) {
		const validationResult = InitialDataCheck.validateOptions(options);
		if (validationResult instanceof Error) {
			throw validationResult;
		}
	}

};
