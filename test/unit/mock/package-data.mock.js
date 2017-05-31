'use strict';

const sinon = require('sinon');

const PackageData = module.exports = sinon.stub();

const mockPackageData = module.exports.mockPackageData = {
	loadInitialData: sinon.stub(),
	promise: sinon.stub()
};

PackageData.returns(mockPackageData);
