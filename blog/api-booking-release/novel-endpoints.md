# Novel endpoints: booking write API release

**Source compared:** `app-clustermarket` branch `feature/post-mvp-booking-api` (diffed against `origin/main` at `a72c2cea9`) vs. the published docs at https://apidocs.clustermarket.com/ (OpenAPI v0.1.6).

**Base URL:** `https://api.clustermarket.com/v1` (staging: `https://api.clustermarket.dev/v1`)

## How "novel" was decided

- An endpoint counts as novel if it is **not in the published docs**, or if it is in the docs only as the **"Upcoming" beta** and the branch substantially expands it (POST/PATCH `/bookings`, per your guidance).
- **Exception (as requested):** POST/PATCH `/equipment` are included even though they are already documented.
- Endpoints that exist in code but are neither new on this branch nor documented were **excluded**. They look like internal/desktop-app plumbing: pin codes, `validate_pin`, free tracking start/end, `tracking_sync`, integration `upsert`/`bulk_upsert`, `desktop_app/version_check`, and `user/pin_code`.

## Novel endpoints

### Booking write endpoints (scope: `write_bookings`)

| # | Method & path | What it does | Status vs docs |
|---|---|---|---|
| 1 | `POST /bookings` | Create a booking: use or maintenance, recurring, on behalf of another user, with participants, projects/funding codes and add-ons | Beta in docs ("Upcoming", basic). Substantially expanded |
| 2 | `PATCH /bookings/{id}` | Update times, maintenance details, participants, projects/funding codes and add-ons | Beta in docs ("Upcoming", basic). Substantially expanded |
| 3 | `POST /booking/notes/{booking_id}` | Add a note (text plus optional file) to a booking | New, undocumented |
| 4 | `PATCH /booking/notes/{note_id}` | Replace a note's text and/or attach an additional file | New, undocumented |

### Supporting read endpoints

| # | Method & path | Scope | What it does |
|---|---|---|---|
| 5 | `GET /equipment_available_slots/{equipment_id}?start_time=…&end_time=…` | `write_bookings` | Free time slots on an instrument within a window of up to 2 weeks (UTC) |
| 6 | `GET /equipment/{id}/booking_add_ons` | `write_bookings` | Add-ons that apply to *this user* when booking, including mandatory flags and pricing |
| 7 | `GET /equipment/{id}/users` | `read_users` (new) | Lab members with access to the instrument, used to pick group-booking participants |
| 8 | `GET /users/{account_id}` | `read_users` (new) | Paginated list of active lab members (admins and instructors only) |

### Equipment write endpoints (included by exception)

| # | Method & path | Scope | Notes |
|---|---|---|---|
| 9 | `POST /equipment` | `write_equipment` | Already documented; included per brief |
| 10 | `PATCH /equipment/{id}` | `write_equipment` | Already documented; included per brief |

(Supporting pieces already in the docs: `GET /equipment/contact_people` and `POST /uploads`.)

## Changes to existing endpoints (not novel, but worth a mention)

- **New OAuth scope `read_users`**, added to Doorkeeper for endpoints 7 and 8.
- **`POST /uploads`** accepts a new `purpose: booking_note` (PDF, Word, Excel, ODS, ZIP/RAR and images; max 20 MB) for attaching files to notes.
- **`GET /bookings/{id}`** now returns `maintenance_provider` and `maintenance_type`.
- **`GET /bookings`** (list) now returns `created_at`, `maintenance_provider` and `maintenance_type`.
- **`GET /equipment/{id}`** now returns `custom_addons` in the same shape that POST/PATCH `/equipment` accept, so add-on config can be read, edited and written back.
- **Booking edit permissions tightened (web app too):** a booking owner's edit rights now depend only on the lab's intra-edit rules. Previously an owner who also had general create rights could edit regardless (`app/policies/asset_request_policy.rb`).

## Capability detail (source of truth for the blog)

**POST /bookings**
- Required: `equipment_id`, `start_time`, `end_time`. Times are ISO 8601 with offset or `Z`, on 15-minute boundaries, with no seconds.
- `booking_type`: `use` (default) or `maintenance`. Maintenance requires `maintenance_provider` (`internal`/`external`) and `maintenance_type` (`preventative_maintenance`, `cleaning`, `calibration`, `breakdown`, `repair`, `other`).
- `account_id`: the booking lab. Bookings can be made from a lab onto externally available equipment in the same organisation.
- `booking_on_behalf_of`: user ID. Admins and instructors of the equipment only; the target must be an active user with access.
- `invited_users: [{user_id}]` (group booking): requires the lab "Multiple users per booking" setting and a supporting subscription. Researchers and students also need their access group to allow it; guests can't invite. Invitees must be lab members with equipment access (admins/instructors skip the access check). Not allowed on maintenance bookings.
- `recurrence`: `recurrence_type` is `daily`, `weekly`, `monthly_absolute`, `monthly_relative` or `yearly`, with `recurrence_interval` (≥1) and `recurrence_end` (date or datetime). Optional: `recurrence_days` (weekly), `recurrence_date` (monthly_absolute; must match the start day) and `recurrence_action` (`skip_conflict` default; `overlap_existing`/`decline_existing` are admin/instructor only). Monthly-relative on the 5th ("last") weekday is not supported.
- `projects: [{project_id, funding_codes: [{funding_code_id, funding_code_percentage}]}]`: lab projects only (not personal). Percentages must total 0 or 100. The project must be valid for the booking owner, though admins booking on behalf can override this. The lab must have projects enabled.
- `add_ons: [{equipment_addon, quantity}]`: the client sends only the name (plus quantity for user-specified add-ons). Price, unit and mandatory flag come from the equipment. Missing mandatory add-ons are rejected. Quantity must be 0–999,999,999. Not allowed on maintenance bookings.
- The same business rules as the web app apply: overlaps, usage limits, min/max duration, advance notice, business hours and approval workflow. The response message says whether the booking was **confirmed** or is **pending approval**. Notifications are sent as they are in the UI.
- Response returns the full booking: equipment, account, creator vs booking owner, status, participants, projects with funding codes, recurrence and priced add-ons.

**PATCH /bookings/{id}**
- Updatable: `start_time`, `end_time`, `maintenance_provider`/`maintenance_type` (maintenance bookings only), `invited_users` (an empty array clears them; participants can't be added after a booking has ended), `projects` (omit to keep, empty array to clear) and `add_ons`.
- Not updatable: `equipment_id`, `account_id`, `booking_type`, `recurrence`.
- Triggers the usual update notifications, including to invitees when the time changes and to users removed from the booking. Removed users' Outlook events are deleted.

**Booking notes**
- Body: `{ "booking_note": { "note_text": "...", "note_file_signed_id": "..." } }`. The file is uploaded first via `POST /uploads` with `purpose: booking_note`.
- Allowed for the booking owner or the equipment's provider (admin/instructor).
- Limits: 20 MB per file and 10 attachments per booking.
- Update replaces the text wholesale. A file on update is *added*; existing files are never replaced.
- Triggers `new_booking_note`/`note_updated` notifications and **syncs to the Outlook event**.

**Available slots**
- Max window 2 weeks. UTC required (`Z` or `+00:00`). Non-admins can't query the past.
- A slot counts as free when there are no requested, approved, booked, in-progress or completed bookings and no "equipment unavailable" announcements. Adjacent busy periods are merged.
- ⚠ It does **not** apply per-user booking rules (business hours, min/max duration, advance notice, usage limits). A "free" slot can still be rejected by POST `/bookings` with a 403 business-rule error.
- Also works for users in *sibling labs of the same organisation* when the equipment is externally available.

**Booking add-ons preflight:** returns `equipment_addon`, `base_unit`, `base_quantity`, `base_price` and `mandatory`, all resolved for the calling user (first-booking/always/optional rules and admin overrides).

**Equipment users:** admin/instructor/researcher/student. Researchers and students need the lab group-booking setting enabled; guests are refused. Returns `user_id`, `account_id`, `role`, `name` and `email`. Parent equipment is refused.

**Lab members:** admin/instructor only (inherited org/department roles count). Paginated, and excludes users with revoked access and users who only inherit access from a parent org/department.

## Things to flag to engineering before publishing

1. Some error copy says `write_booking` (singular) but the scope is `write_bookings`. See `config/locales/external_api/en.yml` (`available_slots.insufficient_scope`, `booking_add_ons.insufficient_access`, `bookings.insufficient_access`).
2. The booking-note file-type error lists "PDF, DOCX, XLSX, PNG, or JPEG", but the accepted list is broader (DOC, XLS, ODS, ZIP, RAR…).
3. The note paths use singular `/booking/notes/...` while everything else uses `/bookings/...`. Confirm this is the final shape before it's in a public blog.
4. The available-slots and add-ons read endpoints require `write_bookings` rather than a read scope. This is intentional (they are booking helpers), but the docs should say so.
5. Typos in user-facing copy: "not permitted to booking on behalf", "enhacement".
