# Create announcement endpoint: user stories (Stories 3 to 5)

These replace the single "create announcements" story. They follow on from Stories 1 and 2 in `announcement-recipient-endpoints-user-stories.md`.

## Review summary

The original story was too large and had several issues. The main changes are below.

| Original story | Change |
|---|---|
| One story covering scope, general, equipment, access rules and declining bookings | Split into three stories (3, 4, 5). |
| Wording about bookings being "created" or "updated" | Replaced with announcement wording. |
| "Permission to create bookings for the selected equipment" | Replaced with: admins can announce on any equipment in the lab. Instructors can announce only on equipment they manage. |
| `accountId` in both the path and the body | Path only. |
| camelCase | snake_case, as in Stories 1 and 2. |
| All properties mandatory | Required fields now depend on the announcement type. |
| "All other properties null" on error | Dropped. The error format follows the existing API, which is a list of attribute and message pairs plus `error_messages`. |
| Emails for "all users referenced" | Clarified: the creator always gets an email. Recipients get one unless they have turned off announcement emails. |
| Silent filtering of invalid equipment ids (the UI behaviour) | The API returns explicit errors instead. |
| Times assumed to be treated as UTC | Explicit contract, with a model change required (see Story 4). |

### Shared conventions (apply to Stories 3 to 5)

- **Endpoint:** `POST /v1/announcements/:account_id`. The body is JSON. `:account_id` is the lab.
- **Auth:** OAuth token with the new **`write_announcements`** scope. This is added to `optional_scopes` in `config/initializers/doorkeeper.rb`. The read-only recipient endpoints (Stories 1 and 2) keep using `read_users`.
- **Roles:** the authenticated user must be an `admin` or `instructor` in the lab.
- **Lab access:** the token's OAuth application must be authorised for the lab. The lab must have the announcements feature (`supports_paid_feature?(:announcements)`).
- **Announcement types:** `general` or `bookings`. `bookings` is the existing internal type used for equipment announcements, and it is what makes declining bookings work. Stories 1 and 2 describe this as the "equipment" announcement type.
- **Naming:** snake_case properties.
- **Error format:** the same as the existing API. All violations are returned together and nothing is created.

```json
{
  "errors": [ { "attribute": "end_time", "message": "must be after start_time" } ],
  "error_messages": [ "The end time must be after the start time. Please provide an end_time later than start_time and try again." ]
}
```

- **Limits:** `subject` is at most 255 characters. `message` is at most 10,000 characters. `equipment_ids` is at most 100 ids. `user_ids` is at most 1,000 ids.
- **Atomicity:** an announcement is created completely or not at all.
- **Successful response:** `201 Created`.

```json
{
  "announcement": {
    "id": 98765,
    "account_id": 15125,
    "announcement_type": "bookings",
    "equipment_ids": [ 10765, 10767 ],
    "user_ids": [ 206016, 206017 ],
    "subject": "Two pieces of equipment are down",
    "message": "Fume hood 3 and the evaporator within it cannot be used…",
    "start_time": "2026-07-26T23:00:00.000Z",
    "end_time": "2026-07-30T23:00:00.000Z",
    "is_equipment_unavailable": true,
    "is_decline_bookings": false,
    "created_at": "2026-07-20T09:15:00.000Z",
    "updated_at": "2026-07-20T09:15:00.000Z"
  },
  "errors": []
}
```

No GraphQL structures or internal fields (for example `read_by`, `close_by` or `request_ids`) are exposed. For a `general` announcement, `equipment_ids`, `start_time` and `end_time` are returned as empty or null values.

**Consequences, matching creation in the UI:**
- The announcement appears in the announcements sidebar for the users in `user_ids`.
- An email is sent to the creator regardless of preferences, and to each recipient who has announcement emails enabled.

---

## Story 3: Create a general announcement

**As a** consumer using the writable API,
**I want** to create a general announcement addressed to selected lab members,
**so that** I can communicate lab-wide information programmatically without using the web interface.

Scenario 1 from the earlier refinement applies here. Use `GET /v1/users/{account_id}` to retrieve candidate recipients.

### Request

`POST /v1/announcements/:account_id`

| Property | Required | Notes |
|---|---|---|
| `announcement_type` | Yes | Must be `general` (or `bookings`, see Story 4). |
| `subject` | Yes | Non-blank, 255 characters or fewer. |
| `message` | Yes | Non-blank, 10,000 characters or fewer. |
| `user_ids` | Yes | 1 to 1,000 distinct ids of active members of the lab. The authenticated user and lab admins are accepted. |
| `start_time`, `end_time` | No | Ignored if sent for a general announcement. |
| `equipment_ids`, `is_equipment_unavailable`, `is_decline_bookings` | Not allowed | See the error handling below. |

### Acceptance criteria

1. A `POST /v1/announcements/:account_id` endpoint exists under the external API versioning structure and creates a `general` announcement.
2. It requires an OAuth token with the new `write_announcements` scope. Requests without it are rejected with `insufficient_scope` (403). The scope is added to the Doorkeeper configuration.
3. Requests without a valid access token receive `401` with a message that a valid access token is required.
4. Only an authenticated user with the `admin` or `instructor` role in the lab can create announcements. Any other role is rejected with `role_not_permitted` (403).
5. The OAuth application must be authorised for the lab. Otherwise the request is rejected with `account_not_authorised` (403).
6. The lab must have the announcements feature. Otherwise the request is rejected with `announcements_not_available` (403).
7. A valid request creates one announcement owned by the authenticated user, with status active, in the lab. It returns `201` with the response shown above.
8. All `user_ids` must be distinct, active members of the lab. Any that are not cause a `422` that lists the offending ids.
9. Creation is subject to the same business rules as the UI.
10. The sidebar and email consequences listed above occur.
11. If `start_time` or `end_time` is sent, it is ignored and not stored.
12. Any violation prevents creation and nothing is saved. The response lists all violations.

### Error handling

| Condition | Response |
|---|---|
| Account not found | `account_not_found` (404) |
| Missing, blank or too-long `subject` or `message` | `422`, with attribute-level errors and the limit in the message |
| `user_ids` missing, empty, over 1,000, or containing non-members or inactive users | `422`, with the offending ids listed |
| `announcement_type` missing or not one of the supported values | `422` |
| Equipment properties sent with `general` | `422`. The message reads "You are attempting to create a general announcement with equipment announcement related property values. Please check your payload and, if creating a general announcement, do not pass values for equipment_ids, is_equipment_unavailable or is_decline_bookings." There is a field-level error per offending property. |
| Unknown properties | `422`, `unsupported_field` |

Every message states the cause and a suggested fix.

### INVEST check

- **Independent:** it is the foundation story.
- **Negotiable:** the limits and recipient rules are agreed.
- **Valuable:** it enables lab-wide communication via the API.
- **Estimable:** it reuses the existing model, policy and notifier.
- **Small:** one type, no equipment logic.
- **Testable:** request specs per criterion.

---

## Story 4: Create an equipment announcement

**As a** consumer using the writable API,
**I want** to create an announcement about selected equipment for a time window, optionally marking the equipment unavailable,
**so that** I can inform users and block bookings when equipment breaks down or is scheduled for repair.

**Depends on Story 3** (endpoint, scope and shared errors).

### Request

`POST /v1/announcements/:account_id` with `announcement_type: "bookings"`

| Property | Required | Notes |
|---|---|---|
| `announcement_type` | Yes | `bookings`. |
| `subject`, `message`, `user_ids` | Yes | Rules as in Story 3. |
| `equipment_ids` | Yes | 1 to 100 distinct ids. Use `GET /v1/equipment?account=…` to retrieve them. |
| `start_time` | Yes | ISO 8601 with time, in UTC (`Z`). |
| `end_time` | Yes | ISO 8601 with time, in UTC (`Z`). It must be after `start_time`. |
| `is_equipment_unavailable` | Yes | `true` or `false`. |
| `is_decline_bookings` | No | If `true`, see Story 5. Until Story 5 ships it is rejected. |

**Recommended workflow:** use Story 1 (`booking_users`) to find users with bookings in the window, or Story 2 (`equipment_access_users`) to find users with access to the equipment. Pass the chosen users as `user_ids`.

### Acceptance criteria

1. Creating an announcement of type `bookings` is supported by the Story 3 endpoint, with the same scope, role, lab and feature checks.
2. All the required properties above must be provided. Times must be UTC with a time component, and only the `Z` suffix is accepted. Offsets such as `+01:00` are rejected with `invalid_time_format`.
3. **The stored times are exactly the UTC instants supplied.** For example, `2026-07-26T23:00:00.000Z` is stored and returned as that instant, whatever the lab's timezone. The existing `Announcement#start_time=` / `end_time=` setters currently reinterpret input as lab-local time, so they must be changed or bypassed for this endpoint without altering how the UI behaves. This is covered by tests for a lab in a non-UTC timezone.
4. `end_time` must be after `start_time`. The window may not exceed **one month**. A start in the past is allowed.
5. Every id in `equipment_ids` must exist, be active, and belong to the lab. Any that don't cause a `422` listing the ids. Ids are not silently dropped, which differs from the UI.
6. An **admin** may announce on any equipment in the lab.
7. An **instructor** may only announce on equipment they manage. If any equipment is not managed by them, the request is rejected with `equipment_not_authorised` (403). The message says "You have tried to create an announcement for equipment you are not an instructor for" and lists the ids.
8. If `is_equipment_unavailable` is `true`, the equipment is blocked for the window as in the UI.
9. The response, emails and sidebar behaviour match Story 3 and the shared conventions.
10. Any violation prevents creation and nothing is saved. When there are several violations, all are returned in the `errors` array.

### Error handling (in addition to Story 3)

| Condition | Response |
|---|---|
| `equipment_ids` missing or empty | `422`, `equipment_ids_required` |
| More than 100 `equipment_ids` | `422`, `too_many_equipment_ids` |
| Equipment not found or not in the lab | `422`, ids listed |
| Instructor does not manage the equipment | `equipment_not_authorised` (403), ids listed |
| Missing, non-UTC or malformed time | `missing_time` / `invalid_time_format` (422) |
| `end_time` not after `start_time` | `422` |
| Window over one month | `window_too_long` (422) |
| `is_equipment_unavailable` missing or not a boolean | `422` |
| `is_decline_bookings: true` | `422`, "Declining bookings is not yet supported." This is removed when Story 5 ships. |

The messages reuse the wording of the available-slots and equipment-training errors where possible.

### INVEST check

- **Independent:** it builds on Story 3 only.
- **Negotiable:** the one-month cap and the strict UTC format are agreed.
- **Valuable:** it supports the breakdown scenario that motivated the work.
- **Estimable:** the model change for times is the main unknown, and it's called out.
- **Small:** one type, no destructive side effects.
- **Testable:** request specs per criterion, including a non-UTC lab.

---

## Story 5: Decline bookings when creating an equipment announcement

**As a** consumer using the writable API,
**I want** to decline the affected users' bookings when I create an equipment announcement,
**so that** bookings on broken equipment are cleared automatically, as they are when an admin does this in the UI.

**Depends on Story 4.**

### Request

The Story 4 request with `is_decline_bookings: true`.

### Acceptance criteria

1. `is_decline_bookings` is accepted for `bookings` announcements. It defaults to `false` if omitted.
2. `is_decline_bookings: true` requires `is_equipment_unavailable: true`. Otherwise the request is rejected with a `422` stating that bookings can only be declined when the equipment is made unavailable.
3. When it is `true`, bookings are declined if they:
   - are on one of the `equipment_ids`;
   - overlap the window from `start_time` to `end_time`;
   - belong to a user in `user_ids`;
   - have a status of booked or requested.
4. Bookings owned by lab admins and by the authenticated user are never declined, even if they are in `user_ids`.
5. Declining happens in the same transaction as creating the announcement. If creation fails, no bookings are changed.
6. Bookings outside the window, on other equipment, or owned by users not in `user_ids` are left unchanged.
7. The announcement email serves as the notification to users, as in the UI.
8. The response reports `is_decline_bookings: true`.
9. The endpoint is documented as irreversible. The documentation recommends previewing affected users with `GET /v1/announcements/:account_id/booking_users`.
10. The same authorisation rules as Story 4 apply: an instructor can decline bookings only on equipment they manage.

### Error handling

| Condition | Response |
|---|---|
| `is_decline_bookings: true` with `is_equipment_unavailable` false or missing | `422` |
| `is_decline_bookings` not a boolean | `422` |
| Any Story 4 violation | As in Story 4, and no bookings are declined |

### INVEST check

- **Independent:** it can be released after Story 4, as a small increment.
- **Negotiable:** the pre-condition on `is_equipment_unavailable` is agreed.
- **Valuable:** it automates the clean-up of bookings.
- **Estimable:** it reuses `Announcement#decline_requests`.
- **Small:** one flag and one side effect.
- **Testable:** specs for declined, untouched and rolled-back bookings.

---

## Open points to confirm

1. `is_equipment_unavailable` is required for `bookings` announcements, while `is_decline_bookings` is optional and defaults to `false`.
2. Should parent equipment ids be accepted for announcements? The single-equipment access endpoint rejects them, but the UI recipient logic resolves parent and child access.
3. Should the response report how many bookings were declined? The UI does not expose this, and it would be a useful field for Story 5.
4. Is "one month" 31 days or a calendar month? This is the same open point as in Stories 1 and 2.
