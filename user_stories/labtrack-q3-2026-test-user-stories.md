# LabTrack Q3 2026: test user stories

Acceptance tests for the Itransition build, written from the Statement of Work. Every story is checked through the LabTrack screens. Where the outcome has to be confirmed on the server, the check is made in the Calira web app.

[[_TOC_]]

## How to use this

- Each story names the SOW requirement IDs it covers (S-, A-, O-, P-, B-).
- Expected results come from the SOW and the current screens. Any new wording from the Itransition build (for example the offline screen, the countdown text) is marked **(confirm)** where the exact text is not yet known. Record what the build shows and update the story.
- A story passes only if every checkbox passes. Log failures against the story ID.
- Severity (from the SOW): **Sev 1** login or tracking fails. **Sev 2** an item's main function fails with no workaround.

## Test data and set-up

| Need | Detail |
| --- | --- |
| Lab A (SSO) | A lab with a SAML identity provider and at least two test users who can complete the IdP sign-in. Also ideally one lab whose provider is inherited from its department or organisation |
| Lab B (no SSO) | A lab with no identity provider, with Calira password users |
| Equipment | One piece of equipment in each lab, each with a LabTrack install linked to that lab and equipment |
| Users | `Owner` (makes the booking), `Participant-Accepted`, `Participant-Pending`, `Participant-Rejected` (invited to the booking), `Stranger` (no relation to the booking), `Admin` (lab admin with an admin PIN), `Admin-2` (second admin with a different PIN) |
| Bookings | A booking in progress now, with the participants above. Also a short booking ending in about 7 minutes for the timer tests, and one starting in the future |
| Workstations | Windows 10 or 11 with LabTrack installed. One with two monitors. One where you can disable the network adapter. One "fresh" install that has never had an admin sign in |
| Settings | In LabTrack Settings, know the values for: booking required, booking unlock window, auto logout enabled and time, free-session auto logout enabled and time |
| Calira web app | Access to view a booking's actual start and end times and who is recorded against the usage |

**Build under test:** version ______  **Date:** ______  **Tester:** ______

---

## Item 3.5: Admin PIN bug

### LT-T01: A bad PIN confirmation never changes the PIN
**As a** lab admin, **I want** the Admin PIN to change only when I confirm it correctly, **so that** I don't accidentally lock myself or others out. *(B-1, B-2)*

On the Settings screen, enter a new Admin code and use **Update settings**. After each case below, test the **old** PIN and the **new** PIN with **Bypass with admin code** on the login screen.

- [ ] New PIN entered, confirmation left empty: an error is shown, the old PIN still works, the new PIN is rejected with "Invalid admin code."
- [ ] New PIN entered, different confirmation: "Admin code doesn't match" is shown, the old PIN still works, the new PIN is rejected.
- [ ] Confirmation entered, new PIN left empty: a clear error is shown, the old PIN still works. **(confirm wording)**
- [ ] In each case above, no "Settings updated successfully." message is shown for the PIN.
- [ ] In the Calira web app, no change to the admin's PIN-related account data is visible. **(confirm what can be checked)**

### LT-T02: Matching PINs still update the PIN, and other settings still save
**As a** lab admin, **I want** a correctly confirmed new PIN to work, **so that** I can rotate it. *(B-3, B-4)*

- [ ] New PIN and matching confirmation: "Settings updated successfully." is shown. The new PIN works with **Bypass with admin code**, and the old PIN no longer works.
- [ ] Change **Launch on startup** only, leaving the PIN fields empty: it saves with no PIN error and the PIN is unchanged.
- [ ] On a fresh install setup, the admin PIN setup screen still refuses an empty PIN ("No PIN specified") and a mismatched confirmation ("PINs don't match"), and does not continue.

---

## Item 3.1: User session awareness

### LT-T03: The warning counts down in real time
**As a** scientist, **I want** the logout warning to show the true time left, **so that** I know when I will be logged out. *(S-1, S-4, S-6)*

Use the booking ending in about 7 minutes (booked session) and repeat with a free session (no booking, short auto-logout period set in Settings).

- [ ] The warning dialog ("Session will end soon") appears 5 minutes before logout and shows a time left in minutes and seconds that ticks down at least once a second. **(confirm wording)**
- [ ] Switch away from the dialog for 60 seconds and come back: it shows the true time left, not a stale "5 minutes".
- [ ] The value never goes below zero.
- [ ] Logout happens at the expected time (booking end plus the grace period, or the free-session period), within 2 seconds, in both the booked and free session.
- [ ] Putting the PC to sleep for a few minutes during the warning, then waking it, shows the correct remaining time (or logs the user out if time has passed). Changing the system clock by a few minutes does the same. *(optional if time allows)*

### LT-T04: The warning moves to the centre for the final seconds
**As a** scientist, **I want** the warning to be impossible to miss at the end, **so that** I don't lose work. *(S-2, S-7)*

- [ ] While more than 30 seconds remain, the dialog appears in its normal position and does not take over the screen.
- [ ] At 30 seconds or less, the dialog moves to the centre of the screen, is in front of other windows, and has focus.
- [ ] Open another application full screen before the final 30 seconds: the dialog still comes to the front.
- [ ] On a two-monitor workstation, the centred dialog appears on the monitor where LabTrack is shown.

### LT-T05: Adding time updates the countdown and logout
**As a** scientist, **I want** to extend my session from the warning, **so that** I can finish my work. *(S-3)*

- [ ] With the dialog open, use **Delay** (for example 15 minutes). The dialog closes, and logout now happens 15 minutes later than before.
- [ ] While the dialog is open, extend the booking in the Calira web app. The countdown and the real logout time follow the new end time. If the new end is more than 5 minutes away, the dialog closes.
- [ ] Shorten the booking in the Calira web app while the dialog is open: the countdown follows the new, earlier time.
- [ ] **Cancel** closes the dialog and the logout time is unchanged.

### LT-T06: Admin and auto-logout-off behaviour is unchanged
**As an** admin, **I want** nothing to change for me, **so that** my work is not interrupted. *(S-5)*

- [ ] Signed in with **Bypass with admin code**, or as a lab admin: no warning appears and you are not logged out automatically.
- [ ] With **auto logout** turned off in Settings (booked and free), no warning appears and no automatic logout occurs.

---

## Item 3.2: Authentication and MFA fatigue

### LT-T07: Login via organisation goes straight to the SSO page
**As a** scientist at a lab with SSO, **I want** "Login via your organisation" to go straight to my organisation's sign-in, **so that** I don't have to find my organisation each time. *(A-1, A-2, A-4)*

Use the LabTrack install linked to Lab A.

- [ ] Click **Login via your organisation**. The embedded window goes to the customer's SSO page with no tenant or organisation search and no extra "Log in via your organisation" click.
- [ ] No page is briefly shown that then disappears or is clicked by itself (no flash of the Calira login page or provider search). **(confirm)**
- [ ] Complete the IdP sign-in and MFA: you are returned to LabTrack and logged in, and the booking is shown.
- [ ] The IdP's MFA prompt still appears. This change does not remove it.
- [ ] Repeat with a lab whose provider is inherited from its department or organisation: same result.
- [ ] **Cancel** in the sign-in window returns to the LabTrack login screen.

### LT-T08: A lab without SSO still works
**As a** scientist at a lab with no SSO, **I want** login to behave as it does today, **so that** I can still sign in. *(A-3)*

- [ ] On the install linked to Lab B, **Login via your organisation** shows the usual Calira sign-in or organisation search (today's behaviour). **(confirm exact page)**
- [ ] Email and password sign-in on the LabTrack screen still works and shows the booking.
- [ ] On a fresh install where the lab has not been set yet (initial setup), the lab admin can still sign in to complete setup.

---

## Item 3.3: Critical offline blocker

### LT-T09: A network loss no longer traps the workstation
**As a** scientist, **I want** LabTrack to show a useful screen when the network is down, **so that** the machine is not locked. *(O-1, O-2, O-5)*

- [ ] Disable the network adapter, then click **Login via your organisation**. Instead of the browser's "This site can't be reached" page, a LabTrack screen appears with **Try again**, **Back** and **Bypass with admin code**. **(confirm wording)**
- [ ] **Back** returns to the login screen. **Bypass with admin code** is reachable in at most two clicks from the login screen.
- [ ] Start LabTrack with the network already disabled: the same offline options are available.
- [ ] Re-enable the network, then click **Try again** (or **Login via your organisation**): the SSO page loads and login works, without restarting LabTrack.
- [ ] Disconnect the network during the SSO page load: the offline screen appears, not the browser error.

### LT-T10: Admin bypass works offline on a prepared workstation
**As a** lab admin, **I want** to bypass login with my admin PIN with no network, **so that** the instrument stays usable. *(O-3, O-4)*

First, on a workstation where an admin has signed in or set up LabTrack **while online**, reboot LabTrack (and the PC), then disable the network.

- [ ] Bypass with a correct admin PIN: LabTrack signs in with no delay for a network call.
- [ ] An incorrect PIN shows "Invalid admin code." and does not hang.
- [ ] Every admin who signed in on that workstation while online can use their own PIN offline. A different admin who has not signed in there cannot. **(confirm intended behaviour with the product owner)**
- [ ] Re-enable the network: bypass still works, and PINs validated online behave as before.

### LT-T11: An unprepared workstation says so
**As a** lab admin, **I want** a clear message if offline bypass is not available, **so that** I know what to do. *(O-4)*

On the "fresh" install where no admin has ever signed in online, disable the network.

- [ ] **Bypass with admin code** with any PIN shows a clear message that bypass is unavailable offline until an admin signs in while online. **(confirm wording)** It does not just say "Invalid admin code."
- [ ] After an admin signs in online once, the offline bypass then works (repeat LT-T10).

### LT-T12: Offline bypass does not start a tracked booking
**As a** lab manager, **I want** offline bypass to give instrument access without creating usage records, **so that** bookings stay accurate. *(O-6)*

- [ ] After an offline bypass, the Calira web app shows no new actual start time on any booking, and no new free-tracking usage.
- [ ] After the network returns and the user ends the session, no usage appears in Calira for the offline period. **(confirm with the product owner that this is the intended result)**

---

## Item 3.4: Participant log on

### LT-T13: A participant can log in and track
**As a** researcher invited to a booking, **I want** to log in to LabTrack during the booking, **so that** I can run the work at the instrument. *(P-1, P-4, P-5)*

Sign in as `Participant-Accepted` during the booking window, then as `Participant-Pending`.

- [ ] Login succeeds and the booking is shown as the user's current booking, with the same status badge as the owner would see ("In progress", "Booked time", and so on).
- [ ] Starting the session works, and **End session** works.
- [ ] In the Calira web app, the booking shows the actual start and end times from the session.
- [ ] The usage is recorded against the **participant who logged in**, not the booking owner. **(confirm where this is visible in the web app)**
- [ ] Auto-logout and the warning (LT-T03) behave the same as for the owner.

### LT-T14: People who are not on the booking are still blocked
**As a** lab manager, **I want** only the owner and invitees to use the booking, **so that** access stays controlled. *(P-1, P-4)*

- [ ] `Stranger` signs in during the booking: they see "There are no bookings associated with this account starting in the next N minutes." and cannot start the session.
- [ ] `Participant-Rejected` signs in during the booking: record the result. The SOW says any invited user counts as a participant, so expect login to succeed. **If the build refuses, log it and raise with the product owner.**
- [ ] A participant signing in **before** the unlock window opens, or **after** the booking and window have ended, cannot start the session.

### LT-T15: The owner is unaffected, and several bookings choose the right one
**As the** booking owner, **I want** my login to behave as before, **so that** nothing regresses. *(P-1, P-2)*

- [ ] `Owner` logs in during the booking: same screen, badges and session behaviour as in the previous release.
- [ ] A user who is the owner of one booking and a participant of another at the same equipment sees the booking happening **now**. With none happening now, they see the nearest future booking. "Next booking" shows the following one.
- [ ] A participant with a booking at a different piece of equipment cannot log in to this one.

---

## Regression and compatibility

### LT-T16: Core flows still work
**As a** product owner, **I want** to know nothing else broke, **so that** I can release. *(SOW section 6 regression pass)*

- [ ] Email and password login and an owner's booked session: start, tracked time, end session, logout.
- [ ] A free session on equipment that does not require a booking: start, end.
- [ ] Admin bypass online, with the correct PIN and with a wrong PIN.
- [ ] Settings saves other values (equipment, booking unlock window, auto logout times) correctly.
- [ ] A session ended while online appears correctly in the Calira web app.
- [ ] A session started during a short network interruption syncs when the network returns. **(confirm current behaviour first)**
- [ ] Minimise to the tray and restore: the application and the auto-logout lock still work on the primary monitor.

---

## Notes for testers

- **Parameter names differ from the SOW.** The SSO work on the Calira side (branch `6817-labtrack-extend-oauth`) passes `account_id` on the authorize request and uses the page `/users/auth/start`, not `lab_id` as the SOW says. This is not visible in LabTrack, but if Itransition's build does not send the account ID the user will see the old provider search in LT-T07. Treat that as a failure.
- **Participant rule.** Other Calira code treats a rejected invitation differently from pending or accepted ones (it is excluded from note visibility). The SOW says any invited user can log on. LT-T14 records what the build actually does, so the decision can be confirmed.
- **Not tested here:** the API responses themselves, registry contents, installer, and security review of stored hashes. Those are covered by Itransition's tests and the security gate.
