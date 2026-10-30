# Registering Equipment Business Rules

_Source: Confluence PDF export, especially pages 52-77, 134-135, 278-300._

Use this file for creating/editing equipment, bulk upload, equipment metadata, labels, manufacturer/model suggestions, asset identifiers, purchase metadata, maintenance contracts, and parent/child equipment setup.

## Permissions

- Lab Admins can add, edit, duplicate, and delete equipment in their lab.
- Department/Organization Admins can manage equipment inside their scope and may move equipment/services between labs inside that scope.
- Instructors can add/edit/duplicate/delete equipment they are instructors for.
- Researchers, Students, and Guests cannot manage equipment.
- Instructors can only assign/remove equipment to/from access groups if they are instructor for that equipment.

Implementation rule:

```text
can_manage_equipment(user, equipment):
    return user.admin_scope_contains(equipment.lab)
        or user.is_instructor_for(equipment)
```

## Equipment Overview

The equipment overview table exists at lab/department/organization scope and includes:

- `+ Add equipment` action.
- Search by Equipment Name.
- Multi-select for booking, max 20 selected bookable items.
- Name column linking to Equipment Details, Calendar tab by default.
- Room column; can be empty.
- Manufacturer and Model columns.
- Maintenance contract column.
- Next maintenance column, sourced from next scheduled maintenance booking.
- Status column: Available / Unavailable.
- Actions column.

Role-specific actions:

- Admins: edit, duplicate, delete each equipment.
- Instructors: edit, duplicate, delete equipment they manage.
- Researchers/Guests: no actions.

Sorting/pagination:

- Alphabetical sorting on every column except Actions.
- Default rows per page: 10.
- Allowed rows per page: 10, 25, 50, 100.
- Pagination shows max 5 page numbers plus previous/next arrows.

Parent equipment overview behavior:

- Parent equipment appears as one row with `• Children X` suffix.
- Children are not listed as standalone overview rows.
- Selecting parent for multi-booking selects visible/available children and counts them toward the 20 limit.

## Add/edit equipment: modal structure

Single equipment creation opens a modal with up to 4 tabs:

1. General: always present.
2. Pricing: shown when pricing toggle is enabled.
3. Booking rules: shown when custom booking-rules toggle is enabled.
4. Maintenance: shown when maintenance-contract toggle is enabled.

### General tab: main fields

- Equipment Name.
- Room.
- Category: `Equipment`, `Room/Space`, `Desk/Bench`, `Other`, and for eligible bundles `Parent equipment`.
- Equipment type: shown only for `Equipment` and `Parent equipment` where applicable.
- Manufacturer: shown for `Equipment` and `Other`.
- Model: shown for `Equipment` and `Other`.
- Contact person: defaults to creator, but can be any admin or instructor.
- Assign to group(s): assigns equipment to one or more access groups immediately.
- Toggle for Pricing tab.
- Toggle for Booking rules tab.
- Toggle for Maintenance tab.

Category-specific logic:

```text
if category in ['Equipment', 'Parent equipment']:
    show equipment_type
if category in ['Equipment', 'Other', 'Parent equipment']:
    show manufacturer and model as applicable
if category in ['Room/Space', 'Desk/Bench']:
    hide manufacturer/model/equipment_type unless product code explicitly supports otherwise
```

### General tab: optional details

Optional details include:

- Manufacturing year: `Equipment` and `Other`.
- Serial number: `Equipment` and `Other`.
- Asset ID: optional; see Asset ID section.
- Availability status.
- Description.
- Lab & safety rules.
- Upload images.
- Upload documents.
- Date of purchase: optional; `Equipment` and `Other`.
- Purchase price: optional; `Equipment` and `Other`.

Description can be auto-filled when manufacturer/model matches data uploaded through Control Room Key Data > Manufacturers / Asset Models.

## Pricing tab

Pricing tab is optional and controls charging for internal and external users.

### Currency

- Currency is selected in `What currency would you like to charge people in?`.
- Currency cannot be changed after the first booking.

### Internal vs external availability

Field: `Is this equipment only available for internal lab members?`

- If `Yes`, equipment is only available to members of the lab where it is located.
- If `No`, equipment is available on the external marketplace for registered Clustermarket users.
- Turning this off adds external pricing fields for `Academia` and `Industry` and introduces external booking schedules under Booking rules.

### Charging type

Allowed values:

- `Per hour`
- `Per day`

Charging type cannot be changed after the first booking.

### Pricing values

- Internal pricing exists by default.
- Academia and Industry external pricing appear only when equipment is not internal-only.
- Standard rate is required when pricing is configured.
- Additional pricing options can define different prices by day/time for per-hour charging.
- Charity-backed and Research-Council-backed project/funding-code prices can be defined.
- Charity/Research Council prices apply only when booking selects a Project and Funding Code associated with that source.
- Group pricing works similarly but includes a Groups selector to scope pricing to selected access groups.

### Add-ons

Each equipment can have unlimited add-ons.

Add-on fields:

- Description.
- Internal request enforcement: Not available, Always mandatory, First booking, Optional.
- External request enforcement when equipment is not internal-only.
- Price.
- Quantity behavior:
  - Fixed.
  - As per booking hours.
  - As per booking days.
  - User specified.

If quantity is user-specified, allowed units are:

- Per sample.
- Per day.
- Per hour.
- Per run.

Booking invariant:

- Mandatory user-specific add-ons require user input in advanced booking options before confirmation.
- Admins, Technicians, and Instructors always treat add-ons as optional, even when booking on behalf of researchers.

## Booking rules tab

Booking-rule fields on equipment:

- Minimum booking time.
- Maximum booking time with scope: per booking, per day, per week, per month.
- Peak-hours-only maximum booking toggle with start/end times in 30-minute increments.
- Time increment after minimum booking time.
- Allowed start times: every 15 minutes, every 30 minutes, every hour, or custom.
- Earliest booking start: how soon from now bookings may start.
- Latest booking end: how far from now bookings may end.

Input constraints:

- Hours fields accept whole numbers.
- Minutes fields accept 0, 15, 30, 45.
- If hours is 0, minutes cannot be 0.
- Custom start steps are defined in one-hour steps.
- Earliest/latest fields accept whole numbers and can represent hours, days, or weeks.

## Maintenance contracts

Maintenance contracts are stored under equipment and can cover multiple equipment items.

Core invariant:

```text
contract has_many equipment
 equipment belongs_to at most one contract
```

Contract fields:

- Provider: mandatory; dropdown from provider/manufacturer-like control-room list.
- Contact person: free text.
- Email: valid email format.
- Maintenance contract name: mandatory; auto-filled from uploaded file name if a file is uploaded.
- Expiry date: mandatory date.
- Send 30-day reminder: toggle.
- Maintenance Covered: mandatory multi-select matching maintenance booking types: Preventative Maintenance, Cleaning, Calibration, Breakdown, Repair, Other.
- Equipment Covered: equipment associated with contract.

Synchronization rules:

- Equipment Maintenance tab reads providers/contracts from lab maintenance contracts.
- If equipment is associated with a contract in maintenance contracts, equipment Maintenance tab is auto-filled.
- If contract is associated from equipment Maintenance tab, maintenance contracts section updates too.
- Equipment details Maintenance tab is another display surface for same association.

## Bulk equipment upload

Bulk upload accepts spreadsheet/CSV data using the provided template.

Base columns:

- Equipment Name: free text.
- Room: free text.
- Is this an equipment or something else?: only `Equipment`, `Room/Space`, `Desk/Bench`, `Other`; source later adds `Parent equipment` for eligible parent uploads.
- Equipment type: constrained to template list, updated from production Control Room.
- Manufacturer: constrained to template list, updated from production Control Room.
- Model: free text.
- Asset ID: optional, after Model.
- Serial Number: optional, after Asset ID.
- Description: free text.
- Lab & safety rules: free text.
- Do you charge users for using this equipment?: `YES` or `NO` only.
- Custom booking rules?: `YES` or `NO` only.
- Maintenance contract?: `YES` or `NO` only.

Validation notes:

- Template validation lists should match production Control Room options.
- Asset ID max 100 characters.
- Duplicate Asset ID in same lab reports row-specific error: `Asset ID already exists.`
- Rows with invalid Asset IDs can be corrected and re-uploaded or discarded while continuing with valid rows.

## Equipment labels

Labels are lab-scoped tags used to organize and filter equipment.

### Availability and roles

- Roles that can manage labels: Admin and Instructor.
- Roles that can view labels: Researcher, Student, Guest.
- Labels are created and managed per lab; labels from one lab cannot be used in another lab even under the same organization.
- Source conflict: page header lists Trial/Premium/Enterprise; Technical Considerations says Premium/Enterprise and Core excluded. Check current product gating before changing bundle logic.

### Label assignment

- Labels are selected in `Label your equipment` field in create/edit equipment modal.
- Field supports multi-select.
- A label is represented by color + name.
- Selected labels appear alphabetically regardless of selection order.
- Dropdown labels also appear alphabetically.
- Org/Dep admin adding/editing equipment at org/dep level must select the lab before labels are enabled.
- If selected lab changes, selected label values are cleared.

### Label creation/edit/delete

Label fields:

- Name: unique within lab.
- Color.
- Preview.

Rules:

- Duplicate label names within a lab are rejected.
- Editing a label opens same modal with existing data.
- Deleting is available from label field UI.

### Label visibility and usage

- Equipment Overview has a `Labels` column.
- If multiple labels are attached, hidden labels are shown by hovering the count.
- Users can filter/search equipment by labels.
- Equipment Details displays labels prominently.
- Labels can be used when creating announcements.
- Labels can be used when creating workflows.

## Manufacturer and model suggestions

Manufacturer/model suggestions prevent unvalidated free text from entering the database unnoticed.

### Field dependencies

- Equipment type is disabled until category is selected.
- Model is disabled until Manufacturer is selected.
- Submitting blank manufacturer/model shows `This field is required.` and does not show suggestion prompt.

### Suggestion flow

- If user types a manufacturer or model that does not exist, they can progress only by submitting a suggestion.
- The suggestion modal pre-fills the user's typed value.
- After `Send suggestion`, success text is:
  - Create flow: `Your suggestion will be received when you create this equipment.`
  - Edit flow: `Your suggestion will be received when you save these changes.`
- The suggested value is accepted as valid input for the current equipment, but a suggestion record is added to Control Room for review.

### Control Room suggestion table

Location: `Key Data -> Suggested Manufacturer Models`.

Columns:

- Suggested Manufacturer.
- Suggested Model.
- User.
- Asset.
- Actions.

Actions:

- View: shows entry details plus created/updated timestamps.
- Edit: edits the suggestion record only; does not change asset properties.
- Accept manufacturer: adds manufacturer to database and applies it to asset; model remains unchanged and is not added.
- Accept both: adds manufacturer and model, associates model to manufacturer, applies both to asset, and makes both available for future dropdowns.
- Reject both: does not change asset and does not add values to database; CM team must manually correct asset if desired.

Special accept-both case:

- If manufacturer already exists and only model was suggested, accepting both should not duplicate manufacturer; model is added and associated with existing manufacturer.

### Editing suggestion state transitions

- Suggested manufacturer + suggested model -> manufacturer changed to valid existing:
  - If model remains a new suggestion, update suggestion table.
  - If model becomes valid, delete suggestion entry.
- Valid manufacturer + suggested model -> manufacturer changed to suggestion:
  - Update control room entry with new suggested manufacturer/model.
- Valid manufacturer + suggested model -> model changed to valid:
  - Remove suggestion entry.
- Suggested manufacturer + valid model is not a valid scenario; if manufacturer is suggested, model is also treated as suggested because models are shown only for valid manufacturers.

## Asset ID and Serial Number

### Asset ID

Asset ID is a user-defined optional equipment identifier and is separate from the system-generated Clustermarket asset ID.

Rules:

- Available in create/edit equipment forms, bulk upload, and equipment details view.
- Optional text input.
- Max length: 100 characters.
- If present, must be unique within the lab.
- Duplicate value displays inline error that value already exists.
- When duplicating equipment, Asset ID is left blank to avoid conflicts.
- When creating/editing at organization or department level, changing the selected lab clears Asset ID.
- Backend stores it under a different name to avoid conflict with system asset IDs.
- Equipment details shows Asset ID value, or `-` if absent.

### Serial Number

- Optional field.
- Available in bulk upload, create/edit forms, and details view.
- Stored for reference.
- No uniqueness or special validation beyond standard optional field behavior.

## Purchase price and purchase date

Availability:

- All bundles.
- Admins and Instructors can manage and view.
- Only Admins and Instructors see purchase details in Equipment Details.

### Date of Purchase

- Optional date picker.
- Not manually editable; user selects via date picker.
- Display follows user's date-format preference.
- Applies only to `Other` and `Equipment` types.
- Preserved when duplicating equipment.

### Purchase Price

- Optional numeric field.
- Accepts decimals.
- Displayed in lab currency.
- If equipment transfers between labs with different currencies, value is retained but can be updated to new currency.
- Applies only to `Other` and `Equipment` types.
- Preserved when duplicating equipment.
- Max 8 digits plus 2 decimals; `99999999.99` is valid.
- Exceeding limit shows user-friendly validation error instead of system error.

## Parent and Child Equipment

Parent equipment represents one logical instrument with multiple bookable child units.

### Availability and permissions

- Available to Premium and Enterprise customers.
- Core customers do not see Parent equipment option when adding/editing.
- If lab downgrades to Core, existing parent equipment remains but users cannot create new parent equipment.
- Admins and Instructors can manage parent/child equipment.
- Instructors, Researchers, Students, and Guests can book child equipment when they have access.

### Creation rules

- Category: `Parent equipment`.
- Parent must have at least one child.
- Child section starts with one child row.
- Child name is required and max 200 characters.
- Up to 15 children.
- Add child button hidden at 15 children.
- Delete icon disabled for last remaining child.

Errors:

- Child name > 200 chars: `This field cannot be longer than 200 characters`.
- No valid child name: `Parent equipment is required to have at least one child.`

On submit, system creates:

1. Parent equipment record.
2. All child equipment records.

### Inheritance rules

If `Inherit properties from parent` is enabled for a child, transfer:

- Maintenance company and contract.
- Contact person.
- Asset ID.
- Serial number.
- Description.
- Lab & Safety rules.

Asset ID inheritance formats child IDs as:

```text
[parent asset id]-1
[parent asset id]-2
...
```

Pricing and booking rules:

- Parent pricing and booking rules apply to every child 1:1 by default.
- This happens regardless of whether inheritance checkbox is enabled.
- Rules are not split, divided, or scaled by number of children.

Disclaimers shown for Parent equipment:

- Booking rules: `Booking rules will be applied to all children`.
- Pricing: `Pricing settings will be applied to all children`.

### Editing and type changes

Users can switch equipment type to/from Parent equipment at lab/department/organization scope.

- Type change shows confirmation modal explaining consequences.
- Once confirmed, existing bookings for that equipment are removed from normal system views: soft-deleted from calendars and booking lists, retained for reporting.
- At organization/department level, Lab field is disabled and cannot be changed.
- If user changes type and then changes back during same edit session, lab value returns to what it was when modal first loaded.
- Editing parent equipment exposes same Child section with same constraints.
- On save, updates apply to parent and edited children.
- If inheritance is checked during edit, child inheritable fields are overwritten with current parent values.
- If inheritance is unchecked, previously inherited values remain and are not automatically removed.

### Bulk upload for Parent equipment

- Bulk upload supports `Parent equipment` as Category value.
- When parent category is selected, Equipment type, Manufacturer, and Model are required.
- Up to 15 children can be defined per parent row.
- Child-related columns are ignored for non-parent categories.
- Parent rows trigger a second-step UI so users can confirm child definitions and optionally use prefix-based naming such as `Tray 1`, `Tray 2`.

### Children tab

Parent Equipment Details has a `Children` tab for users who can access parent details.

Grid columns:

- Name.
- Contact Person.
- Asset ID.
- Serial Number.
- Next Maintenance: admins/instructors only.
- Status: admins/instructors only.
- Actions: admins/instructors who can manage.

Rules:

- Children ordered alphabetically.
- Sortable columns.
- Rows-per-page preference stored per user/lab/page.
- Unavailable children are visible only to admins/instructors who manage equipment.
- If all children are unavailable for a non-admin, show dedicated empty/unavailable state.

### Managing children

Admins and permitted instructors can add, edit, duplicate, and delete children from the Children tab.

Add child modal fields:

- Child Name: required, max 200.
- Inherit properties from parent.
- Availability status: default Available.
- Maintenance contract coverage toggle and Maintenance tab when enabled.
- Contact person: required.
- Asset ID: optional, max 100.
- Serial number: optional.
- Description: optional.
- Lab & Safety rules: optional.
- Image upload and document attachments.

If inheritance is enabled:

- Inheritable fields auto-populate from parent and become read-only.
- If user already entered values, turning inheritance on shows confirmation before overwriting.

Availability linking:

- If parent is Unavailable at child creation or becomes Unavailable later, all children become Unavailable.
- While parent is Unavailable, child availability field is disabled; users cannot switch children to Available.
- When parent returns to Available, previously unavailable children become Available again.

Deletion/duplication:

- Deleted children disappear from operational UI but remain available for reporting.
- Duplicate child opens create modal prefilled from original, names child `Original Name (copy)`, and auto-applies parent booking rules and pricing.

### Child details page

Child details page tabs:

- Details.
- Calendar.
- User Access.
- Maintenance.

Child Details differences:

- Parent name/icon shown and links back to parent.
- Location, Room, Manufacturer, Model, and Equipment Type are copied from parent.
- Child-specific fields: Asset ID, Serial Number, Description, Contact Person, child images/documents.
- No Edit Equipment button.
- No QR code generation.

## Control Room data dependencies

The following create/edit equipment fields depend on Control Room Key Data:

- Categories -> `Is this an equipment or something else?`.
- Sub Categories -> `Equipment type`.
- Manufacturers -> `Manufacturer`.
- Asset Models -> `Model`, associated to exactly one Manufacturer.
- Service Categories -> service category, for Services not Equipment.
- Sectors -> Academia and Industry.

Relationships:

- One Category can be assigned to many Assets; one Asset has one Category.
- One Sub Category can be assigned to many Assets; one Asset has one Sub Category.
- One Manufacturer can be assigned to many Assets; one Asset has one Manufacturer.
- One Manufacturer can have many Asset Models; one Asset Model belongs to one Manufacturer.
