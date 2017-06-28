include n.Makefile


# Environment variables
# ---------------------

SERVICE_NAME = Origami Bower Registry
SERVICE_SYSTEM_CODE=origami-bower-registry
HEROKU_APP_QA = $(SERVICE_SYSTEM_CODE)-qa
HEROKU_APP_EU = $(SERVICE_SYSTEM_CODE)-eu
HEROKU_APP_US = $(SERVICE_SYSTEM_CODE)-us
GRAFANA_DASHBOARD = $(SERVICE_SYSTEM_CODE)
SALESFORCE_SERVICE_ID = $(SERVICE_NAME)

EXPECTED_COVERAGE = 90


# Verify tasks
# ------------

verify-coverage:
	@nyc check-coverage --lines $(EXPECTED_COVERAGE) --functions $(EXPECTED_COVERAGE) --branches $(EXPECTED_COVERAGE)
	@$(DONE)


# Test tasks
# ----------

test: test-unit-coverage verify-coverage test-integration
	@$(DONE)

test-unit:
	@NODE_ENV=test mocha test/unit --recursive
	@$(DONE)

test-unit-coverage:
	@NODE_ENV=test nyc --reporter=text --reporter=html _mocha test/unit --recursive
	@$(DONE)

test-integration:
	@NODE_ENV=test mocha test/integration --recursive --timeout 10000 --slow 2000
	@$(DONE)


# Deploy tasks
# ------------

deploy:
	@git push https://git.heroku.com/$(HEROKU_APP_QA).git
	@$(DONE)

release: change-request
ifneq ($(REGION), QA)
	@make update-cmdb
endif
	@$(DONE)

promote:
	@heroku pipelines:promote --app $(HEROKU_APP_QA)
	@$(DONE)

update-cmdb:
ifndef CMDB_API_KEY
	$(error CMDB_API_KEY is not set, cannot send updates to CMDB. You can find the key in LastPass)
endif
	@curl --silent --show-error -H 'Content-Type: application/json' -H 'X-Api-Key: ${CMDB_API_KEY}' -X PUT https://cmdb.in.ft.com/v3/items/endpoint/$(HEROKU_APP_EU).herokuapp.com -d @operational-documentation/health-and-about-endpoints-eu.json -f > /dev/null
	@curl --silent --show-error -H 'Content-Type: application/json' -H 'X-Api-Key: ${CMDB_API_KEY}' -X PUT https://cmdb.in.ft.com/v3/items/endpoint/$(HEROKU_APP_US).herokuapp.com -d @operational-documentation/health-and-about-endpoints-us.json -f > /dev/null
	@curl --silent --show-error -H 'Content-Type: application/json' -H 'X-Api-Key: ${CMDB_API_KEY}' -X PUT https://cmdb.in.ft.com/v3/items/system/$(SERVICE_SYSTEM_CODE) -d @operational-documentation/runbook.json -f > /dev/null
	@$(DONE)


# Monitoring tasks
# ----------------

grafana-pull:
ifndef GRAFANA_API_KEY
	$(error GRAFANA_API_KEY is not set)
endif
	@grafana pull $(GRAFANA_DASHBOARD) ./operational-documentation/grafana-dashboard.json

grafana-push:
ifndef GRAFANA_API_KEY
	$(error GRAFANA_API_KEY is not set)
endif
	@grafana push $(GRAFANA_DASHBOARD) ./operational-documentation/grafana-dashboard.json --overwrite


# Change Request tasks
# --------------------

CR_EMAIL = rowan.manning@ft.com
CR_DESCRIPTION = Release triggered by CI
CR_NOTIFY_CHANNEL = origami-deploys
ifeq ($(REGION), QA)
	CR_ENVIRONMENT = Test
	CR_SUMMARY = Releasing $(SERVICE_NAME) to QA
else
	CR_ENVIRONMENT = Production
	CR_SUMMARY = Releasing $(SERVICE_NAME) to Production ($(REGION))
endif

change-request:
	@npm install @financial-times/release-log # required to run in Heroku release phase
	@release-log \
		--environment "$(CR_ENVIRONMENT)" \
		--api-key "$(CR_API_KEY)" \
		--summary "$(CR_SUMMARY)" \
		--description "$(CR_DESCRIPTION)" \
		--owner-email "$(CR_EMAIL)" \
		--service "$(SALESFORCE_SERVICE_ID)" \
		--notify-channel "$(CR_NOTIFY_CHANNEL)" \
		|| true
	@$(DONE)


# Run tasks
# ---------

run:
	@npm start

run-dev:
	@nodemon --ext html,js,json index.js
