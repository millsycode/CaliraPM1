# Custom Forms and Configurable Workflow Rules

_Source: Confluence PDF export, especially pages 143, 249-277, 282-285, 307-313, 320-323, 334-338._

The PDF does **not** contain a dedicated product section named `Custom Forms`. This file captures the form-like and configurable workflow business rules that appear in the source: Smart AI Scheduling / Booking Workflows, booking notes, service quote line items, RSpace equipment forms, and eLabNext custom-field boundaries.

Do not infer or build a generic custom-form-builder capability from this file unless product confirms it. The rules below describe specific form surfaces.

## Form-like surfaces in the source

| Surface | Who configures it | Who fills/uses it | Purpose |
|---|---|---|---|
| Workflow definition | Admin | Admin defines; eligible users book | Blueprint of equipment sequence and durations. |
| Workflow booking modal | Eligible workflow bookers; admins can book on behalf | Booking user | Search and confirm available workflow slot. |
| Booking Notes | Booking users, admins, instructors | Users with booking/note access | Rich text notes and attachments on bookings. |
| Service quote line items | Service provider/admin side | Provider | Free-text quote items, quantity, price, unit, discounts. |
| RSpace equipment form | RSpace admin/user | RSpace user | Optional form to capture extra experimental details in RSpace. |
| eLabNext equipment fields | eLabNext plugin/admin | eLabNext users | Required equipment fields and optional/custom fields when eLab is source of truth. |

## Smart AI Scheduling / Booking Workflows

### Availability and scope

- Pricing bundles: Trial, Premium, Enterprise.
- Workflow definitions are managed by Admins.
- Instructors, Researchers, Students, and Guests can book workflows only if given access.
- Workflows are lab-level only. Organization and department admins must navigate to a lab before using workflows.

### Definition overview

A workflow definition is a blueprint containing:

- Name.
- Equipment included in the workflow.
- Duration for each equipment usage.
- Users who can book the workflow.
- A canvas/timeline describing sequence, overlaps, and order.

Workflow overview grid columns:

- Name.
- Equipment.
- Access.
- Duration.
- Total hours.
- Actions.

Grid behavior:

- Workflows ordered alphabetically.
- Sortable columns except Equipment and Access.
- Pagination and rows-per-page preference mirror other grids and are stored per lab, page, and user.
- Access and Actions columns are hidden for non-admins and instructors.
- Search filters by workflow Name.
- Clicking workflow name opens details screen for all roles.
- Details screen shows equipment and duration as configured and allows canvas zoom.

### Creating a workflow definition

Only Admins see `Create a workflow`.

Creation modal tabs:

1. Equipment.
2. Duration.
3. Access.

#### Equipment tab

Required:

- Workflow name.
- At least 2 equipment items.

Equipment grid columns:

- Equipment.
- Room.
- Labels.

Rules:

- Equipment ordered alphabetically.
- Equipment and Room columns are sortable.
- User selects equipment via checkboxes.
- Search suggestions are grouped into Search, Rooms, Labels.
- Selecting a Search result or pressing Enter filters across all three columns, weighted toward Equipment.
- Selecting Room filters by exact room.
- Selecting Label filters by label.
- Multiple label filters use AND logic.
- Labels in the grid are clickable and behave like selecting label filter.
- Search can be applied within selected label results.

#### Duration tab

Rules:

- All equipment selected in Equipment tab is shown.
- Default duration per equipment is 1 hour.
- Maximum duration is 168 hours.
- Minutes are 0, 15, 30, 45.
- System must not allow 0 hours + 0 minutes.
- User can remove equipment from this step.
- At least 2 equipment items must remain; delete icon disabled at exactly 2 selected equipment.

#### Access tab

Purpose: select which users can book the workflow.

Rules:

- Selecting users is optional; workflow can be created with no explicit access users.
- Admins can book every workflow by default.
- Access grid includes only Instructor, Researcher, Student, and Guest users who already have access to book all selected equipment.
- Users are ordered alphabetically.
- Search behaves similarly to Equipment tab.
- When equipment changes during edit and a selected user lacks access to newly added equipment, that user is automatically deselected.

Critical exception:

```text
Users who have access to book a workflow are not subject to normal booking rules during workflow booking.
Only calendar availability is checked.
```

Pricing and project/funding validations still apply during confirmation where described below.

## Workflow Canvas

Canvas is shown after Equipment, Duration, and Access are defined.

Rules:

- Displays workflow name at top.
- Timeline defaults to 24 hours.
- Timeline extends to nearest whole day when bookings exceed 24 hours.
- Maximum timeline length is 31 days.
- Selected equipment cards initially start simultaneously according to their durations.
- User can resize equipment duration by dragging card edges.
- User can rearrange equipment by drag/drop.
- Placements snap to nearest 15-minute increment.
- Hovering a card reveals `X` removal.
- User can zoom in/out.
- User can add time in increments of one hour or one day.
- Events cannot extend beyond 31-day limit.
- Mobile attempts that push timeline beyond the limit show an error.

Save/cancel/navigation:

- `Save Workflow` trims unused time before the first booking definition.
- Save automatically orders booking definitions chronologically.
- After save, user returns to Workflows UI with toast confirmation.
- `Cancel` asks user to confirm discarding changes.
- Navigating away through app menu/buttons prompts save/discard.
- Browser Back/Reload are not blocked.
- Logout, Create Lab, and Join Lab modals bypass canvas without saving.

## Editing workflow definitions

Only Admins can edit definitions.

Rules:

- Non-admin and instructor users do not see Edit.
- Edit opens Canvas with existing equipment and durations.
- Admin can resize, rearrange, and update.
- `Update` saves and returns to grid with confirmation.
- `Cancel` exits without saving.
- Workflow Settings modal is available from edit and has Equipment, Duration, Access tabs.
- Same validation rules apply as creation.
- Equipment tab shows informational section explaining effects of changing equipment.
- Existing equipment is preselected.
- New equipment added appears at bottom of Duration list.
- Duration changes reflect directly on Canvas.
- Access selection is recomputed/deselected when equipment access no longer matches.

## Duplicating workflow definitions

- Duplicate button creates a new workflow from an existing one.
- User is taken to Canvas in creation mode.
- Name is appended with `(Copy)`.
- Equipment and durations carry over exactly.
- User can cancel, modify settings, edit canvas, or save.
- Saving trims leading unused time and chronologically orders bookings.
- Original workflow remains unchanged.

## Deleting workflow definitions

- Only Admins can delete workflow definitions.
- Admins can delete their own or others' workflows.
- Non-admin/instructor delete option is hidden/disabled.
- Delete shows confirmation modal: `Yes, delete` or `No, cancel`.
- Deleting a workflow definition does not affect future bookings already created from that workflow.

## Booking a workflow

### Start search

Users start from workflow details `Book` button.

Access rules:

- Admins can book any workflow.
- Other roles can book only workflows where they were granted access.

`Book time and date` field:

- Required.
- Opens a date picker.
- Defaults to today's date and nearest future 15-minute increment.
- Admins can select dates in the past.
- Other roles can choose only future date/time.
- Time increments fixed at 15 minutes.
- Date/time display follows user profile format settings.
- Manual field edits are not allowed.

Search behavior:

- Empty field shows error.
- While search runs, show loader.
- Algorithm checks whether the entire workflow can be booked from requested start time.

Outcomes:

1. Slot available: show start/end and allow user to proceed by clicking Book.
2. Slot unavailable: suggest alternatives.

Alternative rules:

- Up to 3 closest available start times on the same day.
- Up to 3 options for a different day with the same start time.
- If no availability on selected day, show only other-day suggestions.
- Suggestions display day of week, date, and time using profile format settings.

Admin-specific constraint:

- For initial implementation, workflow availability checks conflicts for all roles including admins. Admins cannot override overlaps for workflows; alternatives are provided.

Staleness/conflict:

- If selected slot becomes unavailable after search, show error modal.
- If start time passes before confirmation, use standard single-booking error handling.

### Confirmation modal

Confirmation shows workflow name, start/end dates, and workflow icon.

Modal controls:

- User can return to search; confirmation prompt protects against accidental discard.
- `X` exits with confirmation prompt.

Admin-specific:

- Admin sees `book on behalf of` field.
- Admin can select any active lab member, regardless of that user's workflow access.
- Field supports only single-user selection.

Cost breakdown:

- Shown if workflow includes priced equipment.
- Lists each priced equipment and associated costs.
- Equipment without pricing is excluded.
- Users can click equipment to view detailed costs or modify add-ons.
- Admins can disable mandatory add-ons.

Projects integration:

- If lab projects are enabled, Projects field appears.
- Field applies to entire workflow booking.
- Users can select one or more projects.
- Funding code/cost/percentage section appears after project selection.
- Percentages must be allocated among funding codes of same type/source.
- Equipment costs recalculate from allocations.
- Project selection is not mandatory for workflow bookings.

Project/funding validation messages:

- Different funding types: `All of the selected funding codes must be of the same funding type.`
- Allocation not 100%: `Funding Codes must total 100%.`
- Expired project codes are flagged.

Completing booking:

- `Confirm` button displays total price if applicable.
- If backend reports slot unavailable, show predefined error modal and return to initial step.
- Workflow booking creation ignores user and equipment booking rules and checks only calendar availability. Pricing still applies.

## Workflow bookings on calendars

Visible on:

- Home -> My Booking calendar.
- Lab Dashboard.
- Equipment Calendar.

Display rules:

- User's own workflow bookings have distinct color and workflow icon.
- Other users' workflow bookings appear as normal bookings with no special workflow color/icon.
- Schedule for today shows workflow color/icon.
- If normal and workflow bookings occur at same time, display standard green slot with workflow icon overlay.

## Editing workflow bookings

Only Admins can edit workflow bookings.

- Admins can edit their own and others' workflow bookings.
- Non-admins and instructors cannot edit workflow bookings.
- Admin click opens card with workflow icon and `View and Edit`.
- V&E modal includes workflow section and info section.
- Workflow section can link to Workflow Details.
- Admin edits can change booking duration, projects, and notes.

## Canceling workflow bookings

Non-admin users:

- Can cancel only their own entire workflow booking.
- Cannot cancel if any part of workflow is in the past.
- If first booking in workflow has started, cancel option is hidden.

Instructors:

- Can cancel future bookings, whether individual booking or entire workflow.
- Cannot cancel past bookings.

Admins:

- Can cancel their own or others' workflow bookings.
- Can cancel individual bookings within workflow or entire workflow.
- Can cancel past or future bookings.

UI:

- Admins/instructors see `Cancel booking` and can choose selected booking or entire workflow.
- Non-admins see `Cancel workflow` only when eligible.
- Confirmation modal precedes cancellation.
- Toast confirms success.

## Booking Notes form

Booking Notes are a rich text form surface attached to bookings.

Availability:

- Available in booking modal and View & Edit modal Notes tab.
- Works with Normal, Maintenance, and Workflow bookings.
- Core labs have attachment/edit/delete restrictions described in `booking_equipment.md`.

Attachment fields/rules:

- Multiple attachments up to 10 per note.
- Each file max 20 MB.
- Attachments may be submitted without note text.
- Supported images: `.jpeg`, `.jpg`, `.png`.
- Supported documents: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ods`.

Editing/deletion form behavior:

- Hover reveals edit/delete controls according to permissions.
- Edit opens rich text editor pre-filled with content.
- Edited notes labeled `Edited`.
- Delete confirms via modal.
- Removing all content deletes note.

## Service quote form-like rules

Service quote creation is not a general custom-form builder, but provider quotes contain customizable line items.

Rules from Marketplace/Services source:

- Provider receives external service request and can create a tailored quote.
- Quote can include as many items as provider wants.
- Quote item fields are free text and can be customized.
- Each item has quantity, price, and unit.
- Discounts can be applied.
- Estimated delivery date can be added from moment service is paid.
- Subtotal is calculated by multiplying quantity by price, summing items, then applying discounts.
- Deliverables field is free text.
- Notes/`MNotes` field is free text.
- Message field is free text.
- Available Contracts are contracts uploaded/supplied by organization of lab controlling the service.
- After a quote is sent, it cannot be changed.

Implementation invariant:

```text
if quote.status == sent:
    disallow edits to quote line items, price, discount, deliverables, notes
```

## RSpace equipment form rules

RSpace has a generic equipment form named `RSpace_Equipment_Form`.

- Form is optional.
- It captures experimental details about equipment usage.
- Clustermarket booking/equipment data can be inserted into any RSpace document, with or without this form.
- Data inserted from Clustermarket appears as a table.
- RSpace users can edit inserted table data after insertion.
- Hyperlinks back to Clustermarket work after saving the RSpace document.

Do not treat RSpace form fields as Clustermarket-managed custom fields.

## eLabNext custom-field boundaries

When eLabNext is source of truth:

- eLab equipment data can include mandatory fields plus non-mandatory fields.
- Mandatory/equivalent source fields include Equipment Name and Equipment Type.
- Non-mandatory fields may include Description, Manager/contact person, Manufacturer, Department, Building, Floor, Room, Address, and custom fields.
- eLab custom fields may be short text fields or file attachments.
- Clustermarket required create/update fields are limited to Equipment Name, Equipment Type/default category, Equipment Subtype, Manufacturer, and Model.
- Groups, training, and maintenance are not imported from eLab; lab manager must add those in Clustermarket.

Bayer/plugin specific:

- eLab create/edit blocks save unless Name, Type, Manufacturer, and Model are present.
- Plugin auto-adds Manufacturer and Model meta fields to eLab form.
- Model field appears on eLab Add Equipment only when plugin is configured with eLab as source of truth.
- eLab-managed equipment fields are disabled in Clustermarket edit modal.

## Implementation guardrails for Claude Code

When asked to implement or change `custom forms`:

1. Check whether the request is really about Workflow definitions, Booking Notes, service quote items, RSpace forms, or eLab field mapping.
2. Do not create reusable arbitrary field types unless explicitly scoped by product.
3. Preserve existing booking/workflow permission checks.
4. Preserve Workflow booking exception: normal booking rules are ignored; calendar availability and pricing/project validations still apply.
5. Preserve quote immutability after quote is sent.
6. Preserve integration source-of-truth boundaries for eLab and RSpace.
