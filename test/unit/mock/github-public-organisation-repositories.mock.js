'use strict';

const sinon = require('sinon');

const getPublicOrganisationRepositoriesFactory = module.exports = sinon.stub();

const mockGetPublicOrganisationRepositories = module.exports.mockGetPublicOrganisationRepositories = sinon.stub();

getPublicOrganisationRepositoriesFactory.returns(mockGetPublicOrganisationRepositories);
