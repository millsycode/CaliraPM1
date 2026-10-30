# Code map: app-clustermarket

Use this file first for any question about how the product is built or whether a behaviour exists. It tells you which folder to open so you do not need to search the whole repo.

Code location: `C:\Users\mills\Documents\Code\Clustermarket\app-clustermarket` (read only for PM work; never edit).
Other repos and folders in `CaliraPM` such as `apicode/`, `csharpclient/` and `openapi.json` are personal projects. Do not treat them as the product's code.

## Stack

- Ruby 3.4 and Rails 7.2, PostgreSQL (`db/structure.sql`, about 313 migrations), Redis, Sidekiq (jobs, `sidekiq-scheduler` for recurring jobs).
- Front end: Svelte 5 in `app/javascript`, built with Vite. Some pages are server-rendered Slim views in `app/views` that mount Svelte components.
- API for the front end: GraphQL (`graphql-ruby`). Apollo client on the front end. `schema.graphql` and `graphql.types.ts` at the repo root are generated.
- Public REST API ("external API", OAuth 2 via Doorkeeper): `app/controllers/external_api`.
- Authorisation: Pundit policies in `app/policies`. Feature flags: Flipper. Admin back office ("Control Room"): ActiveAdmin in `app/admin`.
- Auditing: PaperTrail. Billing: Chargebee and Braintree. Customer messaging: Customer.io (`app/lib/cio`). Product analytics: Ahoy. Errors: Sentry.
- Tests: RSpec in `spec/` (mirrors `app/`), Vitest and Storybook for the front end.

## Terminology: product words vs code words

Confirm with `context/*.md` or a model file before relying on a mapping marked (check).

| Product word | Code word |
|---|---|
| Equipment | `Asset` (`app/models/asset.rb`); also "equipment" in controllers, routes and the UI folder `components/equipment` |
| Booking | `AssetRequest`, which inherits from `Request` (`app/models/asset_request.rb`, large file) |
| Lab, department, organisation | all `Account` records linked by `department` / `organisation` (`account.rb`); the `Organization` model is deprecated and empty |
| User role | `AccessRole` (admin, instructor, researcher, student, guest); see `context/users_and_security.md` |
| Group | `Group` |
| Training | `AssetTraining` |
| Participant / invitee | `BookingInvitation` |
| Custom form and its response | `CustomForm`, `CustomFormInput` (the response), `CustomFormHistory` |
| Workflow | `Workflows::Builder`, `app/lib/workflows`, `Workflow` types in GraphQL |
| Maintenance contract | `MaintenanceContract` |
| Services / marketplace | `Service`, `ServiceRequest`; `AssetRequest` also covers marketplace (external) bookings |
| Control Room | ActiveAdmin: `app/admin`, `app/controllers/control_room` |
| Clustermarket | previous product name; still used throughout code and docs |

## Where things live (backend)

| You need | Open |
|---|---|
| Business rules, validations, callbacks, statuses | `app/models/<name>.rb` and `app/models/concerns/` (start here for "does the system allow X") |
| Who may do what | `app/policies/<name>_policy.rb`; REST scopes in `app/policies/external_api` |
| Front-end API (queries) | `app/graphql/types/query_type.rb`, then `app/graphql/types/<area>/`, `app/graphql/sources/` (data loaders), `app/queries/<area>/` (query objects) |
| Front-end API (writes) | `app/graphql/mutations/<area>/`, input shapes in `app/graphql/inputs/<area>/`, enums in `app/graphql/types/enums/` |
| Public REST API | `config/routes.rb` (`scope module: :external_api`, served on the `api` subdomain, near line 42), `app/controllers/external_api/`, `app/lib/external_api/v1`, `doc/external_api/*.mkd` |
| Old-style JSON endpoints used by pages | `app/controllers/api/` |
| Server-rendered pages and routes | `config/routes.rb` plus one file per area in `config/routes/` (27 files, e.g. `custom_forms_routes.rb`), controllers in `app/controllers/`, views in `app/views/<area>/` |
| Domain logic that is not a model | `app/lib/<area>/` (bookings, workflows, assets, integrations, SSO, event_notifier, pdf_generator), `app/services/`, `app/service_objects/` |
| Third-party integrations | `app/lib/integrations/` (Benchling, eLabNext, Essentim, Outlook), `app/jobs/integrations`, `context/3rd_party_integrations.md` |
| Background and scheduled work | `app/jobs/<area>/`, `config/sidekiq.yml`, `schedule_daily_events_job.rb` |
| Emails | `app/mailers/` and `app/views/<mailer_name>/`; sending rules in `app/lib/event_notifier/` |
| Notifications | `app/models/notification*.rb`, `app/graphql/types/notifications`, `app/jobs` |
| SSO, SAML, Shibboleth, OAuth | `app/lib/SSO`, `app/models/saml_based`, `shibboleth`, `app/lib/omni_auth`, `app/lib/doorkeeper`, `doc/sso/` |
| Subscriptions and pricing plans | `app/models/subscription.rb`, `app/models/subscriptions/`, `app/lib/subscriptions`, `config/initializers/chargebee.rb`, front end `components/pricing_bundles` |
| Reports | `app/models/advanced_reports`, `app/controllers/advanced_reports_controller.rb`, `app/controllers/api/advanced_reports`, `app/policies/advanced_reports` |
| Feature flags | `config/initializers/flipper.rb`, `app/lib/feature_flag`, front end `utilities/feature_flag.js` |
| Constants and config | `config/config.yml`, `config/initializers/clustermarket_constants.rb`, `app/constants` |
| Text shown to users | `config/locales/` |
| Database shape | `db/structure.sql` (search for the table name, e.g. `CREATE TABLE public.asset_requests`) |
| Release history | `CHANGELOG.md` (stops at v2.6.0; use `git log` for recent changes) |
| Dev and CI notes | `README.md`, `doc/`, `docs/ci-cd`, `.gitlab-ci.yml` |

GraphQL naming rule: mutation or query for an area X is usually in `app/graphql/mutations/x/` and `app/graphql/types/x/`, with a matching input in `app/graphql/inputs/x/` and a spec in `spec/graphql/`.

## Where things live (front end)

All under `app/javascript/`.

| You need | Open |
|---|---|
| Feature UI | `components/<area>/` : `booking` (140 files), `booking_modal`, `custom-forms` (94), `equipment` (93), `integrations` (107), `workflows` (47), `account_settings`, `invite_user_main`, `pricing_bundles`, `notifications`, `onboarding_checklist`, `profile`, `oauth`, `sidebar` |
| Shared UI components | `components/UI/` (307 files; buttons, tables, modals, date pickers) and `components/Layout/` (179) |
| Calendar logic | `modules/calendar/` and `modules/calendar_initialization.js`; booking validations in `modules/calendar/validations/` |
| GraphQL calls | `graphql/queries.graphql.js`, `mutations.graphql.js`, `fragments.graphql.js`, plus `components/<area>/graphql/` |
| Stores and state | `components/stores/` |
| Helpers | `utilities/` (current user and role, dates, feature flags, routing), `services/` (toasts, modals, cache, error handling) |
| Component catalogue | `storybook/stories/` and `component-reports/` in the PM folder |
| Entry point | `packs/application.js` |
| Front-end tests | `*.spec.js` beside the component or in `tests/` folders |

## Worked example: where "custom forms" lives

Use this as the template for tracing any feature through the layers.

- Model: `app/models/custom_form.rb`, `custom_form_input.rb`, `custom_form_history.rb`, `assets_custom_form.rb`
- Policies: `app/policies/custom_form_policy.rb`, `custom_form_input_policy.rb`, `custom_form_history_policy.rb`
- GraphQL: `app/graphql/mutations/custom_forms/`, `mutations/custom_form_inputs/`, `types/custom_form_type.rb`, `types/enums/custom_forms/`, `sources/custom_forms/`, `inputs/custom_forms/`
- Queries: `app/queries/custom_forms/`, `custom_form_inputs/`, `custom_form_histories/`
- Jobs and email: `app/jobs/custom_forms/` (missed-submission reminders), `app/mailers/custom_form_mailer.rb`, `app/lib/event_notifier/custom_forms/`
- REST: `app/controllers/external_api/custom_form_responses_controller.rb`
- Routes and views: `config/routes/custom_forms_routes.rb`, `app/controllers/custom_forms_controller.rb`, `app/views/custom_forms/`
- Front end: `app/javascript/components/custom-forms/`
- Tests: `spec/graphql/mutations/custom_forms/`, `spec/graphql/queries/`, `spec/factories/`
- Business rules: `context/custom_forms.md`

## Fast search recipes

- Is there a setting for X: search `app/models/account.rb` and `app/models/concerns/account_features.rb`, then `app/javascript/components/account_settings/`.
- What happens when X is saved: model file, then `app/lib/event_notifier`, then `app/jobs`.
- Can role R do X: the matching policy file; compare with `context/users_and_security.md`.
- Does the API expose X: `grep` the name in `schema.graphql` (front end API) and `app/controllers/external_api` (public API).
- Always name the file and method you relied on when stating a "code finding", so the user can check it.
