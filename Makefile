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
