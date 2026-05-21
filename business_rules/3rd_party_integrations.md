# Third-Party Integrations Business Rules

_Source: Confluence PDF export, especially pages 42-43, 85-95, 100-103, 107-130, 151-156, 307-388._

Use this file for external APIs, OAuth integrations, Outlook/ICS calendars, Customer.io, Intercom, RSpace, eLabNext, Benchling, LabTrack, and Essentim integration behavior. SSO/SAML/Shibboleth are security/authentication integrations and are summarized in `users_and_security.md`.

## Integration principles

- External integrations should be user-authorized unless explicitly documented otherwise.
- Lab data shared with integrations must be scoped to labs the user or admin explicitly authorizes.
- Booking/equipment permissions remain governed by Clustermarket/Calira unless the integration section explicitly says otherwise.
- Integration-created or integration-managed equipment should not silently bypass core equipment, access, booking, and reporting invariants.
- Secrets, client IDs, client secrets, tokens, and refresh tokens must be treated as credentials.

## External REST API / OAuth

API access is managed through OAuth for security.

### Application setup

Users/customers create an OAuth application at:

```text
/oauth/applications/new
```

Required setup questions:

- Which API scopes are needed?
- Can the client keep the client secret confidential?
- Should the application be visible to all platform users?
- What callback URL should be used? If the client only reads API data, this can be any generic URL.

After save, system provides:

- Client ID.
- Client secret.

### Approval rules

- If the customer/partner sets up the application themselves, they can authorize it for their labs.
- If Calira/Clustermarket creates it on their behalf, the application must be approved in Control Room:
  - Control Room -> External API -> Doorkeeper Applications -> Actions -> Approve.

### OAuth URLs

Production URLs from source:

```text
Authorization URL: /oauth/authorize
Access token URL: /oauth/token
```

### Supported documented scopes

- `read_user`
- `read_accounts`
- `read_equipment`
- `read_bookings`

Other API docs also mention `read_projects` testing; do not assume a scope exists without checking current API code/docs.

### Lab authorization

- User must log in and select which labs/accounts the application can access.
- Only selected labs' data flows to the API client.
- If new labs are created later, authorization may need to be repeated depending on integration.

### Token acquisition

- Authorization produces a callback with `code`.
- The code is exchanged for access token and refresh token.
- Tools like Postman or Insomnia can be used for token testing.

### API documentation release process

- API documentation changes are a separate project and do not follow standard release process.
- Documentation deploys directly and becomes immediately available at `apidocs.clustermarket.com`.
- Source repository is `clustermarket-api`.
- QA does not manually test docs changes; QA monitors that deployment occurs.
- API docs should be merged only after standard release of corresponding API changes and QA/developer sync.

## ICS booking files

ICS files let users add booking events to external calendars.

Rule:

```text
if user.notification_settings.equipment_confirmations == enabled:
    include/send ICS files with relevant booking confirmation emails
else:
    user does not receive ICS files
```

Users enable this from Profile menu -> Notifications -> Equipment: Confirmations.

## Microsoft Outlook Calendar integration

Application identity:

- Application name: Calira (Formerly Clustermarket).
- Microsoft identity provider: Microsoft Entra ID / Azure AD.
- API: Microsoft Graph.
- OAuth model: Authorization Code Flow.
- Permissions: Delegated user-level permissions only.
- No application-level / tenant-wide permissions.

### Permission set

| Permission | Type | Reason |
|---|---|---|
| `Calendars.ReadWrite` | Delegated | Required by Microsoft Graph to create/update/delete calendar events. Graph has no write-only calendar permission. |
| `offline_access` | Delegated | Required to refresh tokens and maintain synchronization. |
| `User.Read` | Delegated | Identify signed-in user. |
| `openid` | Delegated | Standards-based OAuth authentication. |
| `profile` | Delegated | Standards-based OAuth authentication. |

### Operational rules

- User explicitly connects their Outlook calendar.
- All Graph calls use `/me/...` endpoints and run as the signed-in user.
- Calira creates calendar events only when a booking is made in Calira.
- Calira stores the Microsoft Graph `eventId` for each event it creates.
- Calira updates/deletes only Calira-created events.
- Calira does not enumerate, list, read, or analyze other calendar events.
- Calira does not access email, contacts, directory data, other users' calendars, or mailbox content.

Graph endpoints used:

- `POST /me/events` to create events.
- `PATCH /me/events/{id}` to update application-created events.
- `DELETE /me/events/{id}` to delete application-created events.
- `POST /$batch` to batch event creation and avoid throttling.

### Token handling

- Access tokens are short-lived.
- Refresh tokens are used only to maintain booking-event sync.
- Tokens are revoked/discarded immediately when the user disconnects.
- If token refresh fails or token is invalid, integration is disabled for that user until re-authentication.
- Only event IDs are stored; not full calendar content.

### Admin consent

Some tenants require an admin to grant consent for delegated permissions.

Admin consent:

- Approves the requested delegated permissions tenant-wide.
- Creates the Enterprise Application / service principal.
- Does **not** sign users in.
- Does **not** bypass tenant OAuth or Conditional Access policies.
- Does **not** grant tenant-wide execution of Graph calls.

Each user must still sign in and obtain a user-scoped token.

## Customer.io

Customer.io is used for:

- Transactional emails sent from the codebase, such as invitations.
- Onboarding emails.
- Newsletters and marketing emails.

Onboarding campaigns documented as live in source:

- `Onboarding - Part 1`: all registered users; prompts login and join/create lab; ends when user joins/creates a lab or receives all emails.
- `Joined a lab`: one-email campaign triggered when user joins a lab.
- `Created a lab`: one-email campaign triggered when user creates a lab; permanent A/B test splits replies between Liza and Morsal.
- `Onboarding - Part 2.1`: lab creators; prompts adding equipment and users.
- `Onboarding - Part 2.2`: users who join a lab; educates on booking equipment.

Technical hooks:

- `config/initializers/customerio.rb` contains configuration and reads Rails credentials.
- `config/initializers/action_mailer.rb` registers Customer.io as custom mail delivery service.
- `lib/mail/cio_delivery.rb` is called on mail delivery.
- Ruby gem: `customerio`.

## Intercom

Intercom replaced Userflow for onboarding tours and guides.

Rules:

- Intercom flows are configured by a third party; internal owner in source is Niklas Friedberg.
- Premium and non-premium users can see different flows/behavior.
- Staging and production behavior can differ.
- Changing Premium status takes effect only after logout/login because session cookies are saved.

Staging behavior from source:

- Non-premium staging users see only `Not premium`; clicking returns a contact-support message and closes conversation. Free-text customer reply is disabled.
- Premium staging users see `Customer support` and `More information`; both return contact-support message and close. If a new message chain is opened without clicking default options, user can free-text message, but no response is returned.
- Production Intercom behavior is marked TBD in source.

## RSpace integration

RSpace is an open-source research data management integration via external API.

Scope:

- Clustermarket sends booking and equipment information to RSpace users who are also Clustermarket users.
- Users can view and insert Clustermarket booking/equipment data as tables in RSpace notebooks.
- Data stored in RSpace includes links back to Clustermarket.
- Integration is only available to RSpace Team or Enterprise instances, but available to all Clustermarket users.

Authorization:

- RSpace must be configured by an RSpace admin and set as Available.
- Clustermarket must authorize the institution's RSpace integration.
- User connects from RSpace Apps page and authenticates with Clustermarket.
- RSpace can view bookings only from labs explicitly authorized by the user.
- Users must repeat authorization if they create new labs and want RSpace access.
- Authorization expires periodically; user must reconnect when prompted.

Data usage:

- RSpace text editor toolbar opens a table of Clustermarket bookings/equipment.
- Booked view shows upcoming bookings.
- Booked and Completed includes completed bookings.
- Booked Equipment shows equipment booked and most recent completed booking.
- Booking IDs and Equipment Names are hyperlinks back to Clustermarket.
- `maintenance only` filter shows maintenance bookings and a `maintenance notes` column sourced from the first maintenance note only.
- Users select rows and insert visible columns into RSpace; inserted table data is editable in RSpace.
- A `notes` column is inserted for RSpace-specific notes.
- Hyperlinks work after RSpace document is saved, not while table is in edit mode.

RSpace equipment form:

- A generic optional form named `RSpace_Equipment_Form` can capture experimental details.
- The Clustermarket data can be inserted into any RSpace document; the form is optional.

## eLabNext integration

### Phase 1: Clustermarket source -> eLabNext

Purpose:

- Send Clustermarket equipment and booking information to eLabNext.
- Replace eLabNext equipment calendars with links/buttons to Clustermarket equipment calendar pages.
- Allow equipment and booking details to be inserted into eLabNext experiment sections.

Connection:

- eLabNext shows `Connect to Clustermarket` in Configuration -> Equipment.
- User selects which Clustermarket labs should connect.

eLabNext surfaces after connection:

- Inventory equipment details show Reservations section linking to Clustermarket equipment calendar.
- Equipment info page calendar is replaced by call-to-action to Clustermarket calendar.
- Configuration -> Equipment table includes Calendar column with `Book equipment` link.
- Add Equipment button links to Clustermarket Add Equipment modal.
- Refresh button manually syncs equipment lists.
- Journal experiment sections can add `Clustermarket` -> `Equipment details` or `Booking details` sections.

Field mapping:

| eLabNext | Clustermarket |
|---|---|
| Equipment Name | `assets.name` |
| Equipment Type | `assets.sub_category_id` |
| Description | `assets.description` |
| Equipment Status | `assets.availability_status` |
| Manager / Contact person | `assets.contact_access_role_id` |
| Manufacturer | `assets.manufacturer` |
| Model | `assets.model_number` |
| Room | `assets.room` |

Sync notes:

- Source considers manual sync for both equipment and bookings acceptable.
- Automatic booking sync back to originating experiment section was marked not valid anymore.

### Phase 2: eLabNext source -> Clustermarket

Purpose:

- Allow eLabNext to be source of truth for equipment while Clustermarket remains scheduling system.
- eLabNext `Push` creates/updates equipment in Clustermarket.
- API work should be reusable for equipment imports from other systems, not eLab-specific only.

Required fields for creating/updating equipment in Clustermarket:

- Equipment Name.
- Equipment Type: eLab does not have this in same way; default every incoming item to `Equipment` category/type as described.
- Equipment Subtype: eLab's Equipment Type.
- Manufacturer.
- Model.

Validation and update rules:

- Manufacturer and Model from eLab should be validated against Clustermarket dropdowns where possible.
- If no match, assets should be flagged for manual review.
- Only equipment created via the API should be updated via the API.
- Equipment can still be created directly in Clustermarket; then some equipment may be synced and some not.
- eLab does not provide groups, training, or maintenance; lab manager must add those on Clustermarket.
- Only eLabNext admins can push equipment info to Clustermarket.
- When eLab sends equipment to CM, creator is any admin in the lab, preferably lab creator; if no longer present, choose another admin randomly.

### Bayer iteration / bidirectional plugin behavior

Connection:

- Existing older plugin installations can continue unchanged.
- Upgrading requires reconnecting because new flow uses two-way authentication.
- New/upgraded installations show `Connect to Clustermarket`.
- Step 1 authorizes eLab API to access Clustermarket API.
- Step 2 authorizes Clustermarket API to access eLab API.
- Users can authorize only one laboratory per plugin installation.

Source-of-truth modes:

- `eLab is the source of truth for your equipment` (default after install/upgrade).
- `Clustermarket is the source of truth for equipment information`.
- `Equipment can be created on both eLabNext and Clustermarket`.

When eLab is source of truth:

- Equipment page shows `Push to` button.
- Pressing schedules a bulk download job from eLab API to linked Clustermarket lab.
- Only equipment with all four mandatory Clustermarket fields is recorded: Name, Type, Manufacturer, Model.
- Closing the modal cancels; clicking OK schedules the job.
- eLab create/edit requires Name, Type, Manufacturer, Model; missing values warn and block save.
- Manufacturer and Model meta fields are added automatically to eLab form by plugin.
- Model field appears on eLab Add Equipment only when plugin is configured with eLab as source of truth.

Clustermarket UI for eLab-synced equipment:

- eLab icon appears next to equipment name in Equipment Overview and Equipment Details.
- Fields managed by eLab are disabled in Clustermarket edit modal.
- Disclaimer states equipment is managed via eLab and changes must be made from eLab.
- eLab equipment type free text is stored in a separate column from Clustermarket controlled equipment type.
- If eLab type is `Centrifuge`, Clustermarket edit modal pre-fills with that value even if not in CM list.
- Saving equipment on eLab automatically schedules transfer/update to Clustermarket.

## Benchling integration

Purpose:

- Surface Clustermarket equipment data and booking calendar links in Benchling.
- Use Benchling entity linking so equipment can be referenced in Registry, Notebook entries, Results, and Workflows.
- Keep Clustermarket as source of truth for equipment and bookings.
- Automatically sync equipment data to Benchling when equipment is added, edited, or deleted in Clustermarket.

### Setup requirements

Customer requirements:

- Clustermarket Enterprise account.
- Benchling Notebook and Registry licenses; Workflows if using workflow features.
- Benchling Tenant Admin.
- Clustermarket Admin; if sharing multiple labs under an organization, Organization Admin is required.
- Admin access to Benchling Registry.

Benchling tenant features that must be enabled:

- Benchling apps.
- Global apps.
- App interactivity.
- Developer console.

If accessing the app URL returns 404, first check Tenant Admin login and developer console/application access.

### Benchling schema requirements

Create Equipment entity schema:

- Prefix: `EQ`.
- Name: `Equipment`.
- Entity type: Custom Entity.
- No constraints.
- Containable type: None.
- Available registration naming options: first three boxes ticked.

Required entity fields:

1. Name.
2. Equipment type.
3. Manufacturer.
4. Model.
5. Description.
6. Contact person.
7. Last maintenance date.
8. Calendar.

All 8 fields should be marked required.

Access policies:

- Add `Clustermarket equipment data and scheduling app` as Admin on the schema.
- Add app to General permissions/collaborators list with Admin rights.
- Configure the app by selecting the Equipment schema and mapping app fields.

### Linking Clustermarket to Benchling

Flow:

1. In Clustermarket, navigate to Integrations at lab/organization level.
2. Select Benchling integration.
3. Click connect.
4. Choose `I already have the Clustermarket app and schema set up`.
5. Select labs to share equipment data from.
6. Copy generated unique identifier code.
7. Paste code into Benchling app configuration `unique_identifier`.
8. Submit/activate app in Benchling.
9. Return to Clustermarket and click Connect.
10. Automated flow sends selected labs' equipment data to Benchling and creates each equipment item as Registry Entity.

### Usage rules

- Equipment is searchable in Benchling Registry.
- If multiple labs are shared, equipment search results show lab name in brackets so users can distinguish same-named equipment.
- Equipment Registry record includes booking calendar link.
- Clicking Calendar opens Clustermarket login/site; once logged in, user sees equipment booking calendar.
- Equipment can be referenced in Notebook text using `@equipment name`.
- Equipment can populate Notebook tables, sub-templates, Workflow schemas, Lookup tables, and Worklists.
- Maintenance/calibration data auto-updates when event occurs in Clustermarket, but tables need refresh; Benchling shows change indicators.

Critical permission rule:

```text
Benchling reference/access != Clustermarket booking permission
```

All access and booking permissions continue to be managed in Clustermarket. A Benchling user who sees or references equipment cannot book it unless they have Clustermarket permission.

### Removing integration

When the integration is removed:

- Calira runs a soft archive.
- Equipment data remains in Benchling tenant.
- Users can no longer add new equipment through the integration or book equipment from Benchling to Clustermarket.

### Parent equipment export

Parent equipment is supported in Benchling export/sync:

- Exports same data points as other equipment: name, equipment type, manufacturer, model, description, contact person, maintenance date, booking link, serial number, document URL.
- Sync cross-checks by Serial Number and updates/imports depending on user selection.
- Exported Equipment Type appends `(Parent)` only when category is Parent Equipment and an equipment type value is present.
- If equipment type is empty and category fallback is used, `(Parent)` is not appended.
- `Last Maintenance` for parent is latest maintenance booking among all children.

## LabTrack desktop app

LabTrack is Calira/Clustermarket's Windows desktop app for locking instruments and real-time utilization capture. It integrates with the browser app's bookings/access rules.

Compatibility:

- Windows XP or later for older versions; silent install section applies to Windows 10/11 for v0.3.0.
- One LabTrack installation is associated with one instrument in one lab account.
- Lab timezone must match computer timezone.

Modes:

### Track only

- Does not restrict equipment access based on booking existence.
- Any user with access to the instrument can log in and use it.
- Walk-ins are permitted.
- Sessions are tracked in `asset_free_trackings`.
- From version 0.2.8, admin can configure default session length without booking.
- If enabled, non-admin free sessions auto-logout at configured length.
- Reminder appears shortly before timeout and user can extend.
- Admin users are never auto-logged out.

### Block and Track

- Enabled by `Require users to book in advance? = Yes`.
- User must have a booking to log in and use instrument.
- Admin can configure how early before booking start login is allowed.
- Actual usage is stored with booking in `asset_requests.actual_start_time` and `asset_requests.actual_end_time`.
- Non-admin booking sessions can auto-logout when booking slot ends plus optional grace interval.
- Admin booking sessions do not auto-logout.

Business use cases:

- Compare booked vs actual usage.
- Force bookings for instruments.
- Lock untrained/no-access users out of controlled instruments.

Settings:

- Lab and Equipment selection.
- Admin PIN.
- Launch on system startup: yes/no; default no.
- Require booking in advance: yes/no; default yes.
- Early login window before booking start.
- Auto-end booking session when slot ends.
- Grace interval after booking end.
- Default session length without booking when booking is not required.

Reporting:

- If report source is `LabTrack`, show only asset-free tracking records.
- Booking-based actual start/end times appear in Equipment booking reports.

Silent install/uninstall from v0.3.0:

- Silent mode is opt-in via explicit flags; otherwise UI runs.
- Installation mode and uninstallation mode are independent.
- Silent install command uses `silent=1 --verbose`.
- Silent uninstall requires `silentUninstall=1` passed to `maintenancetool.exe --uninstall` from installation directory.
- Administrator privileges required.

## Essentim integration

Source content is limited to API docs link, meeting notes, and draft requirements.

Documented sensor/state behavior:

- UI must support both Eppendorf and Essentim sensors.
- Eppendorf states remain: Running, Paused, Unavailable, Idle, Error.
- Essentim sensors are divided into Running and Offline.
- Hide sections where there are no sensors.
- Metric states:
  - Info states are not errors and are not shown as errors.
  - Warning states show as Warning.
  - Error/Alert both show as Error; system does not differentiate Error vs Alert.
- Each sensor has an aggregate error/severity from OEM; Calira does not compute aggregate error.
- Need icons for each metric type plus Unknown and Generic.
- Future phase items include historical error events and historical metric values/graphs.
