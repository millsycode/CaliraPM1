# Custom forms – reminder before booking end

## Product notes

- **Problem:** Admins and Instructors set a form to "required to be submitted before booking end". The booker's only email is the missed-submission email, sent after booking end plus the submission window. Customers say this warns people when the form is already late. Who has it: the booker (misses the deadline) and the Admin or Instructor who owns the form (chases missed forms).
- **Solution in disguise?** No. The need (warn before the deadline) matches the request (a reminder before booking end).
- **How we will know it works:** fewer missed-submission emails per required-before-end form after release. No baseline was pulled. Get the weekly count of `missed_form_submission` emails from Customer.io or BigQuery before release.
- **Push back on the label.** The second screenshot reads "Send a reminder to complete all outstanding forms X hours before the booking ends." The setting is per form, so two forms on one booking can have different values and send two separate emails. I recommend "Send a reminder to complete this form X hours before the booking ends." (Question in the front end story.)
- **Default:** 0 means off. Existing forms behave as today with no migration.
- **Cap and bounds:** 0 (off) or a whole number from 1 to 168. If the send time is before the booking starts, the reminder is still sent at the set time. If the send time has already passed when the booking is created or moved, the reminder is sent once, immediately, provided the booking has not ended.
- **Recipients and preferences:** the booker only. No opt-out. No in-app notification (same as the missed email).
- **Rollout:** recommend a Flipper flag around scheduling and sending only (the setting itself can be saved without it). Open question below. Rollback: switch the flag off. Pending reminder jobs then exit without sending.
- **Reporting and API:** no reporting change. The REST API change was not checked beyond a search for `graceful` in `app/controllers/external_api`, `app/lib/external_api` and `doc/external_api`, which found nothing. It exposes responses, not form settings.
- **Split:** four stories. The setting ships first, then scheduling and the email (back end), then the front end. Scheduling can ship dark (flag off) before the front end.

## Code findings (not for the ticket)

- Current behaviour: no reminder exists. `CustomForms::MissedSubmissionJob` (`app/jobs/custom_forms/missed_submission_job.rb`, `perform`) sends the missed email at `CustomForm#calculate_before_end_submission_deadline_for` (booking end plus `completion_graceful_period_in_hours`). `git log -S"missed_form_submission"` shows no reminder work. The earliest hits are 2025-11-13 notification-preference commits.
- Scheduling chain today: `AssetRequest#create_missed_submission_notification` and `#update_missed_submission_notification` (`app/models/asset_request.rb`, about lines 2408 to 2440) create one `ObjectEvent` (task `missed_form_submission`) at booking end. `ObjectEvent#schedule!` calls `AssetRequest#schedule_missed_form_submission`, which calls `CustomForms::ScheduleMissedSubmissionJob`. That job queues one `MissedSubmissionJob` per required form at its deadline. `ScheduleDailyEventsJob` only schedules events due tomorrow, and the model schedules immediately when the time is today.
- One event per booking: `ObjectEvent` validates `task_name` unique per eventable. The reminder needs its own task name (for example `custom_form_reminder`), and because X differs per form, its `execution_time` must be the earliest reminder time of the booking's required forms. Per-form jobs are queued from there. That is a design choice for the devs.
- Recurring bookings: `AssetRequest::BulkInsert` skips callbacks and calls `CustomForms::BulkScheduleMissedSubmissionJobs` (`app/jobs/custom_forms/bulk_schedule_missed_submission_jobs.rb`). The reminder must be added there too, or recurring bookings get no reminder.
- Skip rules to mirror: `MissedSubmissionJob#should_process?` skips when the lab does not support custom forms, the booking is `Request::TERMINATED_STATUSES` (cancelled, declined), or a `custom_form_inputs` row exists for the booking and form. It looks up forms with `CustomForm.required_before_booking_end.active`. Pending-approval bookings are not skipped today, so reminders would be sent for them too.
- Form selection: `AssetRequest#related_custom_forms` and `required_custom_forms_on(:booking_end)` also require `last_activated_at` before the earlier of end time and creation time.
- Delete response: `Mutations::CustomFormInputs::Delete` (`app/graphql/mutations/custom_form_inputs/delete.rb`) re-sends the missed email only when the deadline is past. No change is needed for "no resend after the reminder has passed". If a response is deleted before the reminder time, the scheduled reminder job finds no submission and sends.
- Setting storage: `custom_forms.completion_graceful_period_in_hours` (integer, default 0, `db/structure.sql` line 2206). Validated in `CustomForm` (>= 0, only when `completion_before_booking_end?`). Saved via `Mutations::CustomForms::Upsert` (`assign_attributes( params.except( :asset_ids, :id ) )`), exposed in `Types::CustomFormType`.
- Versioning: `CustomForm#create_version_if_changed` lists tracked attributes. `CustomFormHistory.build_snapshot` (`app/models/custom_form_history.rb`, around line 73) stores the snapshot. Both need the new field, or admin changes are not versioned. The version view `CustomFormVersionSettings.svelte` reads `formSnapshot.completion_graceful_period_in_hours` and must show the new value. Older snapshots will not have the key, so treat it as 0.
- Permissions: forms are managed by Admins and Instructors for equipment they manage. This is enforced in `Mutations::CustomForms::Upsert` (`context.authorize @custom_form, :update?`). No policy change.
- Emails: `CustomFormMailer` (`app/mailers/custom_form_mailer.rb`) has only `missed_submission`. `set_defaults` computes `@deadline` and the booking link, and can be reused. Template is `app/views/custom_form_mailer/missed_submission.html.erb`. Notifier classes: `EventNotifier::CustomForms::Customers::MissedSubmission` (recipients: `User.where( id: asset_request.requested_by )`, channel `:non_toggable`) and `Providers::MissedSubmission` (Admins, toggleable). A new event needs a Distributor mapping (`EVENT_TO_NOTIFIER_CLASSES_MAPPING` in `app/lib/event_notifier/distributor.rb`) with only the Customers class.
- Front end: `CustomFormSettings.svelte` shows the "Extend the form submission window?" block (`DurationSelector`, `completionGracefulPeriodInHours`) only for the before-end option. `changeCompletionOption` and `resetCompletionRequirement` reset the window to 0, and the new field must reset the same way. State lives in `CustomFormEdit/state.svelte.js` and `CustomFormsEdit.svelte`. GraphQL operations are in `custom-forms/graphql/custom-forms-mutations.js` and `custom-forms-queries.js`.
- Risks and gaps:
  - Recurring series: if the first instances fall inside the reminder window, creating the series sends several immediate reminders. Decide whether to send one per booking or batch them.
  - Idempotency: `update_missed_submission_notification` re-runs on every end time or status change. Without a sent marker per booking and form, a moved booking could send the reminder twice.
  - Form edits: `ObjectEvent#execution_time` is stored per booking, so changing X on the form does not move existing events by itself. A recompute job is needed (see back end story 2).
  - Volume: `ScheduleDailyEventsJob` only schedules events due tomorrow. A 168-hour reminder is fine, because the event is created at booking time and picked up the day before.
  - Time zones: all times are computed from the stored `end_time` (UTC), so no DST issue is expected. Not tested.
  - Spec coverage exists for the missed job, event notifier and `CustomForm` (`spec/jobs/custom_forms/`, `spec/lib/event_notifier/custom_forms/`, `spec/models/custom_form_spec.rb`) and can be copied.
- Context files out of date: none found. `context/custom_forms.md` does not describe `ObjectEvent` scheduling, which is not wrong. It will need a new section on reminders after release.

---

## Story 1: Custom forms – Reminder setting (back end)

> As an Admin/Instructor, I want to set how many hours before a booking ends the user is reminded to complete a required form, so that users are warned before the form is late.

---

## Acceptance Criteria:
- [ ] A new integer attribute will be added to custom forms to hold the reminder time in hours before booking end. Proposed name: `completion_reminder_in_hours`. Default 0.
- [ ] 0 means no reminder is sent. Existing forms will have 0 after the migration and behave as today.
- [ ] The value will be validated as a whole number from 0 to 168 when the form's completion requirement is "required before booking end".
- [ ] The value will be rejected with an error when it is negative, not a whole number, or greater than 168. The error message is shown to the user as per the existing form error pattern. Message copy TBC (see Notes).
- [ ] When the completion requirement is not "required before booking end" the value will be saved as 0. A value sent for any other requirement is ignored.
- [ ] `CustomFormsUpsert` will accept the new argument as optional. Omitting it on update will not change the saved value.
- [ ] `CustomFormType` will return the new field.
- [ ] A change to the reminder value on a form that has versioning enabled will create a new form version, as for the submission window.
- [ ] The form version snapshot (`form_snapshot`) will include the reminder value. Snapshots created before this change will be treated as 0.
- [ ] No GraphQL change is needed to the existing submission window argument and its behaviour will not change.
- [ ] Permissions are unchanged: only users who can update the form can change the value.
- [ ] Specs added for the validation, the Upsert mutation and version creation.

## Notes:
- Question: should the reminder be allowed to be longer than the booking? Your answer (5) was yes, send at the set time even if that is before the booking starts. No validation against booking length is needed.
- Question: error message copy. Suggested for a value outside the range: "This field must be a whole number between 0 and 168." Existing front end messages are "This field must be equal to or greater than 0" and "This field must be a whole number".
- Depends on: none. Ships first.

## Design:
TBC

## Additional requirements clarified during development:

## Additional Info:
- [Definition of Done](https://clustermarket1.atlassian.net/wiki/spaces/PD/pages/27721779/Definition+of+Done)

/confidential

---

## Story 2: Custom forms – Schedule and send form reminders (back end)

> As a user with a booking that has a required before-end form, I want to be reminded before the booking ends, so that I submit the form on time.

---

## Acceptance Criteria:
- [ ] A reminder email will be sent to the booker (`asset_request.requested_by`) at (booking end time minus the form's reminder hours) when all of the following are true:
  - the form is active and set to "required before booking end"
  - the reminder value is 1 or more
  - the lab supports custom forms
  - the booking is not cancelled or declined
  - no response has been submitted for that booking and form
- [ ] The reminder is sent once per booking and form.
- [ ] The reminder is sent only to the booker. Admins, Instructors and booking participants will not receive it.
- [ ] A form with a reminder value of 0 will not send a reminder.
- [ ] Each form sends its own reminder, at its own time. Two forms on the same booking with different values will send two emails at two times.
- [ ] If the reminder time is already past when the booking is created or updated and the booking end time is still in the future, the reminder will be sent once, immediately.
- [ ] If the booking end time has passed, no reminder will be sent.
- [ ] If the reminder time is before the booking start time, the reminder will still be sent at the reminder time.
- [ ] If the booking end time changes, the pending reminder will be rescheduled to the new end time minus the reminder hours.
- [ ] If the booking is cancelled or declined, the pending reminder will be cancelled.
- [ ] If a response is submitted before the reminder time, no reminder will be sent.
- [ ] If a response is deleted before the reminder time, the reminder will be sent at the reminder time.
- [ ] If a response is deleted after the reminder time and before the deadline, no reminder will be sent. The missed-submission behaviour is unchanged.
- [ ] If the form is deactivated or deleted before the reminder is sent, no reminder will be sent.
- [ ] If an Admin or Instructor changes the reminder value on a form, or the form's completion requirement or status, reminders for existing future bookings of that form's equipment (bookings not yet ended, not cancelled or declined) will be recalculated in the background.
- [ ] A reminder already sent will not be sent again when the reminder value is changed.
- [ ] Recurring bookings created in bulk will have reminders scheduled as for single bookings, as `BulkScheduleMissedSubmissionJobs` does for missed submissions.
- [ ] The existing missed-submission email and its timing are unchanged.
- [ ] Sending and scheduling is gated by a feature flag (name TBC). With the flag off, no reminder is sent and any queued reminder job exits without sending.
- [ ] No in-app notification is created. The reminder is email only.
- [ ] Failures are reported to Sentry, as for the missed-submission jobs.
- [ ] Specs added for each rule above.

## Notes:
- Depends on: Story 1.
- Suggested approach (devs may choose otherwise): a new `ObjectEvent` task name per booking with `execution_time` at the earliest reminder time among its forms, then a job that queues one reminder job per form, mirroring `ScheduleMissedSubmissionJob` and `MissedSubmissionJob`.
- Question: the sent marker. To stop a second reminder after the booking is moved, we need to record that a reminder was sent for each booking and form. Recommendation: if the booking end moves later and the new reminder time is in the future, send again once. Alternative: never send a second reminder for the same booking and form. Which do you want?
- Question: recurring series. If 20 instances are created and 3 fall inside the reminder window, the booker receives 3 immediate emails at once. Is that acceptable, or should we cap it (for example only the next instance)?
- Question: pending-approval bookings. Missed emails are sent for them today, so the reminder would too. Confirm.
- Question: feature flag. Do you want a flag around scheduling and sending (recommended)?
- Question: is any rate limit or batching needed for forms attached to many bookings when X changes? Number of future bookings affected is not known. Check with data before release.

## Design:
N/A

## Additional requirements clarified during development:

## Additional Info:
- [Definition of Done](https://clustermarket1.atlassian.net/wiki/spaces/PD/pages/27721779/Definition+of+Done)

/confidential

---

## Story 3: Custom forms – Reminder email (back end)

> As a user with a required before-end form, I want a clear reminder email, so that I know which form is due and when.

---

## Acceptance Criteria:
- [ ] A new email `form_submission_reminder` will be added to `CustomFormMailer`, separate from the missed-submission email.
- [ ] A new event `form_submission_reminder` will be added to `EventNotifier::Distributor`, mapped to a Customers notifier only.
- [ ] The email will be sent to the booker only. It is not toggable in notification preferences and creates no in-app notification.
- [ ] Subject: "Upcoming form submission for booking <booking reference>".
- [ ] Body, as the missed-submission email with the wording changed:

  Dear <recipient name>,

  You have an upcoming required form submission for this booking:

  **Booking Details:**
  - Equipment: <equipment name>
  - Room: <room, or "N/A">
  - Booking reference: <reference>
  - Start time: <start time>
  - End time: <end time>

  **Upcoming form submission:**
  - <form name> - due <deadline>

  Please click the link to view the booking: View Booking

- [ ] "due" will show the form's submission deadline (booking end plus the submission window), formatted as in the missed-submission email.
- [ ] The link opens the booking with the Forms tab shown, as the missed-submission email does.
- [ ] Specs added for the mailer, the notifier and the recipient.

## Notes:
- Depends on: Story 2 sends it. The mailer can be built in parallel.
- Question: confirm the body wording. The intro line "You have an upcoming required form submission for this booking:" is my draft. Original is "The following required form was not submitted by the deadline for this booking:".
- Question: should the deadline be shown if it is the same as booking end (window 0)? Recommendation: yes, always show it.

## Design:
N/A

## Additional requirements clarified during development:

## Additional Info:
- [Definition of Done](https://clustermarket1.atlassian.net/wiki/spaces/PD/pages/27721779/Definition+of+Done)

/confidential

---

## Story 4: Custom forms – Reminder setting in form settings (front end)

> As an Admin/Instructor, I want to set a reminder time before the booking ends when I require a form before booking end, so that users are warned before the form is late.

---

## Acceptance Criteria:
- [ ] User shall see a "Send an email reminder?" field in the form settings modal, below "Extend the form submission window?", only when "This form is required to be submitted before booking end." is selected.
- [ ] The field uses the same hour input as the submission window, as per design.
- [ ] Helper text: "Send a reminder to complete this form X hours before the booking ends." (wording TBC, see Notes).
- [ ] Default value is 0 and the placeholder is 0.
- [ ] User will be able to enter a whole number from 0 to 168. 0 means no reminder.
- [ ] If the value is negative, not a whole number or above 168, an error is shown below the field and the form cannot be saved: "This field must be a whole number between 0 and 168."
- [ ] The field is hidden when another option or "Require users to complete this form" is switched off. The value is reset to 0, as the submission window is today.
- [ ] The saved value is shown when an existing form is opened for editing.
- [ ] The saved value is sent when the form is created or updated (`Next` and `Update`).
- [ ] The form version history settings view will show the reminder value, for example "2 hours". It will show "None" or an equivalent when the value is 0 or missing in older versions (copy TBC).
- [ ] The field works on mobile and with keyboard and screen reader as for the existing submission window field (label linked to the input, error announced).
- [ ] Front end specs and the Storybook story for the settings are updated.

## Notes:
- Depends on: Story 1 (the field is saved through the Upsert mutation). The reminder only takes effect after Story 2 and Story 3.
- Question: the second screenshot says "all outstanding forms". The setting is per form, so I suggest "this form". Confirm the wording with the designer.
- Question: should the field show a hint of the resulting time when the submission window is set (for example "Reminder is sent before the booking ends, not before the deadline")? Not required.

## Design:
TBC (second screenshot supplied in the request)

## Additional requirements clarified during development:

## Additional Info:
- [Definition of Done](https://clustermarket1.atlassian.net/wiki/spaces/PD/pages/27721779/Definition+of+Done)

/confidential

---

## Suggested labels

Custom forms feature label (TBC), back end and front end labels as per team convention (TBC), feature flag label (TBC). I have not checked the exact label names in GitLab.
