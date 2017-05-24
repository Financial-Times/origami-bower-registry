include n.Makefile


# Environment variables
# ---------------------

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

# TODO copy from navigation service


# Monitoring tasks
# ----------------

# TODO copy from navigation service


# Change Request tasks
# --------------------

# TODO copy from navigation service


# Run tasks
# ---------

run:
	@npm start

run-dev:
	@nodemon --ext html,js,json index.js
