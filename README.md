
Origami Bower Registry
======================

**:warning: This is a work in progress :warning:**

Install Financial Times GitHub repositories as Bower components. See [the production service][production-url] for API information.

[![Build status](https://img.shields.io/circleci/project/Financial-Times/origami-bower-registry.svg)][ci]
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)][license]


Table Of Contents
-----------------

  * [Requirements](#requirements)
  * [Running Locally](#running-locally)
  * [Configuration](#configuration)
  * [Operational Documentation](#operational-documentation)
  * [Testing](#testing)
  * [Deployment](#deployment)
  * [Monitoring](#monitoring)
  * [Trouble-Shooting](#trouble-shooting)
  * [License](#license)


Requirements
------------

Running Origami Bower Registry requires [Node.js] 6.x and [npm].


Running Locally
---------------

Before we can run the application, we'll need to install dependencies:

```sh
make install
```

Run the application in development mode with

```sh
make run-dev
```

Now you can access the app over HTTP on port `8080`: [http://localhost:8080/](http://localhost:8080/)


Configuration
-------------

We configure Origami Bower Registry using environment variables. In development, configurations are set in a `.env` file. In production, these are set through Heroku config. Further documentation on the available options can be found in the [Origami Service documentation][service-options].

  * `GRAPHITE_API_KEY`: The FT's internal Graphite API key.
  * `PORT`: The port to run the application on.
  * `NODE_ENV`: The environment to run the application in. One of `production`, `development` (default), or `test` (for use in automated tests).
  * `PACKAGE_DATA_STORE`: The location of the JSON packages data that powers the service. This should be a URL.
  * `REGION`: The region the application is running in.
  * `SENTRY_DSN`: The Sentry URL to send error information to.

The service can also be configured by sending HTTP headers, these would normally be set in your CDN config:

  * `FT-Origami-Service-Base-Path`: The base path for the service, this gets prepended to all paths in the HTML and ensures that redirects work when the CDN rewrites URLs.


Operational Documentation
-------------------------

TODO copy from navigation service


Testing
-------

The tests are split into unit tests and integration tests. To run tests on your machine you'll need to install [Node.js] and run `make install`. Then you can run the following commands:

```sh
make test              # run all the tests
make test-unit         # run the unit tests
make test-integration  # run the integration tests
```

You can run the unit tests with coverage reporting, which expects 90% coverage or more:

```sh
make test-unit-coverage verify-coverage
```

The code will also need to pass linting on CI, you can run the linter locally with:

```sh
make verify
```

We run the tests and linter on CI, you can view [results on CircleCI][ci]. `make test` and `make lint` must pass before we merge a pull request.


Deployment
----------

The production ([EU][heroku-production-eu]/[US][heroku-production-us]) and [QA][heroku-qa] applications run on [Heroku]. We deploy continuously to QA via [CircleCI][ci], you should never need to deploy to QA manually. We use a [Heroku pipeline][heroku-pipeline] to promote QA deployments to production.

You'll need to provide an API key for change request logging. You can get this from the Origami LastPass folder in the note named `Change Request API Keys`. Now deploy the last QA image by running the following:

```sh
CR_API_KEY=<API-KEY> make promote
```


Monitoring
----------

  * [Grafana dashboard][grafana]: graph memory, load, and number of requests
  * [Pingdom check (Production EU)][pingdom-eu]: checks that the EU production app is responding
  * [Pingdom check (Production US)][pingdom-us]: checks that the US production app is responding
  * [Sentry dashboard (Production)][sentry-production]: records application errors in the production app
  * [Sentry dashboard (QA)][sentry-qa]: records application errors in the QA app
  * [Splunk (Production)][splunk]: query application logs


Trouble-Shooting
----------------

We've outlined some common issues that can occur in the running of the Origami Bower Registry:

### What do I do if memory usage is high?

For now, restart the Heroku dynos:

```sh
heroku restart --app origami-bower-registry-eu
heroku restart --app origami-bower-registry-us
```

If this doesn't help, then a temporary measure could be to add more dynos to the production applications, or switch the existing ones to higher performance dynos.

### What if I need to deploy manually?

If you _really_ need to deploy manually, you should only do so to QA. Production deploys should always be a promotion from QA.

You'll need to provide an API key for change request logging. You can get this from the Origami LastPass folder in the note named `Change Request API Keys`. Now deploy to QA using the following:

```sh
CR_API_KEY=<API-KEY> make deploy
```


License
-------

The Financial Times has published this software under the [MIT license][license].



[ci]: https://circleci.com/gh/Financial-Times/origami-bower-registry
[grafana]: http://grafana.ft.com/dashboard/db/TODO
[heroku-pipeline]: https://dashboard.heroku.com/pipelines/TODO
[heroku-production-eu]: https://dashboard.heroku.com/apps/TODO
[heroku-production-us]: https://dashboard.heroku.com/apps/TODO
[heroku-qa]: https://dashboard.heroku.com/apps/TODO
[heroku]: https://heroku.com/
[license]: http://opensource.org/licenses/MIT
[node.js]: https://nodejs.org/
[npm]: https://www.npmjs.com/
[pingdom-eu]: https://my.pingdom.com/newchecks/checks#check=TODO
[pingdom-us]: https://my.pingdom.com/newchecks/checks#check=TODO
[production-url]: TODO
[sentry-production]: https://sentry.io/nextftcom/TODO/
[sentry-qa]: https://sentry.io/nextftcom/TODO/
[service-options]: https://github.com/Financial-Times/origami-service#options
[splunk]: https://financialtimes.splunkcloud.com/en-US/app/search/search?q=TODO