# Custom Forms Business Rules

## Purpose

Custom Forms allow labs to collect structured information as part of the equipment booking lifecycle. Forms can be used for operational, compliance, maintenance, safety, experiment, usage-log, and post-booking documentation workflows.

Forms are associated with equipment. A user only sees a form when the booking contains equipment linked to that form.

## Availability and enablement

- Custom Forms are available only to Premium and Enterprise customers.
- Custom Forms are not available to Core customers.
- The feature is enabled per lab.
- To enable Custom Forms, an Admin must turn on the Custom Forms toggle in `Lab Settings -> Advanced` and save changes.
- When enabled for a lab:
  - A `Custom Forms` navigation item appears for Admins and Instructors.
  - Booking workflows check for forms associated with selected equipment.
  - A booking `Forms` tab can appear when bookings contain associated forms.
  - Missed-submission notification settings become available.
- When Custom Forms are disabled for a lab:
  - The booking `Forms` tab is hidden.
  - Missed-submission emails are not sent.

## User roles and permissions

### Admins

Admins can:

- Enable the feature at lab level.
- Create and edit forms.
- Activate and deactivate forms.
- Associate forms with any active equipment in the lab.
- Complete assigned forms.
- View the booking `Forms` tab.
- View `Equipment Details -> Forms` for equipment in the lab.
- Review submitted responses.
- Edit submitted responses.
- Delete supported responses.
- Download submitted responses as PDF.
- Review version history.
- Receive missed-submission emails for all missed submissions in the lab, unless notification settings suppress emails for other users' bookings.

### Instructors

Instructors can:

- Create and edit forms only for equipment they are allowed to manage.
- Activate and deactivate forms only for manageable equipment.
- Complete assigned forms.
- View the booking `Forms` tab only when they manage the booking equipment.
- View `Equipment Details -> Forms` only for manageable equipment.
- Review submitted responses for manageable equipment.
- Edit submitted responses for manageable equipment.
- Delete supported responses for manageable equipment.
- Download submitted responses as PDF where available.
- Review version history for forms they can access.
- Receive missed-submission emails for equipment they manage, unless notification settings suppress emails for other users' bookings.

Instructors can edit an existing form only when the form is linked entirely to equipment they manage.

### Standard users / booking users

Standard users can:

- Complete forms assigned to their bookings.
- View the booking `Forms` tab for their own bookings only.
- Edit their own submitted responses only when the form setting allows users to edit responses.
- Receive missed-submission emails for their own bookings only.

Standard users cannot:

- Create, edit, activate, or deactivate forms.
- View `Equipment Details -> Forms`.
- Delete responses.
- Manage responses for other users' bookings.

## Form lifecycle and overview

- Admins and Instructors manage forms from the `Custom Forms` area in the side navigation.
- The Custom Forms overview displays all forms configured in the lab.
- Forms are displayed alphabetically by default.
- If no forms exist, an empty state prompts users to create the first form.
- The overview table includes:
  - Form name
  - Booking type
  - Creation date
  - Last updated date
  - Associated equipment
  - Number of entries
  - Actions
- Users with access can:
  - Search forms by name.
  - Sort table columns.
  - Navigate paginated results.
  - Open forms for editing.
  - Open form responses.
  - Open version history.

## Creating a form

A form is created through the Custom Forms area:

1. Open `Custom Forms` from the side navigation.
2. Click `Create Form`.
3. Complete the Form Settings modal.
4. Click `Next` to open the Form Builder.

A form cannot be activated unless it contains at least one input field. Informational paragraph elements do not count as response input fields.

## Form settings

### Form name

- Form name is required.
- Maximum length is 200 characters.

### Booking type

A form can apply to:

- All booking types.
- Standard bookings only.
- Maintenance bookings only.

The booking type setting controls which booking workflows should evaluate and display the form.

### Equipment selection

- A form can be associated with one or more equipment items.
- Users only see forms that apply to equipment included in their booking.
- Admins can select from all active equipment.
- Instructors can select only equipment they are allowed to manage.
- The equipment selector supports:
  - Search
  - Sorting
  - Multi-select
  - Bulk selection

## Form behavior settings

### Allow users to edit their responses

- When enabled, booking users can reopen and edit submitted responses.
- When disabled, booking users cannot edit submitted responses after submission.
- Admins and managing Instructors can edit responses regardless of this setting.

### Require users to complete this form

- When enabled, the form becomes mandatory.
- Required forms can be configured for one of two workflows:
  - Required during booking creation.
  - Required before booking end.

### Submission window

- Submission window applies only to forms required before booking end.
- The submission window is configured in hours.
- Values must be whole numbers.
- Default value is `0`.
- The submission deadline is the booking end time plus the configured submission window.

## Required form workflows

### Required during booking creation

A form required during booking creation must be completed before the booking can be submitted.

Business rules:

- The booking flow displays a `Forms required for booking` section when applicable forms exist.
- Users must complete all mandatory forms before submitting the booking.
- If a required form is incomplete, the booking cannot be created.
- The validation message is: `This form is required to proceed with booking.`
- Each equipment item can generate its own required form instance.
- For recurring bookings, responses completed during booking creation are copied to future generated bookings.
- Responses required during booking creation cannot be deleted from the Responses view.

Use this workflow when information is needed before booking approval or creation, such as safety confirmations, experiment approvals, pre-booking checklists, or compliance acknowledgements.

### Required before booking end

A form required before booking end is completed during or after the booking rather than during booking creation.

Business rules:

- Users can complete the form during the booking.
- Users can complete the form after the booking end time if still within the configured submission window.
- The form remains available for late completion after the deadline passes.
- If the form remains incomplete after booking end plus the submission window, it enters missed-submission state.
- Missed-submission emails are triggered when the form enters missed-submission state.
- Users can still complete the form after it has been marked missed.
- If a submitted response is deleted after the deadline, the form returns to incomplete state, the missed-submission state appears again, and missed-submission emails are triggered again.

Use this workflow for experiment outcome reports, maintenance completion records, equipment usage logs, and post-booking documentation.

## Form builder

The Form Builder is used to create and configure form fields.

The builder contains:

- A left-side configuration panel.
- A right-side live preview.

The preview updates in real time and shows how the form will appear to end users.

## Common field properties

Most interactive field types support the following properties.

### Label

- Defines the visible field title shown to users.
- Maximum length is 100 characters.

### Helper text

- Optional guidance displayed below the label.
- Maximum length is 200 characters.
- Typical uses include formatting instructions, data-entry guidance, examples, and compliance notes.

### Required toggle

- Controls whether the user must complete the field before submitting the form.
- When enabled:
  - Submission validation is enforced.
  - The `Optional` indicator is removed.
- Paragraph fields are read-only and are not affected by required settings.

## Supported field types

### Short Text

Use for short single-line responses such as sample IDs, reference numbers, experiment names, or operator initials.

Business behavior:

- Displays a single-line text input.
- Best suited for compact structured responses.

### Long Text

Use for detailed written responses such as experiment notes, maintenance comments, safety explanations, or incident descriptions.

Business behavior:

- Displays a multi-line textarea.
- Supports longer free-text responses.

### Paragraph

Use for informational text that does not collect a response, such as instructions, SOP guidance, compliance notes, or section introductions.

Business behavior:

- Read-only.
- Does not collect a response.
- Not affected by required settings.
- Does not count as an input field for form activation.

### Number

Use for numeric values such as counts, durations, temperatures, or concentrations.

Business behavior:

- Accepts numeric values only.
- Invalid values trigger validation.

### Value & Unit

Use for measurement-based responses such as volume, mass, temperature, or other measured values.

Business behavior:

- Includes separate value and unit inputs.
- Displays both inputs together in preview and submission views.

### Date & Time

Use for temporal information such as calibration dates, experiment timestamps, or maintenance completion times.

Business behavior:

- Displays date and time picker controls.

### Radio Buttons

Use for single-choice questions such as yes/no questions, status selections, or single-choice workflows.

Business behavior:

- Supports one selected option only.

### Dropdown

Use for compact single-select lists such as controlled vocabularies, equipment states, or standardized categories.

Business behavior:

- Supports one selected option only.
- Displays options as a dropdown menu.

### Checkbox

Use for multi-select confirmations such as safety confirmations, multi-condition acknowledgements, or checklist workflows.

Business behavior:

- Supports multiple selections.

### Image Upload

Use for image evidence such as equipment condition photos, experiment setup images, or maintenance evidence.

### File Upload

Use for supporting files such as SOP documents, calibration certificates, or experimental data exports.

## Field validation and limits

- Form name limit: 200 characters.
- Submission window: whole numbers only.
- Field label limit: 100 characters.
- Helper text limit: 200 characters.
- Validation messages appear immediately in the builder when:
  - Required fields are empty.
  - Character limits are exceeded.
  - Invalid numeric values are entered.

## Managing form elements

Within the builder, users can:

- Add fields.
- Edit field settings.
- Reorder fields.
- Duplicate fields.
- Delete fields.
- Preview changes in real time.

## Editing existing forms

Admins and eligible Instructors can edit existing forms.

Editable properties include:

- Form settings.
- Equipment assignments.
- Booking type.
- Required settings.
- Submission window.
- Field configuration.
- Field ordering.

Changes are saved by clicking `Update`.

Historical responses remain linked to the form version used when the response was originally submitted.

## Booking workflow experience

Custom Forms integrate into the booking workflow when a booking contains equipment associated with active forms.

### Booking Forms tab visibility

A booking can include a dedicated `Forms` tab inside the View & Edit booking modal.

The `Forms` tab is visible to:

- Booking creators.
- Admins.
- Instructors who can manage the booking equipment.

The `Forms` tab is hidden from:

- Booking participants.
- Users without equipment management access.
- Bookings without associated forms.
- Labs where Custom Forms are disabled.

The `Forms` tab remains visible even when the booking itself is no longer editable.

### Forms tab layout

Forms are grouped into:

- Required forms.
- Optional forms.

Each form row displays:

- Form name.
- Equipment name.
- Submission state.
- Submission timing information.
- Available actions.

### Form states

- `Submitted`: displayed with `Submitted on: [Date] • [Time]`.
- `Required before end`: displayed with `Submit before: [Date] • [Time]`.
- `Missed`: displayed with `Submission missed: [Date] • [Time]`.

### Available booking form actions

Depending on permissions and form settings, users can:

- Complete forms.
- Edit submitted responses.
- Preview submitted responses.
- Download submitted responses as PDF.
- Delete responses.

## Viewing, editing, and downloading responses

Completed responses can be opened from:

- Booking `Forms` tab.
- Responses Overview.
- `Equipment Details -> Forms` tab.

The response preview displays:

- Form name.
- Booking reference.
- Booking duration.
- Submitted by.
- Submission date and time.
- Submitted field values.
- Uploaded files and images.

Completed responses can be downloaded as PDF from supported response views.

When a response is edited:

- The original submitted form version is used.
- Historical responses are not automatically upgraded to newer form versions.

## Missed submissions and notifications

### Missed-submission state

A required-before-end form enters missed-submission state when it remains incomplete after the booking end time and any configured submission window.

When a form is missed:

- The booking displays a missed-submission alert.
- The form row displays a red warning icon.
- Users see `Submission missed: [Date] • [Time]`.
- A separate email is sent for each missed form submission.

### Notification channels

Missed submissions trigger email notifications only.

Missed submissions do not create:

- In-app notifications.
- Notification-centre alerts.
- Banner notifications.

### Notification recipients

- Admins receive notifications for all missed submissions in the lab.
- Instructors receive notifications for missed submissions on equipment they manage.
- Standard users receive notifications for missed submissions on their own bookings only.

Admins and Instructors can disable missed-submission emails for other users' bookings from Notification Settings. They still receive notifications for their own bookings.

Missed-submission emails are not sent when:

- Custom Forms are disabled.
- The booking has been deleted.
- The booking has been cancelled.
- The form has been deleted.

## Equipment Details Forms tab

Equipment Details pages include a dedicated `Forms` tab.

Business rules:

- The tab is available to Admins and Instructors who manage the equipment.
- Standard users cannot view this tab.
- The tab allows eligible users to review responses associated with that equipment.

The Equipment Details Forms table includes:

- User.
- Form name.
- Form version.
- Submission date.
- Booking reference.

Available actions include:

- Search responses.
- Sort columns.
- Navigate paginated results.
- Open response previews.
- Open related bookings.
- Delete responses.

## Responses Overview

Each form includes a dedicated Responses view.

To access it:

1. Open `Custom Forms` from the side navigation.
2. Locate the form in the forms overview table.
3. Open the form.
4. Navigate to the `Responses` tab.

The Responses view opens all submitted responses associated with that form.

Eligible Admins and Instructors can:

- Review submitted responses.
- Search responses.
- Sort response data.
- Preview submissions.
- Delete supported responses.

Responses required during booking creation cannot be deleted.

## Version history

Custom Forms maintain version history for auditability.

To access version history:

1. Open `Custom Forms` from the side navigation.
2. Locate the form in the forms overview table.
3. Open the form.
4. Navigate to the `Version History` tab.

The Version History view displays saved historical versions of the selected form.

Eligible users can:

- View previous versions.
- Preview historical versions.
- Review historical settings.
- Review the number of entries linked to each version.

Historical responses remain linked to the version used when the response was originally submitted.

## Troubleshooting rules

### User cannot see Custom Forms

Check that:

- The feature is enabled in Lab Settings.
- The subscription includes Custom Forms.
- The user role has access to the feature.

### User cannot edit a form

Likely causes:

- The user does not manage all associated equipment.
- The user has insufficient permissions.

### Users cannot submit forms

Check that:

- The form is active.
- The form is associated with the correct equipment.
- Required settings are configured correctly.
- Required forms have been completed.

## Implementation-oriented invariants

These rules should be preserved when implementing or modifying Custom Forms behavior:

- Form visibility is equipment-driven: only forms associated with equipment in the booking should appear.
- Lab-level feature enablement gates the entire feature surface.
- Subscription bundle must be checked before exposing or enabling the feature.
- Instructor access must be scoped to manageable equipment.
- Instructors must not edit forms that include any equipment they do not manage.
- Standard users must not manage forms or delete responses.
- Booking creation must be blocked when a required-during-booking-creation form is incomplete.
- Required-before-end forms must not block booking creation.
- Required-before-end forms must remain completable after the deadline.
- Missed submissions generate email notifications only.
- Missed-submission emails are per missed form submission, not per booking.
- Deleting a late response should return the form to missed-submission state and retrigger missed-submission emails.
- Submitted responses must remain tied to the form version used at submission time.
- Editing a response must use the original submitted form version.
- Historical responses must not be automatically migrated to newer form versions.
- Required-at-booking-creation responses cannot be deleted from the Responses view.
- The booking Forms tab can remain visible even when the booking is no longer editable.

