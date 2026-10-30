# Calira API: what's new in version 0.2.0

This page summarises the changes between version 0.1.6 and version 0.2.0 of the Calira (formerly Clustermarket) API. The full reference is in `calira-api-docs-0.2.0.html`, and the machine-readable specification is in `openapi.json`.

Endpoints marked **upcoming** are not yet publicly released. They are documented for early access and testing, and may change without notice. Contact [support@calira.co](mailto:support@calira.co) for early access.

## Version 0.2.0

**New endpoints**

| Endpoint | Description |
|----------|-------------|
| `GET /users/{account_id}` | List the active members of a lab |
| `GET /equipment/{id}/users` | List the users who have access to a piece of equipment |
| `GET /equipment/{id}/user_trainings` | List the users trained on, or who have requested training on, a piece of equipment |
| `GET /equipment/{id}/booking_add_ons` | List the add-ons available when booking a piece of equipment |
| `GET /equipment_available_slots/{equipment_id}` | List the free time slots for a piece of equipment |
| `POST /bookings/search` | Search bookings with filters |
| `GET /booking/notes/{id}` | List the notes on a booking |
| `POST /booking/notes/{id}` | Add a note to a booking (upcoming) |
| `PATCH /booking/notes/{id}` | Update a booking note (upcoming) |
| `POST /equipment_training/{user_id}` | Record equipment training for a user (upcoming) |
| `DELETE /equipment_training/{user_id}` | Remove equipment training for a user (upcoming) |

**Changes to existing endpoints**

- `POST /bookings` accepts `booking_on_behalf_of`, `invited_users`, `projects`, `recurrence` and `add_ons`, and returns the booking owner, participants, projects, recurrence and add-ons in the response (upcoming).
- `PATCH /bookings/{id}` accepts `invited_users`, `projects` and `add_ons` (upcoming).
- `GET /bookings`, `GET /bookings/{id}` and `GET /equipment/{id}/bookings` return the booking `start_time` and `end_time` (the documented `local_start_time` and `local_end_time` names were incorrect). Booking details now include `invited_users`, `recurrence`, `maintenance_provider`, `maintenance_type`, `last_public_note` and structured `add_ons`. List items now include `requested_at`, `updated_at`, `maintenance_provider` and `maintenance_type`.
- `GET /equipment` returns `category` and `subcategory` (a string), and `parent_equipment` for child equipment, in place of the documented `sub_category`, `parent_id` and `parent_name`.
- `GET /equipment/{id}` returns `model_number` (previously documented as `model`) and now documents `subcategory`, `serial_number`, `manufacturing_year` and `custom_addons`.
- `POST /uploads` accepts `purpose: "booking_note"`, for files attached to booking notes (PDF, DOCX, XLSX, PNG or JPEG, up to 20 MB).
- A new OAuth scope, `read_users`, is required for the user endpoints. The descriptions of `write_bookings` and `write_equipment` have been extended.
- The write rate limit table lists the new write endpoints. The limit is unchanged at 30 requests per minute per IP address, per endpoint path.

## Upgrading

- **Booking fields.** If you read `local_start_time` or `local_end_time` from the previous documentation, use `start_time` and `end_time`. These are the names the API has always returned.
- **Equipment fields.** Use `category` and `subcategory` (a string), and `parent_equipment` for child equipment. Use `model_number` on equipment details.
- **New scope.** To use the user endpoints, request the `read_users` scope when you authorise your application.
- **Rate limits.** Write requests (`POST`, `PATCH`, `PUT`, `DELETE`) are limited to 30 requests per minute per IP address, per endpoint path. This now includes the new write endpoints.
