# Custom forms REST API user stories

Three user stories for new external REST API endpoints that expose custom forms to tools and scientists working outside the Calira UI. They are based on the existing custom forms implementation in app-clustermarket (CustomForm, CustomFormInput, CustomFormHistory, the GraphQL managePostUsageCustomFormInput mutation and the customFormInputsAttributes property of createAssetRequest). Unlike the GraphQL API, these endpoints take and return plain JSON with an explicit schema; the stored JSONB form template and response data are never exposed directly.

## User story 1: Get booking forms

As an external API consumer (an ELN, LIMS or instrument-side tool acting for a scientist), I want to retrieve the latest version of every custom form associated with a given booking, together with whether each form is mandatory or optional, so that external systems can present the correct forms to the scientist and know which submissions are needed for regulatory or safety compliance.



**Acceptance Criteria:**

- A read-only REST endpoint is available for listing the custom forms associated with a booking.
- Endpoint is available under the existing external API versioning structure:
  - GET /v1/bookings/{booking_id}/custom_forms
- The endpoint requires OAuth authentication.
- The endpoint requires the existing read_bookings scope. Requests without the required scope are rejected.
- The API consumer can list forms only for bookings in labs/accounts where the OAuth application is permitted.
- The API consumer can list forms only when the authenticated user is permitted to view the booking's forms, consistent with the current Forms tab behaviour:
  - the booking requester
  - an accepted booking invitee
  - a lab admin
  - an instructor who manages the booked equipment
- The endpoint returns every form that the booking Forms tab would show for this booking, applying the current product rules:
  - the form is linked to the booked equipment
  - the form's booking types include the booking's type (use or maintenance)
  - the form is active, or is inactive but a response was already submitted for this booking
  - the form was activated before the booking end time (optional and required-before-booking-end forms) or before the booking was created (required-during-booking-creation forms)
- For each form the response returns the latest version of the form definition (the current version number and its fields), not the version an earlier response was submitted against.
- When a response has already been submitted for a form on this booking, the entry also identifies that response and the form version it was submitted against, so the consumer can amend it correctly (see the amendment story).
- Each form entry states whether it is mandatory or optional for this booking, and the reason, as plain text:
  - required_during_booking_creation
  - required_once_during_booking_creation
  - required_before_booking_end
  - optional
  - A required-once-during-booking-creation form that the requester has already completed for this equipment on an earlier booking is returned as optional for this booking, matching current behaviour.
- Each form entry states the completion state for this booking as plain text: not_submitted, submitted, or missed (a required-before-booking-end form that is not submitted and whose deadline has passed).
- Each form entry includes the submission deadline where one applies (booking end time plus the form's submission window), otherwise null.
- The form definition is returned as plain JSON with an explicit, documented schema. The stored database representation of the form template (JSONB) is never returned as-is.
  - Each field has a stable field_id, a type, a label, optional helper text, whether it is required, and its options (radio, dropdown and checkbox fields only).
  - Field types are returned as plain lower-case strings: short_text, long_text, number, value_unit, date_time, radio, dropdown, checkbox, image_upload, file_upload, heading, paragraph.
  - heading and paragraph fields are informational only and are flagged as not accepting a value.
  - Field configuration that affects input (for example date only for date_time fields) is returned as explicit properties, not as a nested validations object copied from the template.
- Form and response identifiers are returned as separate properties (custom_form_id and custom_form_response_id). The current GraphQL booking forms type reuses one id for both; the REST endpoint must not.
- Shared business logic is extracted into a reusable service or query object. The REST endpoint does not call GraphQL resolvers or mutations. The existing GraphQL booking forms field is updated to reuse the shared logic where applicable.
- The endpoint is read-only and has no side effects.
- If custom forms are disabled for the lab, or the lab's plan does not include custom forms, the endpoint returns an empty custom_forms array.
- All response values are plain text or plain JSON. No numeric codes that need translation are returned (for example the requirement is returned as "required_before_booking_end", not a stored value).


**API Response Expectations**


**Successful retrieval**

- When the forms are retrieved successfully, the API consumer should receive a 200 response containing:
  - booking_id
  - equipment id and name
  - lab/account id and name
  - custom_forms: an array with one entry per form, each containing:
    - custom_form_id
    - name
    - current_version
    - requirement (required_during_booking_creation, required_once_during_booking_creation, required_before_booking_end, optional)
    - required (true or false for this booking)
    - status (not_submitted, submitted, missed)
    - submission_deadline (ISO 8601, or null)
    - allow_user_edits (true or false)
    - custom_form_response_id (null when not submitted)
    - submitted_version (null when not submitted)
    - submitted_at (null when not submitted)
    - fields: the field definitions described above
  - errors (empty array)
- Example response (abridged):

```json
{
  "booking_id": 8123,
  "equipment": {
    "id": 55,
    "name": "Confocal microscope"
  },
  "account": {
    "id": 12,
    "name": "Cell Biology Lab"
  },
  "custom_forms": [
    {
      "custom_form_id": 41,
      "name": "Post-use cleaning record",
      "current_version": 3,
      "requirement": "required_before_booking_end",
      "required": true,
      "status": "not_submitted",
      "submission_deadline": "2026-09-08T18:00:00Z",
      "allow_user_edits": true,
      "custom_form_response_id": null,
      "submitted_version": null,
      "submitted_at": null,
      "fields": [
        {
          "field_id": "f1",
          "type": "paragraph",
          "label": "Complete this record after every session.",
          "accepts_value": false
        },
        {
          "field_id": "f2",
          "type": "radio",
          "label": "Objective lens cleaned",
          "helper_text": null,
          "required": true,
          "options": [
            "Yes",
            "No"
          ],
          "accepts_value": true
        },
        {
          "field_id": "f3",
          "type": "value_unit",
          "label": "Immersion oil used",
          "helper_text": null,
          "required": false,
          "accepts_value": true
        },
        {
          "field_id": "f4",
          "type": "image_upload",
          "label": "Photo of stage",
          "helper_text": "One image",
          "required": false,
          "accepts_value": true
        }
      ]
    }
  ],
  "errors": []
}
```

- The response should reflect the current saved state of the forms and their responses.
- The response should not expose internal implementation details, GraphQL-specific structures, JSONB blobs, or unnecessary backend-only fields.

**Permission errors**

- Clear error describing the case should be shown when:
  - the OAuth application does not have access to the booking's lab/account
  - the token does not include the read_bookings scope
  - the authenticated user is not permitted to view the forms for this booking
- This will result in a 403 error using the existing external API forbidden format (error and error_description).

**Not found errors**

- When the booking does not exist, or is not accessible to the OAuth application, the API consumer should receive a 404 error using the existing message: "No booking exists with that ID, or the booking is not accessible to your OAuth application. Verify the booking ID and ensure your application is authorised for the booking's lab."

**Authentication errors**

- When the request is missing valid authentication, the API consumer should receive a clear 401 response that a valid access token is required.


**Notes:**

- Out of Scope
  - Returning historical form versions inline. A follow-up endpoint (for example GET /v1/custom_forms/{custom_form_id}/versions/{version}) may be needed for consumers amending responses submitted against an older version.
  - Listing forms for equipment before a booking exists (pre-booking preview of required-during-booking-creation forms).
  - Returning the submitted response values themselves (use GET /v1/custom_form_responses/{custom_form_response_id}).
  - Creating, editing, activating or deactivating form definitions.

**Questions:**

- Fields in the stored form template have no persisted identifier. Should a stable field id be added to the template when a form is saved (with a backfill of existing versions), or is the field's position within a version sufficient for field_id? Versions are immutable snapshots, so position is stable within a version.
- Should the response include the historical version definition inline when a response was submitted against an older version, or is a separate versions endpoint preferred?


**Additional Requirements Clarified During Development:**



---

## User story 2: Custom form submission (customFormResponse.create)

As an external API consumer (a scientist, or a tool acting for a scientist), I want to file a completed custom form response against an existing booking through the writable REST API, so that regulatory and safety compliance records for the booking are captured without using the Calira UI.



**Acceptance Criteria:**

- A writable REST endpoint is available for submitting a custom form response against a booking.
- Endpoint is available under the existing external API versioning structure:
  - POST /v1/bookings/{booking_id}/custom_form_responses
- The endpoint requires OAuth authentication.
- The endpoint requires the existing write_bookings scope. Requests without the required scope are rejected.
- The API consumer can submit responses only for bookings in labs/accounts where the OAuth application is permitted.
- The API consumer can submit a response only when the authenticated user is permitted to do so, consistent with current product behaviour:
  - the booking requester
  - a lab admin, or an instructor who manages the booked equipment, submitting on the requester's behalf
  - the response records the authenticated user as the submitter
- The request payload is plain JSON with the following properties:
  - custom_form_id - mandatory
  - responses - mandatory; an array of objects, one per input field, each with field_id and value
  - Values are typed by field type:
    - short_text, long_text, radio, dropdown: a text string
    - number: a JSON number
    - value_unit: an object { "value": <number>, "unit": "<text>" }
    - date_time: an ISO 8601 date-time string (date only when the field is configured as date only)
    - checkbox: an array of text strings, each one of the configured options
    - image_upload, file_upload: an array of upload ids returned by POST /v1/uploads
  - heading and paragraph fields must not be included in responses.
- The server converts the JSON payload into the internal stored representation. The API consumer never sends the internal template structure or JSONB.
- The response is validated on the server against the latest version of the form (the web UI currently validates only on the client):
  - every field marked required has a non-empty value
  - every field_id belongs to the form version and each input field appears at most once
  - number values are numeric
  - radio and dropdown values are one of the configured options
  - checkbox values are a subset of the configured options
  - date_time values parse as ISO 8601
  - upload ids exist, were registered by the same OAuth application and user, and are not already attached to another response
- The submitted response is stored against the form version current at the time of submission. If this is the first response for the form, form versioning is switched on and version 1 is snapshotted, matching current behaviour.
- Only forms that the Get booking forms endpoint lists for this booking can be submitted against.
- Only one response per form per booking is allowed. A second submission is rejected with an error that references the existing custom_form_response_id.
- Forms required during booking creation cannot be submitted through this endpoint once the booking exists; the error explains that they must be supplied when the booking is created.
- Required-before-booking-end forms can be submitted during the booking, after the booking ends, and after the submission deadline has passed. A late submission is accepted, clears the missed-submission state, and cancels any pending missed-submission notification for that form.
- Responses cannot be submitted against cancelled, declined or deleted bookings.
- If custom forms are disabled for the lab, or the lab's plan does not include custom forms, the request is rejected.
- Shared business logic is extracted into a reusable service object. The REST endpoint does not directly call GraphQL mutations. The existing GraphQL managePostUsageCustomFormInput mutation is updated to reuse the shared service where applicable.
- The response and its attachments are saved atomically. A response is not partially created if any field or attachment is invalid.
- POST /v1/uploads accepts a purpose of custom_form_attachment under the write_bookings scope so that image_upload and file_upload values can be supplied.
- A submitted response appears immediately in the booking Forms tab, the Responses overview and the Equipment Details Forms tab, with the same version and submitter as if it had been submitted in the UI.
- All response values are plain text or plain JSON. No numeric codes that need translation are returned.


**API Response Expectations**


**Successful submission**

- When a response is submitted successfully, the API consumer should receive a 201 response containing:
  - confirmation that the response was submitted successfully
  - custom_form_response_id
  - custom_form_id and custom_form_name
  - custom_form_version (the version the response was submitted against)
  - booking_id
  - equipment id and name
  - lab/account id and name
  - status ("submitted")
  - submitted_by (user id and name)
  - submitted_at
  - updated_at
  - responses: the saved values, each with field_id, label, type and value
  - attachments: for each upload, its id, filename, content type and a download URL
  - errors (empty array)
- Example request:

```json
{
  "custom_form_id": 41,
  "responses": [
    {
      "field_id": "f2",
      "value": "Yes"
    },
    {
      "field_id": "f3",
      "value": {
        "value": 2.5,
        "unit": "ml"
      }
    },
    {
      "field_id": "f4",
      "value": [
        "upl_9f3c1a"
      ]
    }
  ]
}
```

- Example response (abridged):

```json
{
  "success": true,
  "message": "The custom form response was submitted successfully.",
  "custom_form_response": {
    "custom_form_response_id": 9031,
    "custom_form_id": 41,
    "custom_form_name": "Post-use cleaning record",
    "custom_form_version": 3,
    "booking_id": 8123,
    "equipment": {
      "id": 55,
      "name": "Confocal microscope"
    },
    "account": {
      "id": 12,
      "name": "Cell Biology Lab"
    },
    "status": "submitted",
    "submitted_by": {
      "id": 301,
      "name": "Dana Osei"
    },
    "submitted_at": "2026-09-07T16:20:11Z",
    "updated_at": "2026-09-07T16:20:11Z",
    "responses": [
      {
        "field_id": "f2",
        "label": "Objective lens cleaned",
        "type": "radio",
        "value": "Yes"
      },
      {
        "field_id": "f3",
        "label": "Immersion oil used",
        "type": "value_unit",
        "value": {
          "value": 2.5,
          "unit": "ml"
        }
      },
      {
        "field_id": "f4",
        "label": "Photo of stage",
        "type": "image_upload",
        "value": [
          "upl_9f3c1a"
        ]
      }
    ],
    "attachments": [
      {
        "id": "upl_9f3c1a",
        "filename": "stage.jpg",
        "content_type": "image/jpeg",
        "url": "https://..."
      }
    ]
  },
  "errors": []
}
```

- All response values should be plain text; no numbers needing translation should be returned.
- The response should reflect the current saved state of the response.
- The response should not expose internal implementation details, GraphQL-specific structures, JSONB blobs, or unnecessary backend-only fields.

**Validation errors**

- When a response cannot be submitted because of invalid or missing data, the API consumer should receive:
  - a clear error message explaining that the response was not submitted
  - field-level errors keyed by field_id where possible
  - enough detail to understand what needs to be corrected
  - no partial response creation
- This will result in a 422 error which states "The custom form response could not be submitted. Review the errors list for each invalid field, correct your request, and try again."
- The response body properties other than the error array will be null in this case.
- Examples of expected error areas:
  - a required field has no value
  - a radio, dropdown or checkbox value is not one of the configured options
  - a number field contains a non-numeric value
  - a field_id does not belong to the form, or a heading/paragraph field was included
  - an upload id is unknown, expired, or belongs to another application or user
  - custom_form_id is missing

**Business rule errors**

- When the submission violates a business rule, the API consumer should receive a 403 error which states "Forbidden - one or more application business rules have been violated by your attempted custom form submission. Please examine the error object in the response body".
- The response body properties other than the error array will be null in this case.
- The error array on the response body is populated with all relevant business rule violations. An example error array might contain (for example):
  - A response for this form already exists on this booking (custom_form_response_id 9031). Use the amendment endpoint to change it.
  - This form is required during booking creation and must be supplied when the booking is created.
  - This form is not associated with the equipment on this booking, or does not apply to this booking type.
  - Responses cannot be submitted against a cancelled booking.

**Permission errors**

- Clear error describing the case should be shown when:
  - the OAuth application does not have access to the booking's lab/account
  - the token does not include the write_bookings scope
  - the authenticated user is not the booking requester and is not a lab admin or an instructor managing the booked equipment
  - custom forms are disabled for the lab, or the lab's plan does not include custom forms

**Not found errors**

- When the booking does not exist or is not accessible, the API consumer should receive a 404 error using the existing booking-not-found message.
- When the custom_form_id does not exist in the booking's lab, the API consumer should receive a 404 error explaining that no custom form exists with that id for this booking.

**Authentication errors**

- When the request is missing valid authentication, the API consumer should receive a clear 401 response that a valid access token is required.


**Notes:**

- Out of Scope
  - Submitting required-during-booking-creation forms as part of POST /v1/bookings. REST booking creation currently drops custom form inputs, so equipment with such forms cannot be booked through REST until that is addressed in a separate story.
  - Deleting responses.
  - Downloading responses as PDF.
  - Submitting on behalf of a user other than the booking requester (admins and instructors submit for the requester only).
  - The file upload mechanism itself (the existing POST /v1/uploads endpoint is reused).

**Questions:**

- Should the existing write_bookings scope cover form responses, or is a dedicated write_custom_forms scope preferred so labs can grant response submission without booking creation?
- Should a late submission (after the submission deadline) be flagged as late on the stored response and in the UI?
- How should the unit of a value_unit field be validated: free text, or restricted to the unit list configured on the field?
- Should the uploads endpoint enforce the per-field limits (single image, file types, size) at upload time or at submission time?


**Additional Requirements Clarified During Development:**



---

## User story 3: Custom form amendment (customFormResponse.update)

As an external API consumer (a scientist, or a tool acting for a scientist), I want to refile a previously submitted custom form response against a booking through the writable REST API, so that corrections to regulatory and safety compliance records are captured while the original submission remains traceable.



**Acceptance Criteria:**

- A writable REST endpoint is available for amending an existing custom form response.
- Endpoint is available under the existing external API versioning structure, alongside the existing GET /v1/custom_form_responses/{custom_form_response_id}:
  - PATCH /v1/custom_form_responses/{custom_form_response_id}
- The endpoint requires OAuth authentication.
- The endpoint requires the existing write_bookings scope. Requests without the required scope are rejected.
- The API consumer can amend responses only for bookings in labs/accounts where the OAuth application is permitted.
- The API consumer can amend a response only when the authenticated user is permitted to do so, consistent with current product behaviour:
  - a lab admin, or an instructor who manages the booked equipment, can always amend
  - the booking requester can amend only when the form's "allow users to edit their responses" setting is on
  - any other user is rejected
  - Note: the current update policy checks that the booking has a requester rather than that the requester is the authenticated user. The REST endpoint must enforce that the requester is the authenticated user.
- The request payload is plain JSON with the following properties:
  - responses - mandatory; the complete set of values for the form's input fields, using the same field_id and value typing as the submission endpoint
  - The payload replaces the previous values in full. Omitted optional fields are stored as empty; omitted required fields are rejected.
  - custom_form_id, booking_id and submitter cannot be changed and must not be present in the payload.
- The amendment is validated on the server against the form version the response was originally submitted against, not the latest version, using the same field rules as the submission endpoint. The stored version of the response does not change.
- The server converts the JSON payload into the internal stored representation. The API consumer never sends the internal template structure or JSONB.
- Upload ids supplied for image_upload and file_upload fields replace the previous attachments for those fields. Upload ids already attached to this response may be resubmitted unchanged.
- The amendment updates updated_at and records the amending user as updated_by. The original submitter and submitted_at are preserved.
- Amending a required-before-booking-end response never re-opens the missed-submission state and never triggers a missed-submission notification. Amendment is allowed after the submission deadline.
- Responses for every requirement type can be amended, including required-during-booking-creation responses (only deletion is blocked for those today). See Questions.
- Responses cannot be amended when the booking has been cancelled, declined or deleted.
- If custom forms are disabled for the lab, or the lab's plan does not include custom forms, the request is rejected.
- Shared business logic is extracted into a reusable service object. The REST endpoint does not directly call GraphQL mutations. The existing GraphQL managePostUsageCustomFormInput mutation (update path) is updated to reuse the shared service where applicable.
- The response and its attachments are updated atomically. A response is not partially updated if any field or attachment is invalid.
- An amended response is reflected immediately in the booking Forms tab, the Responses overview, the Equipment Details Forms tab and the PDF export.
- All response values are plain text or plain JSON. No numeric codes that need translation are returned.


**API Response Expectations**


**Successful amendment**

- When a response is amended successfully, the API consumer should receive a 200 response containing:
  - confirmation that the response was updated successfully
  - custom_form_response_id
  - custom_form_id and custom_form_name
  - custom_form_version (unchanged, the version originally submitted against)
  - booking_id
  - equipment id and name
  - lab/account id and name
  - status ("submitted")
  - submitted_by (user id and name) and submitted_at (original submission)
  - updated_by (user id and name) and updated_at (this amendment)
  - responses: the saved values, each with field_id, label, type and value
  - attachments: for each upload, its id, filename, content type and a download URL
  - errors (empty array)
- Example request:

```json
{
  "responses": [
    {
      "field_id": "f2",
      "value": "No"
    },
    {
      "field_id": "f3",
      "value": {
        "value": 2.5,
        "unit": "ml"
      }
    },
    {
      "field_id": "f4",
      "value": [
        "upl_9f3c1a"
      ]
    }
  ]
}
```

- Example response (abridged):

```json
{
  "success": true,
  "message": "The custom form response was updated successfully.",
  "custom_form_response": {
    "custom_form_response_id": 9031,
    "custom_form_id": 41,
    "custom_form_name": "Post-use cleaning record",
    "custom_form_version": 3,
    "booking_id": 8123,
    "equipment": {
      "id": 55,
      "name": "Confocal microscope"
    },
    "account": {
      "id": 12,
      "name": "Cell Biology Lab"
    },
    "status": "submitted",
    "submitted_by": {
      "id": 301,
      "name": "Dana Osei"
    },
    "submitted_at": "2026-09-07T16:20:11Z",
    "updated_by": {
      "id": 301,
      "name": "Dana Osei"
    },
    "updated_at": "2026-09-08T08:02:45Z",
    "responses": [
      {
        "field_id": "f2",
        "label": "Objective lens cleaned",
        "type": "radio",
        "value": "No"
      },
      {
        "field_id": "f3",
        "label": "Immersion oil used",
        "type": "value_unit",
        "value": {
          "value": 2.5,
          "unit": "ml"
        }
      },
      {
        "field_id": "f4",
        "label": "Photo of stage",
        "type": "image_upload",
        "value": [
          "upl_9f3c1a"
        ]
      }
    ],
    "attachments": [
      {
        "id": "upl_9f3c1a",
        "filename": "stage.jpg",
        "content_type": "image/jpeg",
        "url": "https://..."
      }
    ]
  },
  "errors": []
}
```

- All response values should be plain text; no numbers needing translation should be returned.
- The response should reflect the current saved state of the response.
- The response should not expose internal implementation details, GraphQL-specific structures, JSONB blobs, or unnecessary backend-only fields.

**Validation errors**

- When a response cannot be amended because of invalid or missing data, the API consumer should receive:
  - a clear error message explaining that the response was not updated
  - field-level errors keyed by field_id where possible
  - enough detail to understand what needs to be corrected
  - no partial response update
- This will result in a 422 error which states "The custom form response could not be updated. Review the errors list for each invalid field, correct your request, and try again."
- The response body properties other than the error array will be null in this case.
- Examples of expected error areas:
  - a required field has no value
  - a value is not one of the configured options for the version the response was submitted against
  - a field_id does not belong to that form version
  - an upload id is unknown, expired, or belongs to another application, user or response

**Business rule errors**

- When the amendment violates a business rule, the API consumer should receive a 403 error which states "Forbidden - one or more application business rules have been violated by your attempted custom form amendment. Please examine the error object in the response body".
- The response body properties other than the error array will be null in this case.
- An example error array might contain (for example):
  - Responses cannot be amended on a cancelled booking.
  - This form does not allow users to edit their responses. Contact a lab admin to amend it.

**Permission errors**

- Clear error describing the case should be shown when:
  - the OAuth application does not have access to the booking's lab/account
  - the token does not include the write_bookings scope
  - the authenticated user is the booking requester but the form does not allow user edits
  - the authenticated user is neither the booking requester nor a lab admin or instructor managing the booked equipment
  - custom forms are disabled for the lab, or the lab's plan does not include custom forms

**Unexpected payload property errors**

- When the payload includes custom_form_id, booking_id, submitted_by or any other property that cannot be changed on an existing response, the amendment should fail and the API consumer should receive an error with:
  - a clear error message explaining that unexpected parameters were provided, e.g. "You are attempting to change the form or booking of an existing response. These cannot be changed; submit a new response instead, or remove custom_form_id and booking_id from your payload."
  - field-level errors where possible
  - enough detail to understand what needs to be corrected
  - no partial response update

**Not found errors**

- When the response does not exist or is not accessible, the API consumer should receive a 404 error using the existing custom_form_response_not_found message ("Custom form response not found.").

**Authentication errors**

- When the request is missing valid authentication, the API consumer should receive a clear 401 response that a valid access token is required.


**Notes:**

- Out of Scope
  - An amendment history endpoint listing previous values, authors and timestamps. CustomFormInput has no audit trail today; this overlaps the Audit Trail PRD and should be specified there.
  - Moving a response to a newer form version.
  - Deleting responses.
  - Amending responses on behalf of a user other than the booking requester.

**Questions:**

- For regulatory use, should each amendment retain the previous values with the amending user and timestamp (an audit trail), rather than overwriting in place as the product does today?
- Should responses for required-during-booking-creation forms be immutable through the API for compliance reasons, given that deletion is already blocked for them?
- Should the booking requester be blocked from amending after the booking end time or after the submission deadline, or only by the form's allow-user-edits setting as today?
- Should amendments made by an admin or instructor be visibly distinguished from the requester's own edits in the Forms tab and PDF export? The UI currently shows a single submitted-by value.


**Additional Requirements Clarified During Development:**

