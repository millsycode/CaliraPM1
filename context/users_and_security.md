# Users and Security Business Rules

_Source: Confluence PDF export, especially pages 5-14, 20-23, 96-99, 131-133, 147-150, 159-160, 183-237._

Use this file as the authority for user roles, access control, authentication, SSO/MFA, invitations, training, and notification/security-adjacent rules.

## Core user and permission model

### Scopes

- A user can operate inside a **Lab**, **Department**, or **Organization** scope depending on their role and assignment.
- A **Lab Admin** can administer only their lab.
- A **Department Admin** can administer labs under their department.
- An **Organization Admin** can administer departments and labs under the organization.
- Permissions must always be evaluated against the relevant scope before granting management actions.

### Roles

Canonical roles in the product are:

- `org_admin`
- `department_admin`
- `lab_admin`
- `instructor`
- `researcher`
- `student`
- `guest`

The source sometimes refers to Admins collectively. In implementation, admin power is bounded by the admin's umbrella: lab, department, or organization.

## Role capabilities

### Admins

Admins can, inside their scope:

- Book equipment and order services.
- Ignore normal equipment booking rules.
- Book equipment on behalf of other users.
- Create, edit, and cancel equipment bookings in the past.
- Create overlapping bookings.
- Create maintenance bookings.
- Search the private marketplace and request equipment or services from other labs.
- View lab user details, including names, email addresses, and phone numbers.
- Add, edit, duplicate, delete, and manage equipment and services.
- Invite and manage users, user permissions, training, and access groups.
- Create and manage projects, including user assignments.
- Create and send announcements.
- Download and view reports for equipment bookings, service orders, and LabTrack.
- Create new labs.

### Instructors

Instructors are equipment-scoped administrators. The most important invariant is:

```text
if user is instructor_for(equipment):
    treat as admin for that equipment
else:
    do not grant equipment-management powers for that equipment
```

For equipment assigned under **Select the equipment for which the user is an instructor**, instructors can:

- Book as they wish and bypass equipment booking rules.
- Edit or decline other users' bookings on that equipment.
- Book on behalf of other users.
- Edit and delete that equipment.
- Add or remove that equipment from access groups or individual user access/training rules.
- Edit/delete groups only when the group contains only equipment they manage, or no equipment.

For equipment they do **not** manage:

- They do not have admin-equivalent equipment powers.
- The older instructor migration notes say they can book all equipment but must follow equipment rules. The newer User Roles section describes access groups / individual rules for instructor access to non-managed equipment. Treat this as a source conflict: when modifying this area, preserve existing code behavior or confirm product intent before changing access checks.

Instructor group-editing rules:

- If a group has only equipment the instructor manages, the instructor can change group permissions/rules and allocate/deallocate managed equipment.
- If a group includes any equipment the instructor does not manage, the instructor cannot change permissions/rules for the whole group, but can still allocate/deallocate equipment they manage if the UI permits it.
- Instructors cannot add/remove equipment they do not manage.
- Instructors cannot approve/decline requests for the Instructor role.
- If an instructor manages no equipment and no access groups, user edit actions are disabled with the tooltip: `You cannot edit this user because you are not an instructor for any equipment and lack access group permissions.`

### Researchers

Researchers:

- Must be in an access group or have individual booking rules to book internal equipment.
- Can book equipment and order services they have access to.
- Must obey equipment booking rules.
- Can search the private marketplace and request equipment/services from other labs.
- Can see lab users' details, including names, email addresses, and phone numbers.
- See names and notes on internal bookings, but not external bookings.
- Can see the Integrations page.
- Can create new labs.
- Can create maintenance bookings only when the lab-level **Maintenance for Researchers** setting is enabled.

Researchers cannot:

- Book on behalf of others.
- Create/edit/cancel equipment bookings in the past.
- Create overlapping bookings.
- Add/edit/delete equipment, services, users, or groups.
- Manage projects.
- Manage/send announcements.
- View/download reports.
- See Lab Settings.

### Students

Students are end users similar to Researchers, with reduced privacy/marketplace permissions.

Students:

- Must be in an access group or have individual booking rules to book internal equipment.
- Can book equipment and order services they have access to.
- Must obey equipment booking rules.
- See lab users' names only, not email addresses or phone numbers.
- See booking name and notes for internal bookings only.
- Can see the Integrations page.
- Can create new labs.

Students cannot:

- Use the marketplace to request external equipment/services from other labs. The search bar can still appear, but results should be limited to resources available in labs the student belongs to.
- Book on behalf of others.
- Create/edit/cancel bookings in the past.
- Create overlapping bookings.
- Create maintenance bookings.
- Manage equipment, services, users, groups, projects, announcements, reports, or lab settings.

### Guests

Guests are treated as external/limited lab users.

Guests:

- Must be in an access group or have individual booking rules to book internal equipment.
- Can book equipment they have access to.
- Must obey equipment booking rules.
- Can see the Integrations page.
- Can create new labs.

Guests cannot:

- Use the private marketplace.
- See names or notes on other people's bookings.
- See Users, Equipment overview, or Services overview tables.
- See lab users' email addresses or phone numbers.
- Book on behalf of others.
- Create/edit/cancel bookings in the past.
- Create overlapping bookings.
- Create maintenance bookings.
- Manage equipment, services, users, groups, projects, announcements, reports, or lab settings.
- Create Group Bookings or access the Bookings List tab for Group Bookings.

## Student role by lab sector

- If `lab.sector == academia`, `Student` is available in invitations, invitation editing, user profile role editing, and onboarding join-lab requests.
- If `lab.sector == industry`, `Student` is not available as a new role in invitations, invitation editing, user profile role editing, or onboarding join-lab requests.
- Existing Students in industry labs are not migrated or changed. They can continue to exist.

Implementation rule:

```text
when presenting role choices:
    include Student only if lab.sector == 'academia'
when validating persisted historical users:
    do not reject existing Student users solely because lab.sector == 'industry'
```

## Access groups and individual rules

### Purpose

Access groups grant equipment access and booking rules to multiple users at once. They behave similarly to individual booking rules, but apply to all users and all equipment assigned to the group.

Critical invariant:

```text
access_group.rules apply only when:
    booking.user is in access_group.users
    AND booking.equipment is in access_group.equipment
```

Researcher, Student, and Guest users require an access group or individual booking rules to book internal equipment.

### Access group details

Required/optional fields:

- `name`: mandatory free text.
- `description`: optional free text.
- `assigned_users`: optional; list of Researchers, Students, and Guests grouped by role.

A group can be created without users.

### Access group rules

Access group rules include:

- `requires_approval`: bookings by group members require admin/instructor approval.
- `projects_mandatory`: user must select a project to proceed.
- `funding_codes_required`: user must select a project and funding code to proceed; this option appears only when projects are mandatory.
- `can_create_recurring_bookings`: recurrence options are visible in booking advanced options.
- `can_cancel_own_bookings`: users can cancel their own bookings before start, subject to cutoff.
- `can_edit_own_bookings`: users can edit start/end times of their own bookings or bookings made on their behalf, subject to cutoff.
- `allow_group_booking_invites`: users, excluding guests, can invite others to their bookings.
- `hide_untrained_equipment`: untrained users do not see untrained equipment on calendars.
- `different_schedule_for_untrained`: trained and untrained users have separate booking schedules.
- `member_usage_limit`: max hours each group member can book per equipment, per day/week/year/total.
- `group_usage_limit`: max hours all group members together can book per equipment, per day/week/year/total.
- `edit_cancellation_deadline_hours`: appears only if edit or cancel toggles are on. Blank means cancel up to start and edit up to end. Negative values allow edit/cancel after booking start.

### Schedule defaults

All access group schedules default to **All day, every day** (24/7 availability). Restrictions are opt-in.

Schedule variants:

- `Usage schedule`: shown when hide-untrained and separate-untrained schedules are both off.
- `Schedule for trained users`: shown when hide-untrained is on.
- `Schedule for trained users` + `Schedule for untrained users`: shown when separate-untrained schedule is on and hide-untrained is off.

When group and individual schedules both exist, the group schedule overrides the individual schedule for bookings governed by that group.

### Equipment assignment rules

- Equipment list is grouped by room and ordered alphanumerically.
- Equipment without a room is grouped under `Unassigned`.
- Equipment checkboxes can be disabled to prevent conflicts with existing individual rules or other groups.
- Instructors creating/editing access groups can assign/remove only equipment they manage.
- Only parent equipment is selectable for access/training/instructor assignment; selecting a parent applies access/rules to all children without splitting rules among children.

### Editing and deletion

Editing access groups uses the same modal as creation, with:

- Header: `Edit access group`.
- Bottom-left `Delete` button.
- Primary action label: `Update`.

Instructor deletion rules:

- Instructor can delete a group if all assigned equipment is managed by that instructor, regardless of who created it.
- Instructor can delete an empty group.
- Instructor cannot delete a group containing equipment they do not manage.

## Training

Training is a lab-configurable feature used to either hide equipment from untrained users or apply different schedules for trained/untrained use.

### Lab setting

- `Lab Settings -> Advanced -> Training` controls whether training features are visible.
- Training is off by default for new labs.

### User-level training rules

For non-admin users, the profile/invitation rules can include:

- `hide_untrained_equipment`: hide equipment the user is not trained on.
- `different_schedule_for_untrained_equipment`: show separate trained/untrained schedules.
- `equipment_user_can_book`: equipment in the user's personal group.
- `equipment_user_is_trained_on`: equipment where the trained schedule applies.

Schedule display logic:

```text
if different_schedule_for_untrained == false:
    show one schedule: Usage schedule
elif different_schedule_for_untrained == true and hide_untrained_equipment == false:
    show two schedules: trained and untrained
elif different_schedule_for_untrained == true and hide_untrained_equipment == true:
    show one schedule for equipment the user is trained to use
```

### Equipment training tab

- Each equipment page has a Training tab when training is enabled.
- It lists non-admin users by role and marks trained users with checkboxes.
- Admins and instructors assigned to the equipment can add/remove training.
- Changes here must be immediately reflected in the user's profile settings.

## User invitations

Users can be invited by email or by web link.

### Invitation statuses

User table statuses include:

- `active`
- `expired`
- `invited`

For invited/expired users, the user table shows the email address instead of the user's name because the system does not know their name until registration.

### Email invitations

Email invitation fields:

- One or more email addresses; cannot be empty.
- Invalid emails, already-invited users, and existing lab members are highlighted and are not invited.
- Role is mandatory.
- Role options: Guest, Student (academia only), Researcher, Instructor, Admin.
- `require_sso_authentication`: when on, new users must log in through SSO when accepting.

Advanced options:

- Guest, Student, Researcher: can use access groups or individual rules.
- Individual rules are available only for single-email invitations.
- Assigning to access groups is available for both single and multiple email invitations.
- Instructor: advanced options define the list of instruments the instructor will manage.
- Admin: no advanced options.

Access group selection:

- At least one access group is required when that advanced option is used.
- Multiple groups can be selected only if there are no conflicts.
- Conflicting groups are highlighted, and invitation sending is blocked.

Individual rules flow:

1. Configure individual booking rules.
2. Select equipment access; at least one equipment item is required.
3. If untrained-schedule toggle is on, select training equipment; at least one item required.
4. Configure schedule variants.

Parent equipment selection applies access/training/rules to all children.

### Web link invitations

Web links are intentionally restricted:

- Allowed roles: Guest, Student (academia only), Researcher.
- Not allowed for Instructors or Admins because those are high-permission roles.
- Advanced options only allow assignment to access group(s).
- At least one group is required.
- Multiple groups cannot conflict.
- Optional `manually_approve_each_invitee` setting gates access until admin approval.
- Optional `require_sso_authentication` forces SSO login on acceptance.

Web link expiration and editing:

- Web links are valid for 30 days from creation by default.
- Expiry can be extended, but always to a maximum of 30 days from the day of extension.
- Editable fields: role, access groups, renew URL, extend expiry, manually approve each invitee, require SSO authentication.
- If a user is declined once via a manually-approved web link, that user cannot join the same lab via web link again and must be invited by email.

## Login and session rules

### Credentials login

Fields:

- `email`: valid email format and must belong to an active registered account.
- `password`: exact match to current password.

`Remember me`:

- If checked, credentials/session are remembered for 3 months.
- Depends on same browser and browser cookies/credentials not being cleared.

### SSO login

- User clicks `Log in via your organization`.
- Organization search requires at least 3 characters before options are shown.
- After selection, authentication is initiated with the organization's identity provider.
- Identity providers are configured in Control Room under Identity Providers.

## SSO settings and SAML

### SSO setting hierarchy

When no SSO Provider exists:

- Organization SSO toggle is off and disabled.
- Department SSO toggle is off and disabled.
- Lab SSO toggle is off and disabled.
- Invitation-level SSO option is not present.

When an SSO Provider exists, SSO can be enforced at organization, department, lab, or invitation level depending on inherited toggles. Higher-scope enforcement disables lower-scope choice.

Implementation guidance:

```text
if org.requires_sso:
    department.requires_sso = true (disabled)
    lab.requires_sso = true (disabled)
elif department.requires_sso:
    lab.requires_sso = true (disabled)
else:
    lab may be toggled independently
```

### SAML 2.0 rules

Calira acts as a SAML Service Provider and supports:

- Multiple identity providers simultaneously.
- Automatic user provisioning on first SSO login.
- Linking existing users to SSO identities.
- Certificate validation.
- Optional signed requests and encrypted assertions for standard SAML.

Required SAML attributes:

- Unique identifier: primary `NameID`, fallback email.
- Email address: required for account creation and matching.

Optional mapped attributes:

- First name.
- Last name.
- Full name.
- Phone number.

SSO flow:

1. User initiates SSO.
2. User selects identity provider.
3. Calira redirects to IdP.
4. IdP authenticates user and sends SAML response.
5. Calira validates response/signature.
6. Calira extracts attributes.
7. Existing account is matched/linked or a new account is created.
8. User is signed in and redirected.

Existing-user verification:

- If SSO email matches an existing account, user may be required to confirm their Calira password once to link the SSO identity.
- After linking, future SSO logins should not require password confirmation.

### Shibboleth rules

Shibboleth uses SAML 2.0 but has stricter federation requirements:

- Global Shibboleth endpoints rather than per-provider scoped callback paths.
- Mandatory signed authentication requests.
- Mandatory encrypted assertions.
- SHA256 digest and RSA-SHA256 signature methods.
- Persistent NameID format.
- Required `eduPersonTargetedID` as primary UID.
- Required email address.
- Optional given name and surname.
- New Shibboleth users are created with academia sector.

Critical Shibboleth invariant:

```text
uid = eduPersonTargetedID if present else email
```

If `eduPersonTargetedID` is missing, surface a configuration/attribute-release error.

## MFA / 2FA

MFA supports:

- TOTP one-time passwords generated by an authenticator app.
- Ten single-use backup codes.

### Enabling MFA

1. User logs in normally.
2. User opens Profile.
3. User enables Two Factor Authentication.
4. Backend generates an OTP secret and displays QR code/manual setup key.
5. User scans QR or enters setup key in an auth app.
6. User enters a generated 6-character code.
7. On success, backend stores the secret, enables MFA, and generates backup codes.
8. User can copy/download backup codes.

### MFA login

- After valid username/password, if `otp_required_for_login` is true, show MFA prompt.
- User may provide TOTP code or backup code.
- Maximum attempts: 3 per login session. After that, user must restart login.
- OTP drift/leeway is 30 seconds.
- `remember_me` state is preserved and applied after successful 2FA.

### Backup codes

- 10 backup codes are generated.
- Format resembles `LRG2-1WIT-B1NS` for readability.
- Codes are one-way encrypted and cannot be recovered; lost codes must be regenerated.
- Regenerating backup codes requires a valid OTP attempt.

### MFA exclusions

- LabTrack bypasses 2FA.
- SSO bypasses application-level 2FA because second factor is expected at the SSO provider.

## Profile settings

Profile settings are global to the user across labs:

- Name is mandatory: first name and last name.
- Title, position, language, gender, phone, contact timeframe, and avatar are optional.
- Date format affects display throughout the app.
- Time format affects display throughout the app.
- Email is mandatory and disabled/non-editable in profile.
- Contact timeframe has no validation; end can be earlier than start and the value is not currently used elsewhere.
- Password update requires current password, new password, and confirmation.

## Notification settings

Notification settings page has role-specific versions:

- Admin version if user is admin in at least one lab.
- Instructor version if user is not admin anywhere but instructor in at least one lab.
- Guest/Student/Researcher version otherwise.

Instructor notification scoping examples:

- New users: only users invited by that Instructor.
- User actions/requests: only equipment/services where that user is Instructor.
- Equipment access: equipment the user receives access to in labs where they are not Instructor.
- Maintenance: only equipment where the user is Instructor.
- Equipment confirmations: bookings needing approval in labs where the user is not Instructor.
- Updates on my bookings: bookings created by the user in any lab.
- Services notifications are hidden when the Services config toggle is off.
- Announcement notifications are sent when the user is in the recipient list.

Admin booking request email rule:

- All admins in the lab where the booking was made receive the booking request email, regardless of contact-person assignment.
