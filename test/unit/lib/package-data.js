'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/package-data', () => {
	let log;
	let PackageData;
	let request;

	beforeEach(() => {
		log = require('../mock/log.mock');

		request = require('../mock/request-promise-native.mock');
		mockery.registerMock('request-promise-native', request);

		PackageData = require('../../../lib/package-data');
	});

	it('exports a function', () => {
		assert.isFunction(PackageData);
	});

	describe('new PackageData(options)', () => {
		let instance;
		let options;

		beforeEach(() => {
			options = {
				log: log,
				packageDataStore: 'mock-package-store'
			};
			instance = new PackageData(options);
		});

		it('has an `options` property set to the passed in options', () => {
			assert.strictEqual(instance.options, options);
		});

		it('has an `log` property set to the passed in log option', () => {
			assert.strictEqual(instance.log, log);
		});

		it('has an `initialLoadComplete` property set to `false`', () => {
			assert.isFalse(instance.initialLoadComplete);
		});

		it('has a `data` property set to `null`', () => {
			assert.isNull(instance.data);
		});

		it('has a `loadInitialData` method', () => {
			assert.isFunction(instance.loadInitialData);
		});

		describe('.loadInitialData()', () => {
			let returnedPromise;

			beforeEach(() => {
				sinon.stub(instance, 'loadFromPackageDataStore').resolves();
				sinon.stub(instance, 'loadFromGitHub').resolves();
				returnedPromise = instance.loadInitialData();
			});

			it('returns a promise', () => {
				assert.instanceOf(returnedPromise, Promise);
			});

			it('calls the `loadFromPackageDataStore` method', () => {
				assert.calledOnce(instance.loadFromPackageDataStore);
			});

			it('calls the `loadFromGitHub` method', () => {
				assert.calledOnce(instance.loadFromGitHub);
			});

			describe('.then()', () => {
				let resolvedValue;

				beforeEach(() => {
					return returnedPromise.then(value => {
						resolvedValue = value;
					});
				});

				it('resolves with nothing', () => {
					assert.isUndefined(resolvedValue);
				});

				it('sets the `initialLoadComplete` property to `true`', () => {
					assert.isTrue(instance.initialLoadComplete);
				});

			});

		});

		it('has a `loadFromPackageDataStore` method', () => {
			assert.isFunction(instance.loadFromPackageDataStore);
		});

		describe('.loadFromPackageDataStore()', () => {
			let returnedPromise;
			let mockPackages;

			beforeEach(() => {
				mockPackages = [
					{
						name: 'mock-package'
					}
				];
				request.resolves(mockPackages);
				returnedPromise = instance.loadFromPackageDataStore();
			});

			it('returns a promise', () => {
				assert.instanceOf(returnedPromise, Promise);
			});

			it('makes an HTTP request to the package data store', () => {
				assert.calledOnce(request);
				assert.calledWith(request, {
					uri: `mock-package-store/packages.json`,
					json: true
				});
			});

			describe('.then()', () => {
				let resolvedValue;

				beforeEach(() => {
					return returnedPromise.then(value => {
						resolvedValue = value;
					});
				});

				it('resolves with the packages', () => {
					assert.strictEqual(resolvedValue, mockPackages);
				});

				it('sets the `data` property to the resolved packages', () => {
					assert.strictEqual(instance.data, mockPackages);
				});

			});

			describe('when the `data` property is already set', () => {

				beforeEach(() => {
					instance.data = 'already-set';
					returnedPromise = instance.loadFromPackageDataStore();
				});

				describe('.then()', () => {

					beforeEach(() => {
						return returnedPromise.then(() => {});
					});

					it('does not set the `data` property to the resolved packages', () => {
						assert.strictEqual(instance.data, 'already-set');
					});

				});

			});

			describe('when the `request` errors', () => {

				beforeEach(() => {
					instance.data = null;
					request.reset();
					request.rejects(new Error('mock request error'));
					returnedPromise = instance.loadFromPackageDataStore();
				});

				describe('.then()', () => {
					let resolvedValue;

					beforeEach(() => {
						return returnedPromise.then(value => {
							resolvedValue = value;
						});
					});

					it('resolves with nothing', () => {
						assert.isUndefined(resolvedValue);
					});

					it('does not set the `data` property', () => {
						assert.isNull(instance.data);
					});

					it('logs the error', () => {
						assert.called(log.error);
						assert.calledWith(log.error, 'Packages could not be loaded from the data store: mock request error');
					});

				});

			});

			describe('when the `request` errors and no logger is specified', () => {

				beforeEach(() => {
					delete instance.log;
					request.reset();
					request.rejects(new Error('mock request error'));
					returnedPromise = instance.loadFromPackageDataStore();
				});

				describe('.then()', () => {

					beforeEach(() => {
						return returnedPromise.then(() => {});
					});

					it('does not log the error', () => {
						assert.neverCalledWith(log.error, 'Packages could not be loaded from the data store: mock request error');
					});

				});

			});

		});

		it('has a `loadFromGitHub` method', () => {
			assert.isFunction(instance.loadFromGitHub);
		});

		describe('.loadFromGitHub()', () => {
			let returnedPromise;

			beforeEach(() => {
				returnedPromise = instance.loadFromGitHub();
			});

			it('returns a promise', () => {
				assert.instanceOf(returnedPromise, Promise);
			});

			it('does stuff');

		});

		it('has a `promise` method', () => {
			assert.isFunction(instance.promise);
		});

		describe('.promise()', () => {
			let returnedPromise;

			beforeEach(() => {
				instance.data = [
					{
						name: 'mock-package'
					}
				];
				returnedPromise = instance.promise();
			});

			it('returns a promise', () => {
				assert.instanceOf(returnedPromise, Promise);
			});

			describe('.then()', () => {
				let resolvedValue;

				beforeEach(() => {
					return returnedPromise.then(value => {
						resolvedValue = value;
					});
				});

				it('resolves with the instance `data`', () => {
					assert.strictEqual(resolvedValue, instance.data);
				});

			});

			describe('when instance data is not available', () => {

				beforeEach(() => {
					instance.data = null;
					instance.initialLoadComplete = false;
				});

				describe('.catch()', () => {
					let rejectedError;

					beforeEach(() => {
						return instance.promise().catch(error => {
							rejectedError = error;
						});
					});

					it('rejects with a descriptive error', () => {
						assert.instanceOf(rejectedError, Error);
						assert.strictEqual(rejectedError.message, 'Initial data has not been loaded yet');
						assert.strictEqual(rejectedError.code, 'E_NO_INITIAL_DATA');
					});

				});

			});

			describe('when instance data is not available and initial load is complete', () => {

				beforeEach(() => {
					instance.data = null;
					instance.initialLoadComplete = true;
				});

				describe('.catch()', () => {
					let rejectedError;

					beforeEach(() => {
						return instance.promise().catch(error => {
							rejectedError = error;
						});
					});

					it('rejects with a descriptive error', () => {
						assert.instanceOf(rejectedError, Error);
						assert.strictEqual(rejectedError.message, 'Initial packages could not be loaded from S3 or GitHub');
						assert.strictEqual(rejectedError.code, 'E_PACKAGES_NOT_LOADED');
					});

				});

			});

		});

		describe('when `options.packageDataStore` is not a string', () => {

			it('throws an error', () => {
				assert.throws(() => new PackageData(), 'The packageDataStore option must be a string');
			});

		});

	});

});
