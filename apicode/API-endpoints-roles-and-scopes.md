# Calira REST API: customer-facing endpoints, roles and scopes

Source: `app-clustermarket`, branch `feature/post-mvp-booking-api` (latest pull, commit 8fa9b8985). Customer-facing endpoints only (31 rows). Internal and device endpoints (PIN codes, free tracking, desktop app version check, integration upserts) are excluded.
Ordered by path, then action. Every path is under `/v1`.

**Applies to every row (not repeated below):** the OAuth application must be **approved by Calira**, and the user must have **authorised the relevant lab** for that application. Where a row says "any role", that is the only requirement.

**Role terms:**
- **Lab admin** = an `admin` role on the lab, or on its department or organisation.
- **Assigned instructor** = an `instructor` who has been assigned that piece of equipment.
- **Access-group member** = a user whose access group includes that piece of equipment.

| Endpoint | Roles allowed | Scope(s) required |
|---|---|---|
| `GET /accounts` | Any role (lists the labs, departments and organisations the user has authorised) | `read_accounts` |
| `GET /accounts/{id}` | Any role in that lab (or in a lab below that department or organisation) | `read_accounts` |
| `GET /accounts/{account_id}/projects` | Any role (no role check beyond the lab being authorised) | `read_projects` |
| `GET /accounts/{account_id}/projects/{id}` | Any role (no role check beyond the lab being authorised) | `read_projects` |
| `GET /booking/notes/{booking_id}` | The booking's requester, a participant invited to the booking, or the equipment's provider (lab admin or assigned instructor) | `read_bookings` |
| `POST /booking/notes/{booking_id}` | The booking's requester, or the equipment's provider (lab admin or assigned instructor) | `write_bookings` |
| `PATCH /booking/notes/{note_id}` | The note's author, or a lab admin of the equipment's lab. Other users, including instructors who did not write the note, are refused | `write_bookings` |
| `GET /bookings` | Any role. Results depend on role: lab admin sees all bookings in the lab; instructor sees bookings on equipment they manage or have group access to; other roles see bookings on equipment they have group access to; everyone also sees their own bookings | `read_bookings` |
| `POST /bookings` | admin, instructor, researcher or student (not guest). Lab admins can book any equipment in the lab; an instructor books equipment they are assigned to; researchers and students need access to the equipment through an access group. **Maintenance bookings**, **booking on behalf of another user** and **recurring-booking overrides** are limited to the equipment's provider (lab admin or assigned instructor). Maintenance bookings also need the lab's *maintenance bookings* paid feature. Booking rules (clashes, limits, notice) apply on top | `write_bookings` |
| `POST /bookings/search` | admin, instructor, researcher, student or guest (users with only another role are refused). Visibility: lab admin sees all bookings in the lab; instructor sees bookings on equipment they manage, plus their own and ones they are invited to; researcher, student and guest see their own and ones they are invited to | `read_bookings` |
| `GET /bookings/{id}` | The booking's requester; a lab admin; an instructor who manages or has group access to the equipment; or another role with group access to the equipment | `read_bookings` |
| `PATCH /bookings/{id}` | The booking's requester (where the booking is editable by them), or the equipment's provider (lab admin or assigned instructor) | `write_bookings` |
| `POST /bookings/{id}/invitation` | Only the user who was invited to that booking (any role) | `write_bookings` |
| `GET /custom_form_responses/{id}` | The user who submitted the form, a lab admin of the providing lab, or an assigned instructor for that equipment | `read_bookings` |
| `GET /equipment` | Any role. Results depend on role: lab admin sees all equipment in the lab; instructor sees equipment they manage or have group access to; other roles see equipment in their access groups | `read_equipment` |
| `POST /equipment` | Lab admin only | `write_equipment` |
| `GET /equipment/contact_people` | Without `equipment_id`: lab admin. With `equipment_id`: lab admin or assigned instructor | `write_equipment` (a write scope, even though this call only reads) |
| `GET /equipment/{id}` | Lab admin or any instructor in the lab (all equipment); other roles via an access group, or while they hold a confirmed booking starting within the hour or in progress | `read_equipment` |
| `PATCH /equipment/{id}` | Lab admin, or an assigned instructor for that equipment | `write_equipment` |
| `GET /equipment/{id}/booking_add_ons` | Anyone who can see the equipment (as for `GET /equipment/{id}`), or, if the equipment is externally available, a user from another lab in the same organisation | `write_bookings` (a write scope, even though this call only reads) |
| `GET /equipment/{id}/bookings` | Anyone who can see the equipment (as for `GET /equipment/{id}`). Returns all bookings on that equipment | `read_equipment` **and** `read_bookings` (both required) |
| `GET /equipment/{id}/user_trainings` | Anyone who can see the equipment (as for `GET /equipment/{id}`) | `read_equipment` |
| `GET /equipment/{id}/users` | Lab admin or instructor. Researchers and students only if they have access to the equipment, the lab has group booking enabled and their group allows multiple guests to book. Guests are never allowed. Equipment must be active and not a parent item | `read_users` |
| `GET /equipment_available_slots/{equipment_id}` | Anyone who can see the equipment (as for `GET /equipment/{id}`), or, if the equipment is externally available, a user from another lab in the same organisation | `write_bookings` (a write scope, even though this call only reads) |
| `POST /equipment_training/{user_id}` | Lab admin, or an instructor assigned to every piece of equipment in the request. The lab must have user training enabled and the trained user must be a member of the lab | `write_equipment` |
| `DELETE /equipment_training/{user_id}` | Same as `POST /equipment_training/{user_id}` | `write_equipment` |
| `GET /groups` | admin or instructor (of the labs returned) | `read_accounts` |
| `GET /groups/{id}` | admin or instructor of that group's lab | `read_accounts` |
| `POST /uploads` | Any role (no role check; the file is tied to the registering user and application) | `write_equipment` **or** `write_bookings` (either one is enough) |
| `GET /user` | Any role | `read_user` |
| `GET /users/{account_id}` | admin or instructor of that lab (`account_id` is a lab ID, not a user ID) | `read_users` |

## Notes and caveats

- **Booking notes IDs:** `GET /booking/notes/{booking_id}` and `POST /booking/notes/{booking_id}` take a **booking** ID. `PATCH /booking/notes/{note_id}` takes a **note** ID. They share one URL pattern.
- **Only DELETE in the API:** `DELETE /equipment_training/{user_id}`. There is no DELETE for bookings or equipment.
- **Write scopes on read calls:** `booking_add_ons`, `equipment_available_slots` and `equipment/contact_people` use a `write_...` scope even though they only read, so a read-only application cannot call them.
- **`accountant` role:** it exists in the code and counts as having lab access in listings, but it cannot book, search bookings, or manage equipment through the API.
- **Equipment list vs equipment detail:** `GET /equipment` shows an instructor only equipment they manage or have group access to, but `GET /equipment/{id}` lets any instructor in the lab open any equipment in that lab.
- **Special-purpose applications:** Calira's own internal applications are trusted across all of a user's labs and skip the "lab authorised" check. This does not apply to customer applications.
- **Confidence:** this is a read of the code, not a test against a running system. Least certain rows: `GET /bookings` (for roles other than admin and instructor, which comes from SQL filtering), `POST /bookings` (many further business rules apply that are not role-based), and the "same organisation, externally available" route for `booking_add_ons` and `equipment_available_slots`.
