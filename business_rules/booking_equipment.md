# Booking Equipment Business Rules

_Source: Confluence PDF export, especially pages 15-38, 44-51, 52-60, 245-277, 280-300._

Use this file for equipment booking flows, validations, calendars, time zones, group bookings, notes, reminders, workflow bookings, parent/child booking behavior, and maintenance bookings.

## Booking records and status labels

### Internal equipment bookings / Bookkit

Database status to frontend label:

| Database status | Frontend label |
|---|---|
| `Blocked-Requested` | `Requested` |
| `Blocked` | `Booked` or `Completed` |
| `Declined` | `Declined` |
| `Canceled` | `Cancelled` |

### Marketplace bookings

| Database status | Frontend label |
|---|---|
| `Open Request` | `Requested` |
| `Preapproval` | `Approved` |
| `Approved` | `Booked` |
| `Inprogress` | `Booked` / `Ordered` |
| `Completed` | `Completed` |
| `Declined` | `Declined` |
| `Canceled` | `Cancelled` |

## Role-based booking invariants

| Role | Needs group or individual rules for internal equipment? | Can book managed equipment on behalf of others? | Can book external equipment? | Can create/edit/cancel past bookings? | Equipment time/availability settings apply? | Can overlap bookings? | Visibility into other people's bookings |
|---|---:|---:|---:|---:|---:|---:|---|
| Guest | Yes | No | No | No | Yes | No | No name, no notes |
| Student | Yes | No | No | No | Yes | No | Name and notes for internal bookings only |
| Researcher | Yes | No | Yes | No | Yes | No | Name and notes for internal bookings only |
| Instructor for equipment | No | Yes | Yes | Yes | No | Yes | Name and notes including external booking account name |
| Lab Admin | No | Yes | Yes | Yes | No | Yes | Name and notes including external booking account name |
| Org Admin | No | Yes | Yes | Yes | No | Yes | Name and notes including external booking account name |

If an Instructor is **not** instructor for a given equipment item, do not apply instructor-managed-equipment privileges for that item.

## Time zone rules

Calendars and booking validations use two time zone concepts:

- **Device/user timezone** for personal, user-facing schedules.
- **Lab timezone** for lab/equipment booking events and enforcement.

Rules:

- Homepage greeting uses device timezone.
- Homepage `Schedule for today` uses device timezone.
- Homepage `My booking calendar` uses device timezone and shows equipment booked by the user in the past 30 days; it can include multiple labs.
- Lab Dashboard calendar uses lab timezone.
- Equipment page Calendar tab uses lab timezone.
- Booking modals opened from dashboards use lab timezone.
- My Bookings table start/end times use lab timezone, because the booking happens in the physical lab.
- `Cannot book in the past` for non-admins is based on provider lab timezone.
- LabTrack requires lab timezone to match the computer timezone where LabTrack is installed.

## General booking validations

These validations apply when a user creates or edits bookings unless role-specific exceptions apply.

| Validation | Rule | UX / code notes |
|---|---|---|
| Cannot book in the past | Non-admin booking start time cannot be before current time in provider lab timezone. | Greyed-out calendar area. FE: `calendar/validations/past_booking.js`; BE: `AssetRequest#valid_booking_day`. |
| Duration divisible by 15 minutes | Booking duration must be divisible by 15 minutes. | BE validation error: invalid duration. BE: `AssetRequest#booking_duration`. |
| End after start | End time must be after start time. | BE validation error: invalid end_time. BE: `AssetRequest#end_time_is_after_start_time`. |
| Attached contract | Contract must be PDF and <= 10 MB. | BE: `AssetRequest#acceptable_contract`. |

Unwritten edit rule from source:

```text
if booking.start_time has passed and booking.end_time has not passed:
    user may edit and move the booking around, subject to permissions/rules
elif booking.end_time has passed:
    user cannot edit the booking
```

## Equipment booking rule settings

Equipment-level rules include:

- Minimum booking duration.
- Maximum booking duration.
- Maximum booking duration during peak hours only.
- Booking time increment after the minimum duration.
- Start steps: every 15 minutes, every 30 minutes, every hour, or custom start times.
- Earliest booking start: how far from now a booking is allowed to start.
- Latest booking end: how far from now a booking is allowed to end.
- External/lab-hours schedule for marketplace or cross-lab organization bookings, shown when equipment has academia and industry prices greater than zero.

### Duration and increments

- Minimum and maximum time inputs use hours plus minutes.
- Minutes are constrained to 0, 15, 30, or 45.
- If hours is 0, minutes cannot be 0.
- Default maximum booking time is the maximum possible: 3 months.
- Peak-hour max duration uses start/end dropdowns in 30-minute increments; start must be before end.
- Booking increment counts from the minimum booking time.

Example:

```text
minimum_booking_time = 15 minutes
booking_increment = 30 minutes
valid durations = 15m, 45m, 1h15m, 1h45m, ...
```

### Validation UX and implementation hints

| Rule | UX | Code hints |
|---|---|---|
| Maximum booking time | Currently surfaced as a usage-limit error in invalid bookings modal; source calls this a bug. | FE: `calendar/validations/max_duration.js`; BE: `AssetRequest#max_booking_setting`. |
| Minimum booking time | Calendar automatically adjusts booking length to the minimum. | FE: `calendar/validations/min_duration.js`. |
| Time increment | Red error at bottom of calendar when user drags invalid duration. | FE: `calendar/validations/time_increment.js`. |
| Start step | Red error at bottom of calendar when start time violates rule. | FE: `calendar/validations/start_step.js`. |
| Earliest start | Greyed-out calendar area. | FE: `calendar_initialization#getStartConstraint`; BE: `AssetRequest#valid_booking_day`. |
| Latest end | Greyed-out calendar area. | FE: `calendar_initialization#getEndConstraint`; BE: `AssetRequest#valid_booking_day`. |
| Allowed schedule | Greyed-out area and error when clicked. | BE: `BookingHoursValidator`. |

When multiple validations overlap, the first validation can cause the second validation to fail. For example, resizing to stay inside an allowed schedule may violate the booking increment rule.

## Group and individual booking rules

Group or individual rules can define:

- Approval requirement.
- Usage limits.
- Edit/cancel permissions and cutoffs.
- Project/funding-code requirements.
- Recurring booking permission.
- Trained/untrained schedules.
- Group Booking participant invitation permission.

### Approval requests

If `requires_approval` is true:

- Booking appears striped on the calendar as a request.
- Other users may create overlapping bookings while approval is pending because the admin has not confirmed the time is truly blocked.

### Usage limits

- Member limit per equipment: max hours one member can book on each equipment in the group; can be per day, week, year, or total.
- Group-wide limit per equipment: max hours all group members together can book on each equipment; can be per day, week, year, or total.
- Individual usage limit: max hours one user can book on each equipment assigned to the user's personal group; can be per day, week, year, or total.
- Exceeding limits shows a usage-limit error in the invalid bookings modal after Confirm.

### Project and funding-code requirement

If funding codes are mandatory:

- User must select at least one project with at least one funding code in advanced options.
- Selected funding-code percentages must sum exactly to 100%, except the system also allows all selected funding codes to total 0%.
- Funding codes of different funding sources/types cannot be mixed when equipment has different pricing by funding source, because cost cannot be calculated accurately.
- If mandatory project/funding data is required, do not allow direct confirmation from the base modal; route through advanced options.

### Edit and cancellation cutoff

- If edit/cancel toggles are off, users cannot perform those actions.
- If cutoff is blank, default behavior is cancel until start time and edit until end time.
- If cutoff is negative, edit/cancel after booking start is allowed.
- Edit/cancel buttons should be hidden on booking details when the user is not eligible.

Backend hints:

- Edit: `AssetRequest#allow_intra_edit`.
- Cancel: `AssetRequest#allow_cancel?`.

## Funding code validations

Funding codes are associated with projects and booking cost allocation.

Rules:

- Funding code types are `Research Council` or `Charity`; some source text also references `none`.
- Funding codes are created under projects.
- Funding codes appear after the user selects a project in the booking modal.
- Users can split booking cost across multiple funding codes.
- Total allocation must be 100% or 0%.
- All selected funding codes must be of the same funding type/source.
- Expired funding codes are not displayed. If a funding code expires on the current day, it is still valid that day.
- If a selected project has some expired and some active codes, show only active codes plus info message.
- If a selected project has only expired codes, show no codes plus an info message prompting edit/another project.

Error text from source:

- `All of the selected funding codes must be of the same funding type.`
- `Funding code coverage must amount to exactly 100%`
- Workflow booking source uses: `Funding Codes must total 100%.`

## Pricing and add-ons in bookings

### Price changes on existing bookings

When equipment price changes and old-price bookings already exist:

- Opening the booking modal for edit displays the updated price.
- Closing with `X` or `Cancel` must not update persisted price.
- Clicking `Update` after making changes saves the new price.

### Add-ons

- Equipment can have unlimited add-ons.
- Add-ons can be unavailable, optional, mandatory for first booking, or always mandatory.
- Internal and external request enforcement can differ.
- Admins, Technicians, and Instructors always treat add-ons as optional, including when booking on behalf of researchers.
- Mandatory add-ons should be preselected.
- Add-ons can be fixed price, hourly, daily, or user-specific.
- User-specific pricing requires user input before booking; automatic pricing types calculate from booking duration or fixed price.
- If an equipment has mandatory add-ons with user-specific pricing, user must go to advanced options before confirming.

## Multiple equipment bookings

Multiple equipment booking is available from Equipment Overview and Lab Dashboard and behaves the same in both places.

Rules:

- Each equipment row has a checkbox.
- Selecting at least one checkbox shows an action bar.
- `Clear` resets all selections.
- Users can select up to 20 equipment items.
- If more than 20 are selected, hide `Book` and show warning: `Book up to 20 equipment at a time.`
- At organization/department level, Org Admin can book multiple equipment only if all selected equipment belongs to the same lab.
- Equipment type and Parent equipment type can be selected together.
- Selecting a parent selects its children and children count toward the 20 limit.
- Children are the actual booked items.

### Charging-type compatibility

To avoid booking conflicts:

```text
if selected_equipment contains per_day charging:
    disable/grayout all per_hour equipment
elif selected_equipment contains per_hour charging:
    disable/grayout all per_day equipment
if selection cleared:
    re-enable disabled equipment
```

### Multiple booking validations

- Recurring bookings are not allowed.
- Recurrence options are hidden in the advanced options modal.
- Source notes this is restricted through frontend only; backend validation is not implemented.
- Allowed schedules may differ for each equipment calendar displayed side-by-side.

## Lab Dashboard and booking surfaces

### My Bookings

- Lists bookings made by the user.
- Shows equipment name, lab name, start date, end date, expense, and status.
- Search, filter, and sort are supported.

### Bookings

- Same concept as My Bookings, but lists all equipment bookings associated with a specific account/lab rather than one user.

### Lab Dashboard

- Shows all bookings for displayed lab equipment/services: own bookings, others' bookings, maintenance, external bookings, and announcements.
- Equipment is alphabetical and grouped by Room.
- Users may not see equipment if they lack access, are untrained and equipment is hidden, or equipment is unavailable and unavailable equipment is hidden for non-admins.
- `My Lab Activities` shows future non-completed bookings/orders for the user in that lab. Users can cancel their own internal bookings here; external bookings/orders require details pages for actions.
- `Lab activities` is visible only to admins and instructors. It shows future non-completed lab bookings/orders. Admin/instructor can accept/decline internal bookings here; external booking requests and service orders must be actioned from detail pages.

Calendar views:

- Day: hourly columns from 12am to 11pm.
- Week: columns per day and AM/PM.
- Month: columns per day and AM/PM with horizontal scrolling.

Visibility:

- Admins and instructors see all equipment and services.
- Guests, Students, and Researchers see only resources they have access to.

## Booking reminders

Availability:

- Trial, Premium, and Enterprise bundles.
- Not available for Core.
- Lab only, not organization/department accounts.

Configuration:

- Lab Admin configures in `Lab Settings -> Advanced Settings -> Booking Reminders`.
- Options: Off (default), 1 Hour Before, 1 Day Before, 2 Days Before, 1 Week Before.
- Saving makes backend call and shows toast on success.

Email behavior:

- Reminders are sent for new and existing future bookings.
- If reminder interval is greater than the remaining time until booking start, no reminder is sent.
- Only approved bookings receive reminders.
- Internal lab bookings only.
- Includes recurring and maintenance bookings.
- Users cannot unsubscribe from booking reminders.
- Same email template for all roles.

## Maintenance bookings by Researchers

Availability:

- Premium and Enterprise bundles.
- Managed by Lab Settings Advanced toggle: `Maintenance for researchers`.
- Default off.
- Locked for Core labs; downgrade disables the setting but does not affect existing maintenance bookings.

When enabled:

- Researchers can create maintenance bookings through the Advanced Booking modal.
- They can set `Type` to `Maintenance`; default is `Use`.
- Additional required fields appear:
  - `Provider`: Internal (default) or External.
  - `Maintenance Type`: Preventative Maintenance, Cleaning, Breakdown, Calibration, Repair, Other.
- Researchers remain subject to the same booking and access group rules as standard bookings.
- Cost breakdown and project association are hidden.
- Recurring options are hidden for maintenance bookings, even if recurrence is normally enabled.
- Maintenance bookings are priced as zero or displayed as `-`; no add-on charges apply.
- Reports and booking overviews must reflect zero-cost maintenance bookings.

## Booking notes

Notes support rich text, attachments, timestamps, role permissions, and email notifications.

### Notification toggle

- Toggle title: `Booking Notes` under Equipment notification settings.
- Default disabled.
- Visible/configurable for all roles except Core labs.
- Hidden/permanently disabled for Core labs.

Controlled notifications:

- New note added to bookings I created.
- New note added to bookings where I previously posted a note.
- Another user edited my note.
- Another user deleted my note.

### Attachments

Available in:

- Booking modal.
- View & Edit modal, Notes tab.
- Normal, Maintenance, and Workflow bookings.

Rules:

- Upload through rich text editor/native file dialog.
- Up to 10 attachments per note.
- Max 20 MB per file.
- Attachments can exist with or without note text.
- Supported images: `.jpeg`, `.jpg`, `.png`.
- Supported documents: `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ods`.
- Stored in Digital Ocean.
- Core labs cannot add new attachments; existing attachments remain accessible after downgrade.

### Note permissions

Edit permissions:

- Admins: edit all notes.
- Instructors: edit notes for equipment they manage.
- Users: edit own notes only.
- Core labs cannot edit notes.

Delete permissions:

- Admins: delete all notes.
- Instructors: delete notes for equipment they manage.
- Users: delete own notes only.
- Deleting a note removes content and attachments.
- Removing all content deletes the note.
- Core labs cannot delete notes.

Email rules:

- New-note emails go to booking creator and users who previously posted a note, excluding the note author.
- Edit/delete emails go to the original author only when another user edited/deleted the note.
- Email links open the relevant booking with Notes tab selected.

## Group Bookings

Group Bookings allow booking creators to invite participants to a booking.

Availability / gating:

- Trial, Premium, and Enterprise bundles.
- Lab setting in `Settings -> Advanced` must enable multiple users per booking.
- Individual Rules / Access Group Rules must enable: `Allow users (excluding guests) to invite others to their bookings?`
- Guests are excluded from creating Group Bookings.

Participant selection:

- Admins and instructors who can manage bookings can select all users and groups as participants, regardless of direct booking permission for the resource.
- Non-admin users can select only individual users who already have booking access to the resource.
- Guest users do not see Group Booking creation controls.

Creator-based rules:

```text
booking pricing = calculated from booking_creator access/profile/rules
booking validation = calculated from booking_creator access/profile/rules
participant access/pricing/rules = ignored for booking creation
```

Participation statuses:

- `pending`
- `accepted`
- `rejected`

Editing effects:

- If time/duration changes, all participant statuses reset to pending.
- New invitations are sent.
- A disclaimer warns the booking owner.
- If all participants are removed, booking reverts to a standard booking.

Invitation response:

- Invitees can accept or reject from booking pop-up or details modal.
- Reject flow can include optional reason; reason is emailed to creator.
- Invitees can reject even after previously accepting.
- Pending invite displays striped pattern.
- Accepted invite displays solid booking.
- Rejected invite becomes greyed out; invitee loses access to details and sees only occupied slot.

Conflict handling:

- Non-admin invitee cannot accept if they have an overlapping booking conflict; they must free the overlap first.
- Admins can accept invitations even if they have scheduling conflicts.

Admin/instructor behavior:

- Admins and instructors retain visibility and edit access according to their normal powers even if they decline participation.
- If an invited admin also needs to approve the booking, approval is separate from participation.
- Admin sees candy-cane approval pattern until approval, then is prompted to accept/reject participation.

Bookings List tab:

- Available for Group Bookings.
- Shows invitees grouped into Pending, Accepted, Rejected.
- Visible to creator, admins, instructors, and invitees except guests.
- Admins/instructors can see invitee access groups.
- Disappears if booking becomes standard again.

Notifications:

- Invitation emails sent as soon as participants are added.
- Cancellation/decline emails sent to invitees.
- Update emails sent and ask participants to reconfirm when duration changes.
- Rejection emails go to creator, optionally with reason.
- Invitee responses notify creator unless creator disabled that Equipment notification toggle.
- Core invitation/update notifications are mandatory and cannot be opted out.

Cost:

- Invitees are not charged for participating in another user's booking.

## Smart AI Scheduling / Workflow bookings

Workflow definitions let admins define a sequence of equipment usages and let users book the sequence as a single workflow.

Availability and scope:

- Trial, Premium, and Enterprise bundles.
- Admins manage workflow definitions.
- Instructors, Researchers, Students, and Guests can book workflows only when given access.
- Workflows exist only at lab level; organization/department admins must navigate into a lab.

### Workflow definition rules

A workflow definition consists of:

- Name.
- Equipment list.
- Duration per equipment.
- Access list.
- Canvas sequence/timeline.

Equipment tab:

- Workflow name is required.
- At least 2 equipment items are required.
- Equipment grid columns: Equipment, Room, Labels.
- Equipment and Room are sortable.
- Search suggestions are grouped into Search, Rooms, Labels.
- Selecting multiple labels applies AND logic.

Duration tab:

- Default duration is 1 hour per equipment.
- Max duration per equipment is 168 hours.
- Minutes are 0, 15, 30, or 45.
- Duration cannot be 0 hours and 0 minutes.
- At least 2 equipment items must remain; delete icon disabled at 2.

Access tab:

- A workflow can be created with no explicitly selected users.
- Admins can book all workflows by default.
- Access grid lists only Instructor, Researcher, Student, and Guest users who have access to book the equipment selected in step 1.
- If workflow equipment changes and a previously selected user lacks access to new equipment, that user is automatically deselected.

Critical booking-rule exception:

```text
when creating a workflow booking:
    ignore user booking rules
    ignore equipment booking rules
    check only calendar availability/conflicts
    apply pricing/project validations as described
```

Canvas rules:

- Defaults to a 24-hour timeline.
- Extends to nearest whole day for longer workflows.
- Max timeline length is 31 days.
- Placements snap to nearest 15-minute increment.
- Users can resize cards, drag/drop, remove cards, zoom, and add time by 1 hour or 1 day.
- Events cannot extend beyond 31 days.
- Saving trims unused time before first booking and orders booking definitions chronologically.
- Navigating away through app links prompts save/discard; browser Back/Reload, logout, Create Lab, and Join Lab do not block/save.

Edit/duplicate/delete:

- Only admins can create/edit/delete workflow definitions.
- Duplicating appends `(Copy)` and does not mutate the original.
- Deleting a workflow definition does not affect existing future bookings created from that workflow.

### Booking a workflow

Search modal:

- `Book time and date` is required.
- Default is today at nearest future 15-minute increment.
- Admins can select past dates.
- Other roles can select only future dates/times.
- Manual edits are not allowed; date picker required.
- Date/time formats follow user profile settings.

Availability algorithm:

- Checks whether the entire workflow can be booked from requested start.
- If possible, shows start/end and `Book` action.
- If not possible, suggests up to 3 closest available start times on the same day or up to 3 options on another day with the same start time.
- If no availability on selected day, only other-day suggestions are shown.
- For initial implementation, even admins cannot create overlapping workflow bookings; alternatives are suggested.
- If selected slot becomes unavailable before confirmation, show predefined conflict modal and return user to initial step.
- If start time passes before confirmation, use single-booking error handling.

Confirmation:

- Admins can book workflow on behalf of any active lab member, regardless of workflow access.
- Cost breakdown shows priced equipment only.
- Users can click equipment to view details or modify add-ons.
- Admins can disable mandatory add-ons.
- If lab has projects enabled, a Projects field applies to the entire workflow booking.
- Project selection is not mandatory for workflow bookings, even when other booking rules might normally require it.
- Funding code validations still apply: same type/source and 100% allocation.

Calendar behavior:

- Workflow bookings appear on Home My Booking calendar, Lab Dashboard, and Equipment Calendar.
- Own workflow bookings use distinct color and workflow icon.
- Another user's workflow booking appears as a normal booking without special coloring/icon.
- Schedule for today shows workflow color/icon; if a normal and workflow booking overlap, green slot appears with workflow icon overlay.

Editing/canceling workflow bookings:

- Only admins can edit workflow bookings.
- Non-admins and instructors cannot edit workflow bookings.
- Admin edit can change duration, projects, and notes.
- Non-admin users can cancel only their own entire workflow when no part of it is in the past and the first booking has not started.
- Instructors can cancel future workflow bookings or individual future bookings, but not past bookings.
- Admins can cancel their own or others' workflow bookings, including individual bookings within a workflow or the entire workflow, past or future.

## Parent/child equipment booking behavior

Parent equipment represents one logical instrument made of multiple bookable child units.

Rules:

- Parent is not bookable.
- Children are the actual bookable units.
- Equipment Overview shows only the parent row, not child rows.
- Parent row displays `Parent Name • Children X` where X is the number of visible children.
- For non-admin users, unavailable children are not counted.
- If all children are unavailable, non-admin users see only the parent name and the row is not selectable.
- Parent access/schedules/rules are used when booking children.
- Pricing and booking rules defined on parent apply 1:1 to each child; they are not split or scaled.
- Parent Calendar tab shows children and allows selecting one or more children for booking.
- Admins and instructors see all children; non-admin users do not see unavailable children.
- If all children are unavailable for a non-admin, Calendar tab is disabled and parent/child navigation redirects to Details.
- My Bookings and Bookings table display child bookings as `Child Name • Parent Name`.
- Report filters can include both parents and children; selecting a parent should include bookings for that equipment/children as supported by current reporting behavior.
