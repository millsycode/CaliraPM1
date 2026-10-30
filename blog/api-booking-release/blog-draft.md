<!--
DRAFT: comprehensive version, intended to be edited down.
Style matched to: "Improvements to training visibility, group booking control, and more" (calira.co/blog)
Suggested author line: Chris Mills, Head of Product
Suggested read time once trimmed: 5–6 min
[IMAGE: …] markers show where a screenshot or diagram would help.
Sections marked (optional: technical) can be cut for a less developer-focused audience.
-->

# The Calira API can now book equipment, not just read it

*Create and update bookings, add notes, find free slots and manage participants, all from your own systems. Here's everything that's new in the Calira API.*

**Chris Mills**, Head of Product

---

Until recently, the Calira API was read-only. You could pull equipment, bookings, projects and groups out of Calira and into your own reporting tools, but you couldn't push anything back in. If you wanted a booking made, someone had to make it in Calira.

That's changing. A few weeks ago we released the ability to create and update equipment through the API. Today we're adding the part most of you have been asking for: **full booking management.** Your LIMS, ELN, scheduling tools, instrument software and internal portals can now create and update bookings directly in Calira. The same rules, approvals and notifications apply as if the booking had been made in the app.

This is a big release, so we've split it into sections below.

## Create bookings from anywhere

Some of you had early access to a basic beta version of booking creation. That version handled a simple booking on a single instrument at a set time. The version we're releasing today covers almost everything you can do on the Calira booking form.

- **Book any instrument in one call.** Send an equipment ID, a start time and an end time, and Calira takes care of the rest. The response tells you straight away whether the booking is **confirmed** or **pending approval**, so your system always knows where it stands.
- **The same rules as the app.** Bookings made through the API follow the equipment's settings exactly: overlap protection, usage limits, minimum and maximum durations, advance notice and business hours. There's no back door, and your lab rules stay your lab rules. If a rule blocks a booking, the API returns a clear, human-readable reason so your users know what to change.
- **Approval workflows still apply.** If an instrument needs admin approval, API bookings join the same queue as everyone else's, and admins are notified in the usual way.
- **Recurring bookings.** Create a daily, weekly, monthly or yearly series in a single request. Weekly bookings can repeat on several days, for example every Monday and Thursday. Monthly bookings can repeat on a date (the 14th) or a weekday pattern (the second Tuesday). You choose what happens when a slot in the series is already taken. By default, clashes are skipped, and admins and instructors can choose to overlap or decline existing bookings instead.
- **Book on behalf of others.** Admins and instructors can create bookings for another member of the lab, which is ideal for core facility staff running samples for researchers, or for a booking assistant embedded in another system. The response records both the **creator** and the **booking owner**, so usage and billing go to the right person.
- **Group bookings.** Add participants to a booking when you create it. Calira checks that they're lab members with access to the instrument and that group bookings are enabled for your lab and access group, then invites them just as it would in the app.
- **Projects and funding codes.** Assign one or more lab projects to a booking and split the cost across funding codes by percentage. If your finance or grant management system already knows which code a piece of work belongs to, it can now tell Calira directly, so billing is correct from the start.
- **Add-ons, priced automatically.** Include consumables, training or any other add-on configured on the instrument. You just send the add-on name (and a quantity, where needed), and Calira works out the price from the equipment's settings. Mandatory add-ons are enforced, so nothing gets missed.
- **Maintenance bookings.** Block out time for preventative maintenance, cleaning, calibration, breakdowns or repairs, and record whether the work is internal or external. It's a natural fit for connecting a CMMS or service-contract system to your equipment calendar.

[IMAGE: a booking created via the API shown in the Calira calendar, with participants, project and add-ons visible]

*A booking created through the API looks and behaves exactly like one made in Calira.*

## Update bookings without starting over

Plans change. Now your integrations can change with them.

- **Reschedule.** Move a booking's start or end time. Participants get the usual "booking updated" notifications, so nobody turns up at the wrong time.
- **Manage participants.** Add or remove people from a group booking. Anyone removed is notified and their Outlook event is taken down automatically. (You can't add new participants to a booking that has already finished.)
- **Change projects and funding.** Reassign the booking to a different project or rebalance the funding split, which is handy when a cost needs moving after the fact. Send an empty list to clear the allocation. Leave it out altogether and nothing changes.
- **Adjust add-ons.** Update consumable quantities or add-ons after the booking is made. The price is recalculated from the equipment's settings.
- **Update maintenance details.** Change the maintenance type or provider as the job becomes clearer.

As with creating a booking, every update is checked against the same equipment rules and permissions as in the app. Booking owners can edit their own bookings within the lab's editing rules, and admins and instructors can manage bookings on equipment they look after.

## Booking notes and attachments

Booking notes are one of the most-used features in Calira. They're where people record sample details, instrument settings, run outcomes and anything else the next person needs to know. Until now, notes could only be added by hand. Now they can be added automatically.

- **Add notes to any booking.** Post a text note to a booking from your own systems. Instrument software could log run parameters when a session ends, or an ELN could link back to the relevant experiment.
- **Attach files.** Attach a PDF, Word or Excel document, image or zipped data file of up to 20 MB (up to 10 files per booking). Results, protocols and reports end up alongside the booking they relate to.
- **Edit existing notes.** Update a note's text or attach an additional file. Existing attachments are never overwritten, so nothing is accidentally lost.
- **Notes sync to Outlook.** As with notes added in the app, API notes flow into the Outlook calendar event, and the right people are notified when a note is added or changed.

[IMAGE: a booking's notes panel showing an API-added note with an attached PDF]

## New helper endpoints for building great booking experiences

Making a good booking takes more than a create button. You need to know when the instrument is free, who can join the booking and what add-ons will apply. We've added a set of supporting endpoints so you can build a proper booking experience into your own tools, rather than making users guess and hoping the booking goes through.

- **See when an instrument is free.** The new available slots endpoint returns the open time slots on any instrument across a window of up to two weeks. It takes account of existing bookings (including those awaiting approval) and any periods where the equipment has been marked as unavailable. Use it to show a "next available" time, build a slot picker, or find a gap before you try to book. Users in other labs within the same organisation can also check availability on equipment that's shared with them.
- **Know the add-ons before you book.** The booking add-ons endpoint lists the add-ons that will apply to *the person booking*, including which are mandatory and how they're priced. It uses the same rules as the booking form, including first-booking-only charges and admin overrides, so what you show your users matches what Calira will charge.
- **Find people to invite.** The new equipment users endpoint lists the lab members who have access to a given instrument. It's exactly the list you need when choosing participants for a group booking, and it saves your users from inviting someone who can't use the equipment.
- **List your lab members.** Admins and instructors can now pull a full, paginated list of their lab's active members, including names, emails and roles. It's useful for syncing Calira users with an HR system, directory or access control platform, and it's covered by a new `read_users` permission so you choose exactly which integrations can see it.

[IMAGE: example UI in a partner tool, a slot picker powered by the available slots endpoint]

## Create and update equipment

If you missed our last update: the API can now create and update equipment as well as read it. Together with today's booking release, you can now set up an instrument and start taking bookings on it without logging into Calira.

- **Add new equipment.** Create equipment with its name, category, manufacturer, model, serial number, location, internal ID and more. It's ideal for onboarding a batch of new instruments from an asset register or procurement system.
- **Configure pricing.** Set the charging type (per hour or per day), currency, internal price and add-ons, including advanced pricing where you need it.
- **Set booking rules.** Define minimum and maximum booking times, time steps, start times and advance booking windows through the API, just as you would in the equipment settings.
- **Assign contacts and groups.** Set the admins or instructors who look after an instrument, and control which access groups can book it. A helper endpoint lists the people who can be assigned as contacts.
- **Upload photos and documents.** Attach equipment photos and documents such as SOPs, manuals and risk assessments using our secure direct upload process.
- **Keep everything in sync.** Update any of these details at any time. Equipment responses now include the instrument's add-on configuration in the same format the update endpoint accepts, so you can read it, change it and send it straight back.

## Built for safe, controlled access

Opening up write access to your lab's calendar is a big step, and we've designed this release so you stay in control.

- **Separate permissions for reading and writing.** Integrations need the `write_bookings` permission to make or change bookings, and the new `read_users` permission to see lab member details. An integration built for reporting can't start making bookings unless you've allowed it to.
- **Everything is done as a real user.** Every API call runs as the Calira user who authorised the integration, with exactly that user's permissions. A researcher's token can book what that researcher can book and nothing more.
- **Lab-level authorisation.** Integrations only work in the labs they've been authorised for.
- **Clear, actionable errors.** When a request is rejected, the API explains what went wrong and how to fix it, whether that's a missing field, a permission gap, a lab setting that needs switching on or a booking rule that's been hit. It makes integrations quicker to build and easier to support.
- **Rate limits to protect your data.** Write endpoints are rate-limited, so a misbehaving script can't flood your calendar.

## What you could build

Here are a few ideas we've heard from customers while building this:

- **Book from your LIMS or ELN.** When a researcher schedules an experiment, the instrument time is booked in Calira automatically, with the right project and funding code already attached.
- **Instrument-side logging.** When a run finishes, the instrument software posts the run parameters and results file as a booking note.
- **Maintenance automation.** Your CMMS or service contract system books maintenance windows directly into the equipment calendar, so nobody books an instrument that's due for calibration.
- **Core facility request portals.** Staff book instrument time on behalf of the researchers they're running samples for, and each researcher is charged correctly.
- **Chatbots and assistants.** "When is the confocal free next week?" can be answered, and booked, without leaving Teams or Slack.
- **Onboarding at scale.** New instruments go straight from the procurement system into Calira with pricing, rules and documents already in place, ready to book.

## (Optional: technical) A quick look under the hood

For the developers reading, here's what creating a recurring group booking with a project split looks like:

```http
POST https://api.clustermarket.com/v1/bookings
Authorization: Bearer <token with write_bookings>
Content-Type: application/json

{
  "equipment_id": 1234,
  "start_time": "2026-10-12T09:00:00Z",
  "end_time": "2026-10-12T11:00:00Z",
  "invited_users": [{ "user_id": 5678 }],
  "projects": [{
    "project_id": 42,
    "funding_codes": [
      { "funding_code_id": 7, "funding_code_percentage": 60 },
      { "funding_code_id": 8, "funding_code_percentage": 40 }
    ]
  }],
  "add_ons": [{ "equipment_addon": "Consumables", "quantity": "2" }],
  "recurrence": {
    "recurrence_type": "weekly",
    "recurrence_days": ["monday", "thursday"],
    "recurrence_interval": 1,
    "recurrence_end": "2026-12-18"
  }
}
```

And finding a free slot first:

```http
GET https://api.clustermarket.com/v1/equipment_available_slots/1234?start_time=2026-10-12T00:00:00Z&end_time=2026-10-19T00:00:00Z
```

```json
{
  "available_slots": [
    { "start_time": "2026-10-12T00:00:00Z", "end_time": "2026-10-12T09:00:00Z" },
    { "start_time": "2026-10-12T11:00:00Z", "end_time": "2026-10-19T00:00:00Z" }
  ]
}
```

### New endpoints at a glance

| Endpoint | What it does |
|---|---|
| `POST /bookings` | Create a booking (use or maintenance, recurring, on behalf, group, projects, add-ons) |
| `PATCH /bookings/{id}` | Update times, participants, projects, add-ons and maintenance details |
| `POST /booking/notes/{booking_id}` | Add a note, with an optional file, to a booking |
| `PATCH /booking/notes/{note_id}` | Edit a note or attach another file |
| `GET /equipment_available_slots/{equipment_id}` | Free time slots on an instrument (up to 2 weeks) |
| `GET /equipment/{id}/booking_add_ons` | Add-ons that will apply to the booking user |
| `GET /equipment/{id}/users` | Lab members with access to an instrument |
| `GET /users/{account_id}` | Active members of a lab (admins and instructors) |
| `POST /equipment` | Create equipment |
| `PATCH /equipment/{id}` | Update equipment |

Full request and response details, including every error code, are in our [API documentation](https://apidocs.clustermarket.com/).

## Other improvements

We've also made a few smaller changes to existing endpoints:

- Booking details and booking lists now include the **maintenance type and provider**, and booking lists include **when each booking was created**.
- Equipment details now include the instrument's **add-on configuration**.
- The file upload endpoint now supports **booking note attachments** as well as equipment photos and documents.

## More on the way

This release turns the Calira API into a genuine two-way connection with the rest of your lab's systems, and we're not stopping here. Keep your eyes peeled for even more updates!

If you're already using the API, you can start using these endpoints straight away by generating a token with the new permissions. If you'd like help planning an integration, or you think these capabilities could be useful in your lab, site or across your wider organisation, we'd be happy to give you a live demo and show you how the wider Calira platform works. You can click here to book a half hour call with a member of our team.
