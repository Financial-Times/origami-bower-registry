# Origami Service Makefile
# ------------------------
# This section of the Makefile should not be modified, it includes
# commands from the Origami service Makefile.
# https://github.com/Financial-Times/origami-service-makefile
include node_modules/@financial-times/origami-service-makefile/index.mk
# [edit below this line]
# ------------------------


# Configuration
# -------------

INTEGRATION_TIMEOUT = 10000
INTEGRATION_SLOW = 2000

SERVICE_NAME = Origami Bower Registry
SERVICE_SYSTEM_CODE = origami-bower-registry
SERVICE_SALESFORCE_ID = $(SERVICE_NAME)

HEROKU_APP_QA = $(SERVICE_SYSTEM_CODE)-qa
HEROKU_APP_EU = $(SERVICE_SYSTEM_CODE)-eu
HEROKU_APP_US = $(SERVICE_SYSTEM_CODE)-us
GRAFANA_DASHBOARD = $(SERVICE_SYSTEM_CODE)

export GITHUB_RELEASE_REPO := Financial-Times/$(SERVICE_SYSTEM_CODE)


# Deploy tasks
# ------------

# Get a canonical "current commit" regardless of environment
ifeq ($(SOURCE_VERSION),)
export SOURCE_VERSION := $(CIRCLE_SHA1)
endif
ifeq ($(SOURCE_VERSION),)
export SOURCE_VERSION := $(TRAVIS_COMMIT)
endif

# Auto-version the source code and create a GitHub release
version:
	if [ "$${REGION}" = "QA" ] || [ -n "$${CI}" ]; then \
		if [ -z "$${SOURCE_VERSION}" ]; then echo "Error: SOURCE_VERSION is not set" && exit 0; fi; \
		if [ -z "$${GITHUB_RELEASE_TOKEN}" ]; then echo "Error: GITHUB_RELEASE_TOKEN is not set" && exit 1; fi; \
		if [ -z "$${GITHUB_RELEASE_USER}" ]; then echo "Error: GITHUB_RELEASE_USER is not set" && exit 1; fi; \
		if [ -z "$${GITHUB_RELEASE_REPO}" ]; then echo "Error: GITHUB_RELEASE_REPO is not set" && exit 1; fi; \
		npx @quarterto/git-version-infer --all-commits && npx @quarterto/package-version-github-release; \
	else \
		echo "Auto-versioning will only run when REGION=QA or CI=true"; \
	fi;
