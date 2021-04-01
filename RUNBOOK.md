<!--
    Written in the format prescribed by https://github.com/Financial-Times/runbook.md.
    Any future edits should abide by this format.
-->
# Origami Bower Registry

Install Financial Times GitHub repositories as Bower components

## Code

origami-bower-registry

## Service Tier

Platinum

## Lifecycle Stage

Deprecated

## Primary URL

https://origami-bower-registry.ft.com

## Host Platform

Heroku

## Contains Personal Data

No

## Contains Sensitive Data

No

## Can Download Personal Data

No

## Can Contact Individuals

No

## Failover Architecture Type

ActiveActive

## Failover Process Type

FullyAutomated

## Failback Process Type

FullyAutomated

## Data Recovery Process Type

NotApplicable

## Release Process Type

PartiallyAutomated

## Rollback Process Type

PartiallyAutomated

## Key Management Process Type

Manual

## Architecture

This is mostly a Node.js application but with the following external components:

*   An S3 bucket which contains a cache of JSON data
*   An [organisation-wide Webhook](https://github.com/organizations/Financial-Times/settings/hooks) on the Financial-Times GitHub

### Loading Data

1.  When this service starts, the first thing it does is fetches a JSON file from an S3 bucket. If this bucket isn't available then the application will ignore it – the JSON data is a cache, and is much faster to access than crawling the GitHub API
2.  Having loaded the cached data (or not), the application makes several requests to the GitHub API to fetch every repository name in the Financial-Times GitHub organisation. It then discards the original cached JSON data
3.  The application replaces the JSON file in the S3 bucket with a new fresh copy of the data in GitHub, so that next time the application starts it has the latest data

### Ingestion

1.  When a repository is created, renamed, or deleted on the Financial Times GitHub, an organisation-wide webhook makes a request to this service
2.  The service then performs step 2 and 3 in "Loading Data" outlined above, ensuring that all of the data is fresh

<!-- Placeholder - remove HTML comment markers to activate
## Heroku Pipeline Name
Enter descriptive text satisfying the following:
This is the name of the Heroku pipeline for this system. If you don't have a pipeline, this is the name of the app in Heroku. A pipeline is a group of Heroku apps that share the same codebase where each app in a pipeline represents the different stages in a continuous delivery workflow, i.e. staging, production.

...or delete this placeholder if not applicable to this system
-->

## First Line Troubleshooting

There are a few things you can try before contacting the Origami team:

1.  Verify that GitHub and S3 are up. Either of these being down could cause downtime for this application. See [GitHub's status page](https://www.githubstatus.com/) and the [Registry Data's `__gtg` endpoint](https://origami-bower-registry-data.ft.com/__gtg).
2.  Restart all of the dynos across the production EU and US Heroku apps ([pipeline here](https://dashboard.heroku.com/pipelines/748923ac-b3c0-4289-a0ac-c26b5a7dbe3a))

## Second Line Troubleshooting

If the application is failing entirely, you'll need to check a couple of things:

1.  Did a deployment just happen? If so, roll it back to bring the service back up (hopefully)
2.  Check the Heroku metrics page for both EU and US apps, to see what CPU and memory usage is like ([pipeline here](https://dashboard.heroku.com/pipelines/748923ac-b3c0-4289-a0ac-c26b5a7dbe3a))
3.  Check the Splunk logs (see the monitoring section of this runbook for the link)

If only a few things aren't working, the Splunk logs (see monitoring) are the best place to start debugging. Always roll back a deploy if one happened just before the thing stopped working – this gives you the chance to debug in the relative calm of QA.

## Monitoring

*   [Grafana dashboard][grafana]: graph memory, load, and number of requests
*   [Pingdom check (Production EU)][pingdom-eu]: checks that the EU production app is responding
*   [Pingdom check (Production US)][pingdom-us]: checks that the US production app is responding
*   [Sentry dashboard (Production)][sentry-production]: records application errors in the production app
*   [Sentry dashboard (QA)][sentry-qa]: records application errors in the QA app
*   [Splunk (Production)][splunk]: query application logs

[grafana]: http://grafana.ft.com/dashboard/db/origami-bower-registry

[pingdom-eu]: https://my.pingdom.com/newchecks/checks#check=2952910

[pingdom-us]: https://my.pingdom.com/newchecks/checks#check=2952919

[sentry-production]: https://sentry.io/nextftcom/origami-bower-registry-product/

[sentry-qa]: https://sentry.io/nextftcom/origami-bower-registry-qa/

[splunk]: https://financialtimes.splunkcloud.com/en-US/app/search/search?q=search%20index%3Dheroku%20source%3D%2Fvar%2Flog%2Fapps%2Fheroku%2Forigami-bower-registry-*

## Failover Details

Our Fastly config automatically routes requests between the production EU and US Heroku applications. If one of those regions is down, Fastly will route all requests to the other region.

## Data Recovery Details

The data stored in S3 is only used as a cache, recovery is not necessary as it's rebuilt from GitHub whenever the application starts.

## Release Details

The application is deployed to QA whenever a new commit is pushed to the `master` branch of this repo on GitHub. To release to production, the QA application must be [manually promoted through the Heroku interface](https://dashboard.heroku.com/pipelines/748923ac-b3c0-4289-a0ac-c26b5a7dbe3a).

## Key Management Details

This service uses two keys:

1.  GitHub (with read permissions only)
2.  AWS (read/write permissions for a single S3 bucket)

The process for rotating these keys is manual, via the GitHub and AWS interfaces.
