'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

describe('lib/check/initial-data', () => {
	let Check;
	let log;
	let PackageData;
	let InitialDataCheck;

	beforeEach(() => {
		Check = require('@financial-times/health-check').Check;

		log = require('../../mock/log.mock');

		PackageData = require('../../mock/package-data.mock');
		PackageData.mockPackageData = sinon.createStubInstance(PackageData);
		PackageData.mockPackageData.promise = sinon.stub().resolves();
		mockery.registerMock('../package-data', PackageData);

		InitialDataCheck = require('../../../../lib/check/initial-data');
	});

	it('exports a class constructor', () => {
		assert.isFunction(InitialDataCheck);
		/* eslint-disable new-cap */
		assert.throws(() => InitialDataCheck(), /class constructor .* without 'new'/i);
		/* eslint-enable new-cap */
	});

	describe('new InitialDataCheck(options)', () => {
		let instance;
		let options;
		let startMock;

		beforeEach(() => {
			options = {
				businessImpact: 'mock business impact',
				id: 'mock-id',
				log: log,
				method: 'MOCK',
				name: 'mock name',
				panicGuide: 'mock panic guide',
				technicalSummary: 'mock technical summary',
				packageData: PackageData.mockPackageData
			};
			sinon.stub(InitialDataCheck, 'assertOptionValidity');
			startMock = sinon.stub(InitialDataCheck.prototype, 'start');
			instance = new InitialDataCheck(options);
			startMock.restore();
		});

		it('extends Check', () => {
			assert.instanceOf(instance, Check);
		});

		it('asserts that the defaulted options are valid', () => {
			assert.calledOnce(InitialDataCheck.assertOptionValidity);
			assert.calledWithExactly(InitialDataCheck.assertOptionValidity, options);
		});

		describe('.run()', () => {
			let mockDate;
			let returnedPromise;

			beforeEach(() => {
				mockDate = {
					mock: true
				};
				sinon.stub(global, 'Date').returns(mockDate);
				instance.severity = null;
				instance.ok = false;
				instance.checkOutput = 'mock output';
				returnedPromise = instance.run();
			});

			afterEach(() => {
				Date.restore();
			});

			it('calls `packageData.promise` with the expected options', () => {
				assert.calledOnce(PackageData.mockPackageData.promise);
				assert.calledWithExactly(PackageData.mockPackageData.promise);
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

				it('resolves with nothing', () => {
					assert.isUndefined(resolvedValue);
				});

				it('sets the `severity` property to 1', () => {
					assert.strictEqual(instance.severity, 1);
				});

				it('sets the `ok` property to `true`', () => {
					assert.isTrue(instance.ok);
				});

				it('sets the `checkOutput` property to an empty string', () => {
					assert.strictEqual(instance.checkOutput, '');
				});

				it('updates the `lastUpdated` property', () => {
					assert.strictEqual(instance.lastUpdated, mockDate);
				});

			});

			describe('when the promise rejects', () => {
				let dataError;

				beforeEach(() => {
					instance.ok = true;
					instance.checkOutput = '';
					instance.severity = null;
					dataError = new Error('data error');
					PackageData.mockPackageData.promise.reset();
					PackageData.mockPackageData.promise.rejects(dataError);
					returnedPromise = instance.run();
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

					it('sets the `severity` property to 3', () => {
						assert.strictEqual(instance.severity, 3);
					});

					it('sets the `ok` property to `false`', () => {
						assert.isFalse(instance.ok);
					});

					it('sets the `checkOutput` property to the error message', () => {
						assert.strictEqual(instance.checkOutput, 'data error');
					});

					it('updates the `lastUpdated` property', () => {
						assert.strictEqual(instance.lastUpdated, mockDate);
					});

					it('logs that the request failed', () => {
						assert.calledWithExactly(log.error, 'Health check "mock name" failed: data error');
					});

				});

			});

			describe('when the promise rejects with an error code of "E_PACKAGES_NOT_LOADED"', () => {
				let dataError;

				beforeEach(() => {
					instance.ok = true;
					instance.checkOutput = '';
					instance.severity = null;
					dataError = new Error('data error');
					dataError.code = 'E_PACKAGES_NOT_LOADED';
					PackageData.mockPackageData.promise.reset();
					PackageData.mockPackageData.promise.rejects(dataError);
					returnedPromise = instance.run();
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

					it('sets the `severity` property to 1', () => {
						assert.strictEqual(instance.severity, 1);
					});

					it('sets the `ok` property to `false`', () => {
						assert.isFalse(instance.ok);
					});

					it('sets the `checkOutput` property to the error message', () => {
						assert.strictEqual(instance.checkOutput, 'data error');
					});

					it('updates the `lastUpdated` property', () => {
						assert.strictEqual(instance.lastUpdated, mockDate);
					});

					it('logs that the request failed', () => {
						assert.calledWithExactly(log.error, 'Health check "mock name" failed: data error');
					});

				});

			});

		});

		describe('.inspect()', () => {

			it('returns a string with the check name and status', () => {
				assert.match(instance.inspect(), /^InitialDataCheck /);
			});

		});

	});

	it('has a `validateOptions` static method', () => {
		assert.isFunction(InitialDataCheck.validateOptions);
	});

	describe('.validateOptions(options)', () => {
		let options;
		let returnValue;

		beforeEach(() => {
			options = {
				packageData: PackageData.mockPackageData
			};
			returnValue = InitialDataCheck.validateOptions(options);
		});

		it('returns `true`', () => {
			assert.isTrue(returnValue);
		});

		describe('when `options` is not an object', () => {

			it('returns a descriptive error', () => {
				const expectedErrorMessage = 'Options must be an object';
				returnValue = InitialDataCheck.validateOptions('');
				assert.instanceOf(returnValue, TypeError);
				assert.strictEqual(returnValue.message, expectedErrorMessage);
				returnValue = InitialDataCheck.validateOptions([]);
				assert.instanceOf(returnValue, TypeError);
				assert.strictEqual(returnValue.message, expectedErrorMessage);
				returnValue = InitialDataCheck.validateOptions(null);
				assert.instanceOf(returnValue, TypeError);
				assert.strictEqual(returnValue.message, expectedErrorMessage);
			});

		});

		describe('when `options` has an invalid `packageData` property', () => {

			it('returns a descriptive error', () => {
				const expectedErrorMessage = 'Invalid option: packageData must be an instance of PackageData';
				options.packageData = '';
				returnValue = InitialDataCheck.validateOptions(options);
				assert.instanceOf(returnValue, TypeError);
				assert.strictEqual(returnValue.message, expectedErrorMessage, 'empty string');
				options.packageData = 123;
				returnValue = InitialDataCheck.validateOptions(options);
				assert.instanceOf(returnValue, TypeError);
				assert.strictEqual(returnValue.message, expectedErrorMessage, 'non-string');
			});

		});

	});

	it('has an `assertOptionValidity` static method', () => {
		assert.isFunction(InitialDataCheck.assertOptionValidity);
	});

	describe('.assertOptionValidity(options)', () => {
		let options;

		beforeEach(() => {
			options = {
				mock: true
			};
			sinon.stub(InitialDataCheck, 'validateOptions').returns(true);
		});

		it('validates the options', () => {
			InitialDataCheck.assertOptionValidity(options);
			assert.calledOnce(InitialDataCheck.validateOptions);
			assert.calledWithExactly(InitialDataCheck.validateOptions, options);
		});

		it('does not throw', () => {
			assert.doesNotThrow(() => InitialDataCheck.assertOptionValidity(options));
		});

		describe('when the options are invalid', () => {
			let mockError;

			beforeEach(() => {
				mockError = new Error('mock error');
				InitialDataCheck.validateOptions.returns(mockError);
			});

			it('throws a validation error', () => {
				let caughtError;
				try {
					InitialDataCheck.assertOptionValidity(options);
				} catch (error) {
					caughtError = error;
				}
				assert.strictEqual(caughtError, mockError);
			});

		});

	});

});
