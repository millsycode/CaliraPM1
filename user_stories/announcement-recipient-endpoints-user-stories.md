# Announcement recipient endpoints: user stories

## Background

The original story (`GET /v1/announcement/:account_id/announcement_users`) required a request body on a GET, which is bad practice. Following backlog refinement it is replaced by the scenarios below. Inputs are now query parameters.

| # | Scenario | Solution |
|---|----------|----------|
| 1 | Recipients for a **general** announcement | **No new story.** Use the existing `GET /v1/users/{account_id}` endpoint (`read_users` scope), which returns all lab members. |
| 2 | Recipients for an **equipment** announcement, selected by existing bookings in a time window | **Story 1** below |
| 3 | Recipients for an **equipment** announcement, selected by who has access to the equipment | **Story 2** below |

### Shared conventions (apply to both stories)

These follow the existing external API (`ExternalApi::UsersController`, `config/locales/external_api/en.yml`).

- **Scope:** `read_users`. No new scope is needed.
- **Roles:** the authenticated user must be an `admin` or `instructor` in the lab. Other roles are rejected with `role_not_permitted`.
- **Instructors** may only use equipment they are assigned to. Otherwise the endpoint returns `equipment_not_authorised` (403).
- **Naming:** snake_case query parameters and response fields.
- **Pagination:** the same `page` / `per_page` parameters and response headers as `GET /v1/users/{account_id}`.
- **Error format:** `{ "errors": ["<code>"], "error_messages": ["<message>"] }`, with messages stored under `external_api.announcement_users.*` in the locale file.
- **Recipient exclusions** (match the in-app announcement recipient picker): the authenticated user is never returned. Lab admins are not returned by the booking endpoint.
- **Equipment limit:** a maximum of **100** `equipment_ids` per request.
- **Response shape:**

```json
{
  "announcement_users": [
    { "id": 12345, "first_name": "David", "last_name": "Green", "email": "dgreen@thing.com", "role": "researcher" }
  ]
}
```

`role` is the user's role in the lab identified by `account_id`. An empty result returns `200` with `"announcement_users": []`.

---

## Story 1: Retrieve users with bookings on selected equipment in a time window

**As a** consumer using the writable API to create equipment announcements,
**I want** to retrieve the users who own or participate in bookings on selected equipment during a given time window,
**so that** I can target the announcement at the people affected by equipment downtime without calling an endpoint for each user.

### Endpoint

`GET /v1/announcements/:account_id/booking_users?equipment_ids=145928,145929&start_time=2026-07-27T00:00:00Z&end_time=2026-07-31T00:00:00Z`

| Parameter | Required | Notes |
|-----------|----------|-------|
| `account_id` (path) | Yes | The lab. |
| `equipment_ids` | Yes | Array or comma-separated list. 1 to 100 ids. |
| `start_time` | Yes | ISO 8601 UTC timestamp. |
| `end_time` | Yes | ISO 8601 UTC timestamp. Must be after `start_time`. |
| `page`, `per_page` | No | Pagination. |

### Acceptance criteria

1. The endpoint is read-only, uses GET, and has no request body.
2. It is available under the existing external API versioning structure at the path above.
3. It requires a valid OAuth token with the `read_users` scope. Requests without it are rejected with `insufficient_scope` (403).
4. The authenticated user must have the administrator or instructor role in the lab. Any other role is rejected with `role_not_permitted` (403).
5. It returns the distinct users who are either the **owner** or a **participant** of a booking that:
   - is on one of the `equipment_ids`;
   - overlaps the window between `start_time` and `end_time`;
   - has a status of **booked** or **requested / pending approval**.
6. Participants with a declined invitation are not returned. *(Assumption: accepted and pending invitations are included. Please confirm.)*
7. The authenticated user and the lab's admins are excluded from the results.
8. A user who appears in several bookings is returned once.
9. Each user is returned with `id`, `first_name`, `last_name`, `email` and `role` (their role in the lab).
10. If no bookings match, the endpoint returns `200` with `"announcement_users": []`.
11. Results are paginated in the same way as `GET /v1/users/{account_id}`.

### Error handling

Authentication and scope errors use the existing formats. Responses with a code use `{ "errors": ["<code>"], "error_messages": ["<message>"] }`. Time window errors (`422`) use `{ "errors": [ { "attribute": "<field>", "message": "<short message>" } ], "error_messages": ["<message>"] }`. Placeholders in `{braces}` are filled in at run time.

**Source** shows where the wording already exists in `config/locales/external_api/en.yml`. **New** means no equivalent exists yet and the wording is proposed. **Adapted** means an existing message with the change shown.

| Condition | HTTP | Code | Message | Source |
|-----------|------|------|---------|--------|
| Missing, invalid or expired token | 401 | `unauthorised` | `{ "error": "unauthorised", "error_description": "You do not have the required access token for this request." }` | `external_api.errors.unauthorised` |
| Application not approved | 403 | `unapproved_application` | `{ "error": "unapproved_application", "error_description": "This application has not yet been approved to access Clustermarket data." }` | `external_api.errors.unapproved_app` |
| Token has no `read_users` scope | 403 | `insufficient_scope` | Forbidden - your OAuth token does not have the read_users permission needed to call this endpoint. Please generate a new token with the required permissions | `external_api.users.insufficient_scope` |
| `account_id` not found | 404 | `account_not_found` | Account id not found. Please check your account id | `external_api.users.account_not_found` |
| Token or user not valid for the lab | 403 | `account_not_authorised` | Forbidden - you have used a token which is not valid for the account_id passed in. Please check your token details and generate a new one. Alternatively add the user linked to the token to the lab (account_id) passed in. | `external_api.users.account_not_authorised` |
| User is not an administrator or instructor | 403 | `role_not_permitted` | Forbidden - you have used a token for a user without the administrator or instructor roles. Users with other roles are not permitted. Please generate a new token for a valid user. | `external_api.users.role_not_permitted` |
| `start_time` or `end_time` missing | 422 | `missing_time` | You have not passed in a value for {attribute}. Please provide {attribute} in ISO 8601 format in UTC, for example 2026-07-09T08:30:00Z | `external_api.available_slots.missing_time` |
| `start_time` or `end_time` not ISO 8601 in UTC (for example has a `+01:00` offset) | 422 | `invalid_time_format` | You have passed in a value for {attribute} which is not in ISO 8601 format in UTC. Please provide {attribute} in a format such as 2026-07-09T08:30:00Z | `external_api.available_slots.invalid_time_format` |
| `end_time` before or equal to `start_time` | 422 | `end_time_not_after_start_time` | You have passed in an end time which is before or equal to the start time please provide an end time after the start time | `external_api.available_slots.end_time_not_after_start_time` |
| Window longer than one month | 422 | `window_too_long` | The maximum period between proposed start and end times is one month. Please reduce your time window and try again | Adapted from `external_api.available_slots.window_too_long`, which says "two weeks" |
| `equipment_ids` missing or empty | 422 | `equipment_ids_required` | You have not passed in a value for equipment_ids. Please provide between 1 and 100 equipment ids and try again | New, modelled on `missing_time` |
| More than 100 `equipment_ids` | 422 | `too_many_equipment_ids` | You have passed in more than 100 equipment ids. This is not supported. Please reduce the number of equipment ids to 100 or fewer and try again | New, modelled on `external_api.bookings.search.too_many_filters` |
| One or more equipment ids do not exist or are not in this lab | 404 | `equipment_not_found` | No equipment exists with one or more of the equipment_ids in this request. The connected equipment ids are: {equipment_ids} | `external_api.equipment_training.errors.equipment_not_found` (`{equipment_ids}` lists the ids that failed) |
| Authenticated instructor is not assigned to one or more of the equipment | 403 | `equipment_not_authorised` | Forbidden - the authenticated user is an instructor for the lab but is not assigned to one or more pieces of equipment in this request, so they cannot make announcements for equipment they do not manage. The connected equipment ids are: {equipment_ids} | Adapted from `external_api.equipment_training.errors.equipment_not_authorised`; the "so they cannot make announcements…" clause is added |

### Notes

- The query logic should mirror the `bookings` category of the in-app `announcementUsers` GraphQL query, extended to include booking participants.
- The existing `AvailableSlotsParamsValidator` can be reused or extended for the timestamp validation. Its two-week cap becomes a configurable one-month cap here.

### INVEST check

- **Independent:** it doesn't depend on Story 2 or on the general-announcement endpoint.
- **Negotiable:** the path and fields are agreed. The participant invitation statuses are still open (see criterion 6).
- **Valuable:** it removes per-user calls when announcing downtime.
- **Estimable:** it reuses an existing controller pattern, validators and query logic.
- **Small:** one endpoint, one query.
- **Testable:** every criterion maps to a request spec.

---

## Story 2: Retrieve users with access to selected equipment

**As a** consumer using the writable API to create equipment announcements,
**I want** to retrieve the users who have access to selected equipment,
**so that** I can target the announcement at everyone who can use that equipment without calling an endpoint for each user.

### Endpoint

`GET /v1/announcements/:account_id/equipment_access_users?equipment_ids=145928,145929`

| Parameter | Required | Notes |
|-----------|----------|-------|
| `account_id` (path) | Yes | The lab. |
| `equipment_ids` | Yes | Array or comma-separated list. 1 to 100 ids. |
| `page`, `per_page` | No | Pagination. |

No start or end time is accepted, because access is not time-based. Supplying `start_time` or `end_time` is ignored. *(Alternatively it could return `unsupported_field`. Please confirm which.)*

### Acceptance criteria

1. The endpoint is read-only, uses GET, and has no request body.
2. It is available under the existing external API versioning structure at the path above.
3. It requires a valid OAuth token with the `read_users` scope. Requests without it are rejected with `insufficient_scope` (403).
4. The authenticated user must have the administrator or instructor role in the lab. Any other role is rejected with `role_not_permitted` (403).
5. It returns the distinct users who have access to **any** of the `equipment_ids`. Access is determined as in the in-app announcement recipient picker, meaning access through:
   - access groups;
   - equipment training;
   - admin or instructor assignment, including roles inherited from parent labs or organisations.
6. The authenticated user is excluded from the results.
7. A user with access to several of the equipment is returned once.
8. Each user is returned with `id`, `first_name`, `last_name`, `email` and `role`. Where a user has several roles through the lab hierarchy, the role in the requested lab is returned in preference to an inherited one.
9. If no user has access, the endpoint returns `200` with `"announcement_users": []`.
10. Results are paginated in the same way as `GET /v1/users/{account_id}`.

### Error handling

The error format, placeholders and **Source** column are as described for Story 1. There are no time errors because this endpoint takes no times.

| Condition | HTTP | Code | Message | Source |
|-----------|------|------|---------|--------|
| Missing, invalid or expired token | 401 | `unauthorised` | `{ "error": "unauthorised", "error_description": "You do not have the required access token for this request." }` | `external_api.errors.unauthorised` |
| Application not approved | 403 | `unapproved_application` | `{ "error": "unapproved_application", "error_description": "This application has not yet been approved to access Clustermarket data." }` | `external_api.errors.unapproved_app` |
| Token has no `read_users` scope | 403 | `insufficient_scope` | Forbidden - your OAuth token does not have the read_users permission needed to call this endpoint. Please generate a new token with the required permissions | `external_api.users.insufficient_scope` |
| `account_id` not found | 404 | `account_not_found` | Account id not found. Please check your account id | `external_api.users.account_not_found` |
| Token or user not valid for the lab | 403 | `account_not_authorised` | Forbidden - you have used a token which is not valid for the account_id passed in. Please check your token details and generate a new one. Alternatively add the user linked to the token to the lab (account_id) passed in. | `external_api.users.account_not_authorised` |
| User is not an administrator or instructor | 403 | `role_not_permitted` | Forbidden - you have used a token for a user without the administrator or instructor roles. Users with other roles are not permitted. Please generate a new token for a valid user. | `external_api.users.role_not_permitted` |
| `equipment_ids` missing or empty | 422 | `equipment_ids_required` | You have not passed in a value for equipment_ids. Please provide between 1 and 100 equipment ids and try again | New, modelled on `external_api.available_slots.missing_time` |
| More than 100 `equipment_ids` | 422 | `too_many_equipment_ids` | You have passed in more than 100 equipment ids. This is not supported. Please reduce the number of equipment ids to 100 or fewer and try again | New, modelled on `external_api.bookings.search.too_many_filters` |
| One or more equipment ids do not exist or are not in this lab | 404 | `equipment_not_found` | No equipment exists with one or more of the equipment_ids in this request. The connected equipment ids are: {equipment_ids} | `external_api.equipment_training.errors.equipment_not_found` (`{equipment_ids}` lists the ids that failed) |
| Authenticated instructor is not assigned to one or more of the equipment | 403 | `equipment_not_authorised` | Forbidden - the authenticated user is an instructor for the lab but is not assigned to one or more pieces of equipment in this request, so they cannot make announcements for equipment they do not manage. The connected equipment ids are: {equipment_ids} | Adapted from `external_api.equipment_training.errors.equipment_not_authorised`; the "so they cannot make announcements…" clause is added |

### Notes

- The query logic should mirror the `equipment` category of the in-app `announcementUsers` GraphQL query (`Asset.users_with_access_for`).
- The existing `GET …/equipment_access` endpoint handles a single piece of equipment with different permissions. This new endpoint accepts many pieces of equipment and is restricted to admins and instructors.
- Parent equipment is passed through `users_with_access_for`, which already resolves parent and child access. *(Please confirm that parent equipment ids are accepted here, unlike the single-equipment endpoint.)*

### INVEST check

- **Independent:** it can ship without Story 1.
- **Negotiable:** the ignore-or-reject behaviour for time parameters is still open.
- **Valuable:** it removes per-user calls when announcing to everyone with access.
- **Estimable:** it reuses an existing query.
- **Small:** one endpoint, one query.
- **Testable:** every criterion maps to a request spec.

---

## Open points to confirm

1. Do participants include pending invitations, or only accepted ones? (Story 1, criterion 6)
2. Is "one month" 31 days, or a calendar month? (Story 1)
3. Should `start_time` / `end_time` on the access endpoint be ignored or rejected? (Story 2)
4. Are parent equipment ids accepted? (Story 2)
