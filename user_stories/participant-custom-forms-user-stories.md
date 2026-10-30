# Booking participants can complete Custom Forms

**Customer request:** Let booking participants complete and edit custom forms that must be done *during or after* a booking, not only the booking creator.
**Source docs:** `Custom+Forms.docx` (current behaviour) and a review of `app-clustermarket`.

---

## 1. Agreed business rules

| # | Rule |
|---|------|
| BR1 | **Participant** = a user with an **accepted** `BookingInvitation` on the booking, other than the requester. Pending and rejected invitees get no new access. |
| BR2 | **Lab-level setting** "Allow booking participants to complete forms", in Lab Settings → Advanced. Default **OFF**. Only visible and effective when Custom Forms is enabled for the lab. Admin only. When OFF, behaviour is exactly as today (participants don't see the Forms tab). |
| BR3 | **Complete/edit scope:** participants can complete and edit **required before-end** forms and **optional** forms (no completion requirement). |
| BR4 | **On-creation and once-on-creation forms** are listed to participants **read-only** (preview and PDF only). No complete or edit action. |
| BR5 | **One shared response** per form per booking (unchanged). The first submission wins. Anyone else who tries to submit gets "already submitted" and is shown the existing response. |
| BR6 | **Editing a submitted response:** participants follow the form's existing "Allow users to edit their responses" setting. Admins and managing instructors can always edit. Last save wins. |
| BR7 | **Viewing:** participants can preview any response on the booking and download it as PDF. Preview shows "Submitted by" (the participant or requester who submitted it). |
| BR8 | **Deleting** responses is unchanged: admins and managing instructors only. |
| BR9 | **Timing** is the same as for the requester: any time after the booking exists, including before start and after the submission deadline (late completion). Blocked for cancelled/declined bookings. |
| BR10 | **Participant leaves** (rejects or is removed): their response stays on the booking with their name as "Submitted by". They lose all access to the booking's forms. |
| BR11 | **Missed-submission email** is also sent to **accepted participants** of the booking, in addition to current recipients. Participants cannot opt out (non-toggable channel, same as the requester). Admin/instructor opt-out for other users' bookings is unchanged. Recipients are worked out when the email is sent. |
| BR12 | **Security fix included:** `CustomFormInputPolicy#update?` currently doesn't compare the requester to the current user, so any user with a response ID can edit it when user edits are allowed. It must check actual permission. |

### Assumptions to confirm (not yet asked)
- A1. Turning the setting OFF after participants have submitted leaves existing responses intact; participants simply lose access.
- A2. Recurring bookings: before-end responses are not copied to future bookings (existing behaviour). Participant rules apply independently on each occurrence.
- A3. Simultaneous editing is "last save wins" with no locking or warning.
- A4. The missed-submission email wording needs no change (it refers to the booking and the form).
- A5. Participants' unsubmitted drafts are not saved server-side (matches today).

### Out of scope
- Per-participant responses; per-form participant settings; a participant opt-out preference; participants deleting responses; in-app notifications for missed submissions.

---

## 2. Epic

**Participant form completion** — Group-booking participants can complete, view and edit custom forms on bookings they have accepted, when the lab has enabled it.

**Suggested delivery order:** S1 → S3 → S4 → S5 → (S2, S6 in parallel) → S7 → S8 → S9 → S10 → S11 → S12 → S13.
Every FE story depends on its BE story. FE and BE are split as the team requires.

---

## 3. Stories

### S1 — [BE] Lab setting to allow participants to complete forms
**As a** lab admin, **I want** a lab-level setting controlling whether booking participants can complete custom forms, **so that** I decide when this behaviour is switched on for my lab.

**Acceptance criteria**
- A new boolean account/lab setting exists, default `false`, for all existing and new labs (migration with a safe default).
- It can be read and updated through the GraphQL account settings API (follow the pattern of the existing Custom Forms setting).
- Only admins can change it; instructors and standard users are refused with a permission error.
- The update is refused (or ignored) if the lab does not support Custom Forms (not Premium/Enterprise, or the feature is off).
- Turning it off does not delete any data.
- Helper `account.participants_can_complete_custom_forms?` (name indicative) returns `true` only when Custom Forms is supported **and** the setting is on.
- Specs cover default, permission and gating.

**Notes:** Depends on nothing. Foundation for S3–S5 and S11.

---

### S2 — [FE] Setting toggle in Lab Settings → Advanced
**As a** lab admin, **I want** a toggle "Allow booking participants to complete forms" beside the Custom Forms toggle, **so that** I can turn the behaviour on or off.

**Acceptance criteria**
- The toggle appears under Lab Settings → Advanced only when the Custom Forms toggle is on and the lab's plan includes it.
- It is off by default and saves with the rest of the page ("Save changes").
- Helper text explains: only accepted participants of a booking; forms follow the form's own edit rule; responses are shared.
- If Custom Forms is turned off, the participant toggle is hidden (its saved value is kept).
- Instructors and standard users never see it.
- Component spec/Storybook story added; accessible label and keyboard operation.

**Depends on:** S1.

---

### S3 — [BE] Authorise participants to submit a form response
**As an** accepted participant, **I want** the system to let me submit a form on my booking, **so that** I can complete the required information.

**Acceptance criteria**
- `ManagePostUsageCustomFormInput` (create path) allows a user when: lab setting on (S1), user is an **accepted** invitee of the booking, the form is a **before-end or optional** form for that booking, and the booking is not cancelled/declined.
- Requester, admin and managing-instructor behaviour is unchanged.
- Refused with a clear error for: pending or rejected invitees, users not on the booking, on-creation / once-on-creation forms, setting off, cancelled/declined bookings.
- The existing duplicate check is kept: if a response for that form already exists on the booking, the call returns a distinct "already submitted" error (not a generic failure) and no second record is created. Two simultaneous submissions result in exactly one record.
- The saved `CustomFormInput.user_id` is the submitting participant.
- No time-based restriction: submission is allowed before start, during, after the end and after the deadline (BR9).
- The missed-submission job still sees the form as submitted once the participant saves, so no email is sent afterwards.
- Policy and mutation specs cover each case above.

**Depends on:** S1.

---

### S4 — [BE] Participant editing and the authorisation fix
**As a** product owner, **I want** editing rights to be checked against the real user, **so that** only permitted people change a response.

**Acceptance criteria**
- `CustomFormInputPolicy#update?` allows: admin; managing instructor; the **requester** or an **accepted participant** of that booking when the form has "Allow users to edit their responses" on **and** (for participants) the lab setting is on.
- Any other user (other bookings' participants, standard users, pending/rejected invitees) is refused. This closes the existing gap where any user could update when edits are allowed (BR12).
- Participants cannot edit responses on on-creation / once-on-creation forms.
- Edits keep the original submitted form version (existing behaviour); `user_id` of the original submitter is not overwritten, and the last-edited details still follow current behaviour.
- Edit is blocked on cancelled/declined bookings for participants.
- Regression specs prove the original bug (another user editing with a known ID) is refused.

**Depends on:** S1, S3 (shared helpers).

---

### S5 — [BE] Booking GraphQL exposes what the current user may do
**As a** front-end developer, **I want** the booking API to say, per form, whether the current user can complete, edit, and view, **so that** the UI never has to guess permissions.

**Acceptance criteria**
- `review_custom_forms?` returns `true` for an accepted participant only when the lab setting is on (when off, behaviour is as today for the Forms tab; accepted participants remain unaffected elsewhere).
- Each item returned by `customForms` gains `canComplete` and `canEdit` booleans calculated from the same policies as S3 and S4 (so UI and API cannot disagree).
- The booking exposes a boolean such as `canViewCustomForms` (or equivalent) so the front end can show the tab without relying on `ownBooking` or `asset.owner`.
- Accepted participants can fetch a single response (`customFormInput`) including `submittedBy`, and its values, for any form in their list, including on-creation forms (read-only).
- Pending/rejected invitees and uninvolved users receive an empty list / authorisation error.
- Performance: no N+1 queries added when listing forms for a booking (check the `CustomFormsQuery` result).
- `schema.graphql` and `graphql.types.ts` regenerated.

**Depends on:** S1, S3, S4.

---

### S6 — [FE] Forms tab visible to accepted participants
**As an** accepted participant, **I want** to see the Forms tab on my booking, **so that** I can find forms that need completing.

**Acceptance criteria**
- `shouldShowForms` in `BookingEditModal.svelte` uses the new API flag (S5) instead of `ownBooking || asset.owner`.
- The tab appears only if the lab setting is on, the user is an accepted participant, and the booking has forms.
- The tab remains visible when the booking is no longer editable (same as today).
- The tab is hidden for pending/rejected invitees and when the setting is off.
- Forms are grouped under "Required forms" and "Optional forms" with form name, equipment name, state and timing text exactly as for the requester.
- On-creation and once-on-creation forms are listed with state only (read-only).
- Component tests updated; no regression for requester/admin/instructor.

**Depends on:** S5.

---

### S7 — [FE] Participant completes a form
**As an** accepted participant, **I want** to complete a pending form from the Forms tab, **so that** the booking's requirement is met without asking the requester.

**Acceptance criteria**
- A "Complete" action shows only on forms where `canComplete` is true.
- The form opens as it does for the requester, with validation, required fields, file and image uploads.
- On successful submit the row changes to "Submitted on: [date] • [time]" and the booking's missed-submission alert refreshes (existing `bookingupdated` event).
- If someone else submitted first, the participant sees a clear message ("This form has already been submitted") and the row refreshes to the submitted state with the existing response.
- Other errors (setting turned off, lost access, cancelled booking) show a user-visible message, not only a console log.
- Analytics events (`cfResponseStarted`, `cfResponseCompleted`) fire as they do today.
- Works at mobile widths and with the keyboard.

**Depends on:** S3, S5, S6.

---

### S8 — [FE] Participant edits a submitted response
**As an** accepted participant, **I want** to edit a submitted response when the form allows it, **so that** I can correct or add details.

**Acceptance criteria**
- "Edit" shows only where `canEdit` is true (form allows user edits, lab setting on).
- When the form doesn't allow edits, no Edit action is shown to the participant; admins/instructors keep theirs.
- Editing opens the original submitted version of the form (existing behaviour) and saves via the update path.
- If the participant loses access or the setting is turned off while editing, saving shows a clear error and the data they typed is not silently lost (stays open on error).
- `cfResponseUpdated` analytics fires as today.
- Edit is hidden on cancelled/declined bookings.

**Depends on:** S4, S5, S6.

---

### S9 — [FE] Participant previews a response and downloads a PDF
**As an** accepted participant, **I want** to preview any submitted response on the booking and download it as a PDF, **so that** I have a record of what was submitted.

**Acceptance criteria**
- "Preview" and "Download PDF" are available for every submitted form on the booking, including on-creation and once-on-creation forms.
- Preview shows: form name, booking reference, booking duration, **Submitted by** (the person who actually submitted it), submission date and time, field values, files and images.
- PDF contents match the preview (existing `FormToPDFConverter`).
- No delete action is shown to participants (BR8).
- Pending forms show no preview.

**Depends on:** S5, S6.

---

### S10 — [BE] Missed-submission email also goes to accepted participants
**As an** accepted participant, **I want** to be emailed when a required form on my booking is missed, **so that** I can complete it late.

**Acceptance criteria**
- `EventNotifier::CustomForms::Customers::MissedSubmission` recipients become: the requester **plus** accepted participants (when the lab setting is on).
- Pending and rejected invitees do not get the email. Recipients are determined at send time.
- One email per recipient per missed form (existing "one email per form" rule).
- The channel stays `:non_toggable` for participants. Admin and instructor opt-outs for other users' bookings are unchanged and don't affect participants' own emails.
- No email when: Custom Forms disabled, booking deleted or cancelled, form deleted, or the form was submitted by anyone (including a participant). Lab setting off → recipients are only today's.
- If a response is deleted after the deadline, the missed state and emails trigger again, now with the new recipient list.
- Participants are not double-emailed if they are also an admin/instructor of the equipment.
- Mailer renders correctly for a recipient who isn't the requester (no wording that assumes the recipient created the booking, e.g. "your booking"; adjust copy if it does).
- Specs for recipients, deduplication and exclusion cases.

**Depends on:** S1.

---

### S11 — [BE] Access removed when a participant leaves, setting turned off
**As a** lab admin, **I want** access to be removed immediately when a participant is no longer accepted or the lab setting is off, **so that** nobody keeps access they shouldn't have.

**Acceptance criteria**
- A participant who rejects or is removed from a booking can no longer view, preview, complete or edit that booking's forms (API refuses).
- Their previous responses remain on the booking, with their name in "Submitted by" and in the Responses overview and Equipment Details → Forms tab (BR10).
- Turning the lab setting off removes participant access immediately; existing responses are kept (A1).
- Access is evaluated on every request (no caching of a stale permission).
- Specs cover: reject after submit, removal after submit, setting off after submit.

**Depends on:** S3, S4, S5.

---

### S12 — [BE] Responses overview, equipment tab and external API show participant submitters
**As an** admin or instructor, **I want** responses submitted by participants to show the right submitter everywhere, **so that** reviews and audits stay accurate.

**Acceptance criteria**
- Responses overview, Equipment Details → Forms tab, the response preview and the External API `custom_form_responses` show the participant as the submitter.
- Search by user name finds responses by participant name.
- A participant who has since left the lab/booking still appears by name.
- Admin/instructor delete behaviour is unchanged. "Once on creation" delete protection is unchanged.
- No schema change expected; this story is mostly verification plus any gap fixes.

**Depends on:** S3.

---

### S13 — [QA/Docs] Regression, release and documentation
**As a** product owner, **I want** the change verified end-to-end and documented, **so that** it ships safely to the customer and others aren't surprised.

**Acceptance criteria**
- End-to-end checks run with the setting **off** (no change for any role) and **on**.
- Role matrix tested: requester, accepted / pending / rejected participant, admin, managing instructor, non-managing instructor, uninvolved user.
- Form-type matrix tested: required before-end, optional, on-creation, once-on-creation, inactive, deleted.
- Group-booking and recurring-booking scenarios checked (A2).
- Concurrency check: two participants submit at once; one record.
- Help centre / `Custom+Forms.docx` updated: Forms tab visibility rules, new setting, permission summary table, FAQ ("Can participants complete forms?"), missed-submission recipients.
- Release note written; setting off by default means safe to deploy before enabling for the customer.

**Depends on:** all other stories.

---

## 4. Story summary

| Story | Type | Title |
|-------|------|-------|
| S1 | BE | Lab setting |
| S2 | FE | Setting toggle in Lab Settings |
| S3 | BE | Authorise participant submission |
| S4 | BE | Participant edit + authorisation fix |
| S5 | BE | API exposes capabilities |
| S6 | FE | Forms tab visible to participants |
| S7 | FE | Participant completes a form |
| S8 | FE | Participant edits a response |
| S9 | FE | Participant previews / downloads PDF |
| S10 | BE | Missed-submission emails to participants |
| S11 | BE | Access removed on leave / setting off |
| S12 | BE | Submitter shown correctly everywhere |
| S13 | QA/Docs | Regression, release and docs |
