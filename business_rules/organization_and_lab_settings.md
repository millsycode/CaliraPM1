# Organization and Lab Settings Business Rules

_Source: Confluence PDF export, especially pages 39-41, 78-84, 104-106, 134-150, 157-169, 238-246, 280-290._

Use this file for organization/department/lab hierarchy, lab settings, feature flags, projects, funding codes, services config, marketplace/payment settings, and operational admin surfaces.

## Organization / Department / Lab hierarchy

### Definitions

- A **Lab** is the core workspace/account: a group of users, equipment, and optionally services that work together.
- A Lab can represent one physical lab or a larger physical grouping such as a building/floor set.
- An **Organization** is a group of Labs, usually a university or company.
- A **Department** is an optional grouping between Organization and Lab, used by larger organizations to segment labs by area/responsibility.

Hierarchy:

```text
Organization
  Department(s) [optional]
    Lab(s)
```

or

```text
Organization
  Lab(s)
```

or standalone:

```text
Lab
```

### Organization Admin permissions

Organization Admins can:

- Manage equipment, services, and users in all labs under the organization.
- Add/edit/delete equipment and services.
- Move equipment/services between labs.
- Add/edit/delete contracts used in Marketplace.
- Run reports across all labs under organization.
- Enforce SSO for all departments and labs via Advanced Settings.
- Add/edit/delete departments through Settings -> Departments.
- Add/edit/delete labs through Settings -> Labs.

### Department Admin permissions

Department Admins can:

- Manage equipment, services, and users in all labs under the department.
- Add/edit/delete equipment and services.
- Move equipment/services between labs in the department.
- Run reports across all labs under the department.
- Enforce SSO for all labs under the department via Advanced Settings.
- Add/edit/delete labs through Settings -> Labs.

## Lab Settings

Lab Settings are available only to Lab Admins, Department Admins, and Organization Admins.

### General tab

Fields:

- Lab name: mandatory free text.
- Website: optional free text.
- Description: optional free text.
- Street: mandatory free text.
- City: mandatory free text.
- Postal code: mandatory free text.
- Country: mandatory dropdown.
- Time zone: mandatory dropdown.
- `Make lab discoverable to all Clustermarket users`: if on, users without lab invitation can search/find lab and request to join.
- `Delete` button: only place in app that deletes a lab; requires confirmation by typing lab name exactly.

Critical timezone invariant:

```text
lab.time_zone is required for calendars and booking validations
```

### Advanced tab

Advanced settings include:

- `Single Sign-On: require users to use SSO in order to access this lab?`
  - Forces new lab users to log in using SSO.
  - Can be inherited/disabled by organization/department SSO enforcement.
- `Services`
  - On: Services and Orders shown to everyone in lab.
  - Off: Services/Orders hidden for lab.
- `Training`
  - On: Training features visible.
  - Off: Training features hidden.
- `Projects`
  - On: bookings can be linked to projects.
  - Off: bookings cannot be linked to projects.
- `End booking early`
  - On: users can end bookings early to free equipment availability.
- `Booking Reminders`
  - Dropdown setting for reminder emails before booking starts.
- `Maintenance for researchers`
  - On: researchers can choose maintenance booking type, provider, and maintenance type when making a booking.
- `Multiple users per booking` / Group Bookings
  - Source describes a Settings -> Advanced toggle that enables Group Bookings in the lab.

## Projects

Clustermarket has two project concepts:

### Lab Projects

- Accessed from sidebar under Projects.
- Shared within a lab.
- Users and funding codes can be added.
- Admins can enable/disable whether users may use their own projects using `Allow users to use their own projects?`.

### My Projects

- Accessed from Home page Projects tab.
- Personal projects belonging to individual users.
- Not shared with the lab unless lab admin setting allows use.
- Also lists lab projects assigned to or created by the user.

### Managing projects

- Users can view lab projects assigned to them or created by them in My Projects.
- Users can edit/delete lab projects only through Lab Projects UI.
- Personal projects can be edited from My Projects.

### Project visibility in booking modal

Admin booking for self:

- Can always see both Lab Projects and My Projects regardless of settings.

Admin booking for someone else:

- Can see only projects available to the person they are booking for.
- Cannot see that user's personal projects.
- Cannot see projects from other labs when booking; those are visible only in My Projects page.

Non-admin users:

- Can see only Lab Projects assigned to them for the lab where the equipment is being booked.
- Can see personal My Projects only if lab admin enabled `Allow users to use their own projects?`.

Editing bookings:

- Admin can edit a booking to associate it with another lab project or the same personal project.
- Admin cannot see any other personal projects of the user.

Edge case:

- If Project is mandatory but user is not part of any project and has no own projects, Project field is hidden in create booking modal. Source notes this needs improvement.

## Funding codes

Funding codes are financial identifiers tied to projects within a lab and used to allocate booking costs.

### Funding code types

Documented types:

- Research Council.
- Charity.

Other booking-rule text also references a `none` source. Check current enum before changing logic.

### Funding code behavior

- Funding codes are created under projects.
- Funding codes display under Projects section in booking modal after project selection.
- Costs and percentages are calculated dynamically from booking cost.
- Users can split cost across multiple funding codes.
- A summary section displays funding code, type, percentage, and calculated cost.

### Funding code validations

Rules:

- All selected funding codes must be of the same funding type/source.
- Total percentage must be either 100% or 0%.
- Expired funding codes are not displayed in booking workflow.
- If a selected project has one expired and one active code, show only active code and an info message.
- If selected project has only expired codes, show no funding code and info message.

Error/info messages:

- `All of the selected funding codes must be of the same funding type.`
- `Funding code coverage must amount to exactly 100%`
- `Some of the projects/funding codes are not shown because they would have expired by the start time of the bookings selected.`
- `Funding codes under selected project will be expired by the start time of the booking. Please edit the booking or select another project.`

Example calculation:

```text
booking_cost = 12300
funding_codes = [50%, 50%]
code_1_cost = 6150
code_2_cost = 6150
```

## Booking reminders lab setting

Availability:

- Trial, Premium, Enterprise bundles.
- Not available for Core.
- Lab accounts only, not Organization/Department accounts.

Config path:

```text
Lab Settings -> Advanced Settings -> Booking Reminders
```

Options:

- Off (default).
- 1 Hour Before.
- 1 Day Before.
- 2 Days Before.
- 1 Week Before.

Behavior:

- Save triggers backend call and toast on success.
- Once enabled, reminders are sent for new and existing future bookings.
- If reminder period is greater than time left before booking start, no reminder is sent.
- Only approved bookings receive reminders.
- Internal lab bookings only.
- Includes recurring and maintenance bookings.
- Users cannot unsubscribe.
- Same email template for all roles.

## Maintenance for Researchers lab setting

Availability:

- Premium and Enterprise bundles.
- Managed by Admins.
- Default off.
- Locked for Core labs; downgrade disables setting but existing maintenance bookings remain unaffected.

When enabled:

- Researchers can create maintenance bookings through Advanced Booking modal.
- Researchers remain subject to normal booking/access group rules.
- Cost breakdown and project association are hidden.
- Recurring options hidden for maintenance bookings.
- Maintenance bookings are zero-cost / not charged.

See `booking_equipment.md` for booking-level details.

## Group Bookings lab setting

Group Bookings require multiple gates:

1. Lab-level `Settings -> Advanced` toggle enables multiple users per booking.
2. Individual Rules or Access Group Rules toggle enables users, excluding guests, to invite others.
3. User must have role/permission to create a booking.

Rules:

- Guests cannot create Group Bookings.
- Admin/instructor participant selection can include all users and groups.
- Non-admin participant selection includes only users with equipment access.
- Booking creator's rules/pricing control the booking; participants' pricing/access rules are ignored for pricing.

See `booking_equipment.md` for booking behavior.

## Services configuration

Services are a legacy/less-used feature for work not tied to a calendar time slot.

### Lab Settings Services toggle

- Affects entire Services section.
- Newly created labs: off by default.
- Existing labs with no services: turned off by default.
- Existing labs with at least one service: turned on by default.
- If off, Services and Orders areas are hidden for lab.
- `My Orders` is shown only if the user has at least one order requested by them.
- Marketplace was intentionally ignored when turning off this feature for labs; external services/orders were preserved where relevant.

Affected pages:

- Services Overview.
- Service Details.
- Orders.
- Add Service.
- Edit Service.
- My Orders.
- Order Details.

### Services

Services allow labs to offer work to researchers without booking equipment time.

Service overview columns:

- Name.
- Visibility.
- Status.
- Actions.

Visibility:

- `Internal`: visible only to lab members.
- `Public`: visible on marketplace.
- Visibility column appears for all roles, but values are only visible to admin roles; others see `-`.

Actions:

- Edit and Delete.
- Only user with admin rights for the service can delete it.
- Service cannot be deleted when pending orders exist.

### Add/edit service fields

General information:

- Service name: mandatory.
- Category: mandatory, from Control Room service categories.
- Contact person: lab member admin/instructor responsible.
- City: mandatory.
- Post code: mandatory.
- Country: mandatory dropdown.
- Service description: mandatory rich text.
- Related documents.
- Service images.
- Keywords for marketplace search.

Price & Availability:

- Min price: numeric.
- Max price: numeric.
- Currency: Braintree-supported currency list.
- Availability status: available/unavailable.
- Only available within your organisation: yes/no toggle.
- Are funding codes mandatory for orders?: yes/no toggle.

### Orders

Orders are to Services what Bookings are to Equipment.

Order table columns:

- Service name.
- Customer name.
- Type: internal vs external.
- Delivery date: TBD unless completed, otherwise completion timestamp.
- Cost.
- Status.

Order status mapping:

| Database status | Frontend label |
|---|---|
| `Open Request` | `Requested` |
| `Preapproval` | `Approved` |
| `Inprogress` | `Ordered` |
| `Completed` | `Completed` |
| `Declined` | `Declined` |
| `Canceled` | `Cancelled` |

External orders require payment via Braintree or invoicing; internal orders require no payment.

Source notes: Intra/internal orders cannot be created by Admin & Technician.

## Marketplace

Marketplace enables users to request external equipment/services from labs outside their own lab access.

### Search

- Top search bar is the marketplace entry point.
- All users except Guests can search.
- Students can search but results should be limited to internally available equipment/services, not external marketplace results.

Advanced Search filters:

- Type: Equipment, Services, or both.
- Source: Internal or External.
- Country.
- City.

### Equipment marketplace flow

Search results show:

- Picture.
- Equipment name.
- Organization name.
- Source.
- Location.
- Rating.
- Price hourly/daily in provider lab currency.

Equipment details page shows:

- Lab name.
- Equipment details.
- Booking rules.
- Additional information.
- Reviews/ratings.
- Request equipment calendar.

Request flow:

1. Customer selects time slot.
2. Customer sends mandatory message to provider.
3. Provider lab admin receives email and external booking request.
4. Provider can decline or approve.
5. If declined, customer is notified and process ends.
6. If approved, customer sees payment section.
7. Customer must pay before booking starts.
8. Payment can be card, invoicing, or voucher discount.
9. After payment confirmed, status becomes Booked.

Marketplace validation:

- External booking request message is mandatory.
- Message attachment max 10 MB.

### Service marketplace flow

Search results show:

- Service picture.
- Service name.
- Organization.
- Source.
- Location.
- Rating.
- Quote / Request a Quote or min/max price.

Request flow:

1. Customer opens Service Details.
2. Customer clicks Request a quote.
3. Customer sends free-text message and optional documents.
4. Provider creates tailored quote with line items.
5. After quote is sent, it cannot be changed.
6. Customer pays via card or invoice.
7. If invoice, PO must be sent and payment manually marked received.
8. Once paid, order status becomes Ordered.
9. Provider performs work and sends results; communication continues via Messages.

### Invoicing and purchase orders

For external paid equipment bookings or service orders:

- Invoice creation is manual using accounting software.
- If paid by card, a PDF purchase order is generated from Calira/Clustermarket to customer.
- If user chooses Invoicing, service/equipment is not paid immediately.
- User email instructs them to send PO to `accounts@clustermarket.com` or settle by card.
- Once payment received, staff manually update booking/order as Paid in Control Room -> Requests -> Bookings/Orders -> `Payment Received`.

## Maintenance contracts setting surface

Maintenance contracts are part of Equipment section but affect lab-wide maintenance management.

- Each contract can cover multiple equipment.
- Each equipment can have only one contract.
- Contracts include provider, contact, email, contract name, expiry date, 30-day reminder, maintenance types covered, and equipment covered.

See `registering_equipment.md` for detailed equipment association rules.

## Notification settings

Notification Settings page path:

```text
/accounts/:account_id/notifications
```

There are three variants:

- Admin version: user is admin in at least one lab.
- Instructor version: user is not admin anywhere but is instructor in at least one lab.
- Guest/Student/Researcher version: user is neither admin nor instructor anywhere.

Global rule from FAQ:

- When a booking is made, all admins in the lab where the booking was made get request emails, regardless of whether they are contact person for the equipment.

Services notification settings are hidden when Services config toggle is off.

## Feature flags / Flipper

Feature flags are managed through Flipper via each environment's Control Room.

### Environment isolation

- Production, staging, and review apps each have their own Control Room and Flipper config.
- A feature flag change in one environment affects only that environment.

### Access

- Everyone with Control Room access can access feature flag configuration.

### Configuration modes

Flipper supports:

1. Individual actors.
2. Groups.
3. Percentage of actors.
4. Percentage of time.

Actors:

- An actor is essentially an account ID in this system.
- Control Room users can add/remove individual actors.
- Individual actors can be added even if a flag also uses a group.

Groups:

- Groups are implemented in backend code, not in Control Room.
- Once implemented, groups can be enabled in UI.
- Example group condition: `status is active and lab is industry`.
- Non-developers cannot change group logic in bulk; they can only add/remove individual actors.

Percentage of actors:

- Uses checksum based on feature name and actor ID.
- Useful for random rollout.
- For precise rollouts, use a coded group.

Percentage of time:

- Randomly enables feature for a percentage of page loads.
- Source says this is unlikely to be useful for product purposes.

### Status colors

- Green: fully enabled for all users.
- Yellow: conditionally enabled.
- Red: completely disabled.

### Important UI hazard

Removing an actor has no confirmation modal. Once `Remove` is clicked, the actor is removed immediately.

## Control Room operational surface

Control Rooms let internal staff inspect/modify data without SQL.

Environments:

- Production.
- Staging.
- Review apps.

Access:

- Production/staging use personal credentials plus personal YubiKey 2FA.
- Review app uses documented shared test credentials.

Relevant Control Room areas:

- Users: view/edit/activate/deactivate/impersonate/confirm/revoke confirmation.
- Accounts: view/edit/activate/deactivate labs/accounts.
- External API -> Doorkeeper Applications: view/approve/revoke external API apps.
- Requests -> Bookings: view bookings only.
- Requests -> Orders: view orders only.
- Identity Providers -> SAML Identity Providers: view/edit/delete/create.
- Identity Providers -> Shibboleth Identity Providers: source notes historical exceptional support.
- Resources -> Assets: edit assets.
- Resources -> Services: edit services.
- Key Data: categories, manufacturers, models, sectors, service categories, sub categories, calculation params.
- Marketing -> Coupons: view/edit/create coupon codes for external bookings/orders.
- Marketing -> Email Templates: old/not in use.
- Control Room -> Admins: manage internal Control Room users.

Implementation caution:

- Control Room can bypass normal application UI flows. Do not infer end-user permissions from Control Room capabilities.
