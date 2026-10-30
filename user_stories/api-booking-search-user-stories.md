# Booking search API – user stories

## Product notes

- **Problem:** API customers can fetch one booking (`GET /v1/bookings/:id`) or every booking they can see (`GET /v1/bookings`). To find a subset they download everything and filter on their side. This is slow and wasteful for both sides.
- **Is it a solution in disguise?** No. A filtered query with the same response shape is the right fix. A cheaper alternative is adding single query parameters to `GET /v1/bookings`, but that makes the list endpoint hard to validate and extend. A filter list in a `POST` body is the better choice.
- **This is already built.** `POST /v1/bookings/search` exists in `app-clustermarket` (commit `2aad861bd`, 2026-10-02, branch `feature/post-mvp-booking-api`). It allows up to 5 filters and returns the list-bookings response shape. The stories below describe the behaviour as built, so they can serve as the acceptance spec and regression checklist. Before anyone starts work, confirm with dev whether it has shipped to production.
- **What is not done:** there is no mention of the endpoint in `doc/external_api/`, in `context/` or in the changelog. Customers cannot adopt what they cannot find, so story 2 (documentation) is the real remaining work.
- **No front end story.** This is API only. Nothing in the Svelte app changes, so I have not invented UI criteria.
- **Success measure to agree:** number of customers or tokens calling `/v1/bookings/search` per month, and a drop in full `GET /v1/bookings` calls from the same tokens. Neither is tracked today as far as I could see (question below).
- **Differences from `GET /v1/bookings` customers will hit when they migrate** (see code findings): ordering, visibility for some roles, and 100 as the maximum page size. Say these out loud in the documentation story.

## Code findings (not for the ticket)

- Current behaviour: route `post '/bookings/search(/)'` maps to `asset_requests#search` in `config/routes.rb` (external API block, `api` subdomain, version `v1` only). `ExternalApi::AssetRequestsController#search` calls `Bookings::Search.perform` and serialises the records with the same `serialise` call as `index`, so the response is the list shape from `ExternalApi::V1::AssetRequestSchema#collection_attributes`: `id`, `equipment_id`, `user_id`, `start_time`, `end_time`, `requested_at`, `updated_at`, `status`, `booking_type`, `maintenance_provider`, `maintenance_type`, `equipment.name`, `last_public_note.message`. `updated_at` is in the list response too.
- Filters (`app/services/bookings/search_filters.rb`): `MAX_FILTERS = 5`, all combined with AND. Properties and operators: `equipment_id`, `user_id`, `account_id` (integer; equals, greater_than, less_than); `start_time`, `end_time`, `requested_at`, `updated_at` (datetime; equals, greater_than, less_than); `status` (requested, approved, booked, completed, declined, cancelled) and `booking_type` (internal, external, maintenance), which take equals, in_list, not_in_list. Datetimes must be UTC ISO 8601 (`...Z` or `+00:00`). Integers must be JSON integers, not strings. Enum values are lower case only. Property names and operators are mapped to fixed SQL, so values cannot inject SQL.
- Pagination and order: `page` and `per_page` come from `ExternalApi::BaseController` (`per_page` 1 to 100, default and cap 100). Headers `X-Total-Records`, `X-Current-Page`, `X-Per-Page` are set as on the list endpoint. Search orders by `asset_requests.id ASC` (`Bookings::Search#page_records`); `index` orders by `created_at DESC`.
- Permissions: needs the `read_bookings` token scope (`before_action` in the controller). `ExternalApi::AssetRequestPolicy::SearchScope` allows admin, instructor, researcher, student and guest; accountants and users with no role get 403 `role_not_permitted`. Admin sees all bookings for permitted labs. Instructor sees bookings on equipment they manage, their own, and ones they are a non-rejected participant on (excluding cancelled and declined for participant matches). Researcher, student and guest see only their own or participating bookings. Applications flagged `special_purpose` can search across labs the user can access.
- Differences from the list endpoint: `AssetRequestPolicy::Scope` (used by `index`) lets admins see all, and lets non-admins see bookings on equipment in their groups or that they manage, plus their own. It does not include participant bookings, and it does not reject accountants outright (search does). So the two endpoints do not return the same rows for the same user. I did not test this against data. Worth a deliberate decision, not an accident.
- API impact: REST only. No GraphQL change. The `v1` constraint in the route is `/v[1]/i`.
- Jobs, emails, notifications affected: none.
- Risks and gaps:
  - No documentation (`doc/external_api/*.mkd` has no mention); `context/` files do not mention it either.
  - No `account_id` or `equipment_id` list filtering (single value only for integers), no sort option, no total-count-only mode, no text search.
  - A lower-case-only enum rule and strict integer rule could trip customers who send `"123"` or `"Booked"`. The error messages say which property failed.
  - Rate limiting for this endpoint was not checked (see `config/initializers/rack_attack.rb`).
  - Request spec exists: `spec/requests/external_api/v1/bookings_search_request_spec.rb` (admin, instructor, researcher/student/guest, invalid payload, auth cases). There are no tests for `special_purpose` applications that I could see in the first 60 lines; I did not read the whole file.
  - Error copy comes from `config/locales/external_api/en.yml` under `external_api.bookings.search`.
- Context files out of date: `context/3rd_party_integrations.md` (no mention of the search endpoint; its API scopes list `read_bookings` only). `context/code-map.md` needs no change.

---

## Booking search API – search endpoint (back end)

> As an API customer (Admin, Instructor, Researcher, Student or Guest with a valid access token), I want to search my bookings using up to five filter conditions in one request, so that I can retrieve just the bookings I need without downloading and filtering all of them.

---

## Acceptance Criteria:
- [ ] A `POST /v1/bookings/search` endpoint will be available on the external API, accepting a JSON body with an optional `filters` array. A trailing slash is accepted.
- [ ] The endpoint will require a valid access token with the `read_bookings` scope. A missing token returns 401. A token without the scope returns 403 with the error `insufficient_scope` and a readable message.
- [ ] Each filter will have `property`, `operator` and `value`. All filters in a request are combined with AND.
- [ ] A request may include up to 5 filters. More than 5 returns 422 with the error `too_many_filters` and the message "You have provided more than 5 filters in the payload body. This is not supported. Please reduce the number of filters to 5 or less."
- [ ] A request with no `filters` returns all bookings the user is permitted to see.
- [ ] These properties and operators will be supported:
  - `equipment_id`, `user_id`, `account_id`: `equals`, `greater_than`, `less_than`. Value is a JSON integer.
  - `start_time`, `end_time`, `requested_at`, `updated_at`: `equals`, `greater_than`, `less_than`. Value is a UTC ISO 8601 timestamp, for example `2026-10-01T09:00:00Z`.
  - `status`: `equals` (one value), `in_list`, `not_in_list` (array). Values: `requested`, `approved`, `booked`, `completed`, `declined`, `cancelled`.
  - `booking_type`: `equals` (one value), `in_list`, `not_in_list` (array). Values: `internal`, `external`, `maintenance`.
- [ ] The same property can be used in more than one filter (for example `start_time` greater than and less than, to give a date range).
- [ ] The `status` and `booking_type` values match what `GET /v1/bookings` returns for the same booking.
- [ ] An unsupported property, an operator that does not fit the property, a value of the wrong type, or a `filters` value that is not an array returns 422 with a specific error code (`unsupported_property`, `unsupported_operator`, `unsupported_value`, `invalid_filters`) and a message naming the problem property or operator.
- [ ] The response body will be an array of bookings with exactly the same structure and key names as `GET /v1/bookings`, including `updated_at` and `last_public_note`.
- [ ] Results will be paginated with `page` and `per_page` query parameters. `per_page` accepts 1 to 100 and defaults to 100.
- [ ] The response will include the headers `X-Total-Records`, `X-Current-Page` and `X-Per-Page`, with `X-Total-Records` counting all matching bookings, not only the current page.
- [ ] Results will be ordered by booking id ascending, so pages are stable.
- [ ] Admins will see all bookings in the labs their token is authorised for.
- [ ] Instructors will see bookings on equipment they manage, bookings they made, and bookings where they are an invited participant who has not rejected. Cancelled and declined participant bookings are not returned.
- [ ] Researchers, students and guests will see only their own bookings and ones they are a participant on.
- [ ] Users whose only role is Accountant, or who have no lab role, get 403 with the error `role_not_permitted`.
- [ ] An `account_id` equals filter for a lab the token is not authorised for returns 403 with the error `account_not_authorised`. Without an `account_id` filter, results cover all labs the token is authorised for.
- [ ] Filter property names and operators are allow-listed. No value from the request body is added to the query as SQL.
- [ ] Request specs cover each property and operator, pagination, headers, each role, and each error case.

## Notes:
- This is delivered in the code already (commit `2aad861bd`). If it has shipped, treat the criteria as the acceptance and regression checklist and take no further build work.
- Question: should search return the same rows as `GET /v1/bookings` for the same user? Today it does not for participants and accountants (see code findings). Decide before documenting.
- Question: do customers need to filter by several equipment or user ids at once (`in_list` for ids)? Not supported today.
- Question: do we need a sort option (most customers will want newest first, which is how `GET /v1/bookings` is ordered)?
- Question: is usage of this endpoint tracked so we can measure adoption?
- This story has no front end dependency. The documentation story depends on it.

## Design:
Not applicable (API only).

## Additional requirements clarified during development:

## Additional Info:
- [Definition of Done](https://clustermarket1.atlassian.net/wiki/spaces/PD/pages/27721779/Definition+of+Done)

/confidential

---

## Booking search API – developer documentation (back end)

> As an API customer, I want clear documentation and examples for the booking search endpoint, so that I can move my existing integration from downloading all bookings to searching for the ones I need.

---

## Acceptance Criteria:
- [ ] The external API documentation in `doc/external_api` will describe `POST /v1/bookings/search`: authentication, the `read_bookings` scope, request body, pagination, headers and the response structure.
- [ ] The documentation will list every supported property, operator and allowed value, the 5 filter limit, the UTC ISO 8601 timestamp rule, the JSON integer rule and the lower-case enum rule.
- [ ] The documentation will include at least three request and response examples: a date range for one piece of equipment, bookings with a status in a list, and an invalid request with its error response.
- [ ] The documentation will list every error code and message returned by the endpoint.
- [ ] The documentation will state which bookings each role can see, and note any differences from `GET /v1/bookings` (ordering and visibility).
- [ ] The documentation will include a short migration note for customers currently calling `GET /v1/bookings` and filtering locally.
- [ ] The published API reference (for example Swagger/OpenAPI or the developer portal, whichever is customer-facing) will include the new endpoint.
- [ ] The release notes or changelog will announce the endpoint.

## Notes:
- Depends on the search endpoint story.
- Question: where is the customer-facing API reference published, and who owns updating it? The `openapi.json` in the PM folder is a personal project and is not the source of truth.
- Question: should existing API customers who asked for this be told directly (support or account managers)?

## Design:
Not applicable.

## Additional requirements clarified during development:

## Additional Info:
- [Definition of Done](https://clustermarket1.atlassian.net/wiki/spaces/PD/pages/27721779/Definition+of+Done)

/confidential

---

## Suggested GitLab labels
Feature label for the external API / booking API (label TBC), documentation label for the second story (label TBC). Link the two stories with the shared feature label, not an epic.
