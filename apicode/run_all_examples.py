"""
run_all_examples.py
===================

Calls every example in endpoints.py in a sensible order and writes an HTML
report (config.REPORT_FILE) showing whether each call passed or failed.

Before running:
  1. Fill in config.py (client ID/secret and the IDs in section 3).
  2. Run "python auth.py" once to connect to Calira.

Then run:
  python run_all_examples.py

NOTE: this script creates real data in Calira (a piece of equipment, a
booking and a booking note). Remove them afterwards if you don't need them.

Some calls depend on earlier ones - for example, you can't update a booking
that was never created. If an earlier call fails, the later calls that need
its result are marked "SKIPPED" instead of being run.
"""

import html
import time
from datetime import datetime, timedelta, timezone

import config
import endpoints


# Every call made is added to this list, and the list is turned into the report.
results = []


# ---------------------------------------------------------------------------
# Helpers for recording results
# ---------------------------------------------------------------------------

def run_step(name, endpoint, function, *args, **kwargs):
    """
    Run one endpoint function, record the outcome, and return the response.

    Returns None if the call failed, so later steps know not to continue.
    """
    start = time.time()
    try:
        response = function(*args, **kwargs)
    except Exception as error:  # e.g. no internet connection, or no saved token
        results.append({"name": name, "endpoint": endpoint, "outcome": "FAIL",
                        "status": "-", "ms": int((time.time() - start) * 1000),
                        "detail": f"{type(error).__name__}: {error}"})
        return None

    # A status code in the 200s means the call succeeded.
    outcome = "PASS" if response.ok else "FAIL"
    results.append({"name": name, "endpoint": endpoint, "outcome": outcome,
                    "status": response.status_code,
                    "ms": int((time.time() - start) * 1000),
                    "detail": response.text[:500]})  # first 500 characters only
    return response if response.ok else None


def skip_step(name, endpoint, reason):
    """Record a step that was not run because something it needed is missing."""
    results.append({"name": name, "endpoint": endpoint, "outcome": "SKIPPED",
                    "status": "-", "ms": 0, "detail": reason})


def iso(moment):
    """Format a datetime the way the Calira API expects, e.g. 2026-12-01T09:00:00Z."""
    return moment.strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------------------------------------------------------------------------
# The master function
# ---------------------------------------------------------------------------

def run_all_examples():
    """Call every endpoint in order, then write the HTML report."""
    account_id = config.ACCOUNT_ID
    equipment_id = config.EQUIPMENT_ID

    # ---- User and accounts ------------------------------------------------
    run_step("Get current user", "GET /user", endpoints.get_current_user)
    run_step("List accounts", "GET /accounts", endpoints.list_accounts)
    run_step("Get account", "GET /accounts/{id}", endpoints.get_account, account_id)

    # ---- Projects: list them, then fetch the first one ---------------------
    response = run_step("List projects", "GET /accounts/{id}/projects",
                        endpoints.list_projects, account_id)
    if response and response.json():
        project_id = response.json()[0]["id"]
        run_step("Get project", "GET /accounts/{id}/projects/{id}",
                 endpoints.get_project, account_id, project_id)
    else:
        skip_step("Get project", "GET /accounts/{id}/projects/{id}", "No project found in the list.")

    # ---- Groups: list them, then fetch the first one -----------------------
    response = run_step("List groups", "GET /groups", endpoints.list_groups, account_id)
    if response and response.json():
        group_id = response.json()[0]["id"]
        run_step("Get group", "GET /groups/{id}", endpoints.get_group, group_id)
    else:
        skip_step("Get group", "GET /groups/{id}", "No group found in the list.")

    # ---- Users -------------------------------------------------------------
    run_step("List lab users", "GET /users/{account_id}", endpoints.list_lab_users, account_id)
    run_step("List equipment users", "GET /equipment/{id}/users",
             endpoints.list_equipment_users, equipment_id)

    # ---- Equipment (reading) -----------------------------------------------
    run_step("List equipment (one page)", "GET /equipment", endpoints.list_equipment, account_id)

    # Pagination example: get_all_pages() calls list_equipment once per page.
    run_step("List equipment (all pages)", "GET /equipment (every page)",
             lambda: endpoints.get_all_pages(endpoints.list_equipment, account_id)[1])

    run_step("Get equipment", "GET /equipment/{id}", endpoints.get_equipment, equipment_id)
    run_step("List equipment bookings", "GET /equipment/{id}/bookings",
             endpoints.list_equipment_bookings, equipment_id)
    run_step("List equipment contact people", "GET /equipment/contact_people",
             endpoints.list_equipment_contact_people, account_id)
    run_step("List booking add-ons", "GET /equipment/{id}/booking_add_ons",
             endpoints.list_booking_add_ons, equipment_id)

    # ---- Bookings (reading) and custom form responses -----------------------
    response = run_step("List bookings", "GET /bookings", endpoints.list_bookings, account_id)

    # The list endpoint doesn't include custom form responses - only the
    # single-booking endpoint (get_booking) does. So fetch each booking's full
    # details in turn, and stop at the first one that has a custom form response.
    response_id = None
    if response:
        for booking_summary in response.json():
            # Call get_booking directly (not through run_step) so the report
            # doesn't get one row for every booking we check.
            booking_response = endpoints.get_booking(booking_summary["id"])
            if not booking_response.ok:
                continue  # couldn't read this booking - try the next one

            form_responses = booking_response.json().get("custom_form_responses") or []
            if form_responses:
                response_id = form_responses[0]["response_id"]
                break

    if response_id:
        run_step("Get custom form response", "GET /custom_form_responses/{id}",
                 endpoints.get_custom_form_response, response_id)
    else:
        skip_step("Get custom form response", "GET /custom_form_responses/{id}",
                  "None of the listed bookings has a custom form response.")

    # ---- Equipment (creating and updating) ----------------------------------
    # 1. Read the template equipment to copy its category and subcategory.
    response = run_step("Get template equipment", "GET /equipment/{id}",
                        endpoints.get_equipment, config.TEMPLATE_EQUIPMENT_ID)
    category = response.json().get("category") if response else None
    subcategory = response.json().get("subcategory") if response else None

    # 2. Upload a photo for the new equipment (register it, then send the bytes).
    photo_signed_id = None
    response = run_step("Register photo upload", "POST /uploads", endpoints.register_upload,
                        config.SAMPLE_PHOTO_FILE, config.SAMPLE_PHOTO_CONTENT_TYPE, "photo")
    if response:
        upload = response.json()
        if run_step("Upload photo bytes", "PUT direct_upload.url",
                    endpoints.upload_file_bytes, config.SAMPLE_PHOTO_FILE, upload["direct_upload"]):
            photo_signed_id = upload["signed_id"]
    else:
        skip_step("Upload photo bytes", "PUT direct_upload.url", "Photo upload was not registered.")

    # 3. Create the equipment, then rename it.
    if category:
        response = run_step("Create equipment", "POST /equipment", endpoints.create_equipment,
                            account_id, config.NEW_EQUIPMENT_NAME, category, subcategory,
                            config.NEW_EQUIPMENT_MANUFACTURER, config.NEW_EQUIPMENT_MODEL_NUMBER,
                            config.NEW_EQUIPMENT_AVAILABILITY,
                            [photo_signed_id] if photo_signed_id else None)
        new_equipment_id = response.json()["equipment"]["id"] if response else None
    else:
        skip_step("Create equipment", "POST /equipment", "No category from the template equipment.")
        new_equipment_id = None

    if new_equipment_id:
        run_step("Update equipment", "PATCH /equipment/{id}", endpoints.update_equipment,
                 new_equipment_id, config.UPDATED_EQUIPMENT_NAME)
    else:
        skip_step("Update equipment", "PATCH /equipment/{id}", "Equipment was not created.")

    # ---- Bookings (creating and updating) ------------------------------------
    # 1. Work out a search window starting a few days from now, at a set hour.
    search_start = (datetime.now(timezone.utc) + timedelta(days=config.BOOKING_SEARCH_START_DAYS_FROM_TODAY)
                    ).replace(hour=config.BOOKING_SEARCH_START_HOUR_UTC, minute=0, second=0, microsecond=0)
    search_end = search_start + timedelta(days=config.BOOKING_SEARCH_WINDOW_DAYS)

    # 2. Ask Calira for free slots in that window and use the first one.
    response = run_step("Get available slots", "GET /equipment_available_slots/{id}",
                        endpoints.get_available_slots, equipment_id, iso(search_start), iso(search_end))
    slots = response.json().get("available_slots", []) if response else []

    # 3. Find the first free slot long enough for our booking.
    #    fromisoformat() can't read a trailing "Z" in older Python, so swap it for "+00:00".
    booking_start = None
    for slot in slots:
        slot_start = datetime.fromisoformat(slot["start_time"].replace("Z", "+00:00"))
        slot_end = datetime.fromisoformat(slot["end_time"].replace("Z", "+00:00"))
        if slot_end - slot_start >= timedelta(minutes=config.BOOKING_LENGTH_MINUTES):
            booking_start = slot_start
            break

    # 4. Book the start of that slot.
    booking_id = None
    if booking_start:
        booking_end = booking_start + timedelta(minutes=config.BOOKING_LENGTH_MINUTES)
        response = run_step("Create booking", "POST /bookings", endpoints.create_booking,
                            equipment_id, iso(booking_start), iso(booking_end))
        booking_id = response.json()["booking"]["id"] if response else None
    else:
        skip_step("Create booking", "POST /bookings", "No long enough available slot was found.")

    # 5. Read the booking back, then shorten it (a shorter booking is always still free).
    if booking_id:
        run_step("Get booking", "GET /bookings/{id}", endpoints.get_booking, booking_id)
        new_end = booking_start + timedelta(minutes=config.UPDATED_BOOKING_LENGTH_MINUTES)
        run_step("Update booking", "PATCH /bookings/{id}", endpoints.update_booking,
                 booking_id, iso(booking_start), iso(new_end))
    else:
        skip_step("Get booking", "GET /bookings/{id}", "Booking was not created.")
        skip_step("Update booking", "PATCH /bookings/{id}", "Booking was not created.")

    # ---- Booking notes ------------------------------------------------------
    # 1. Upload a PDF to attach to the note.
    note_file_signed_id = None
    response = run_step("Register note file upload", "POST /uploads", endpoints.register_upload,
                        config.SAMPLE_NOTE_FILE, config.SAMPLE_NOTE_CONTENT_TYPE, "booking_note")
    if response:
        upload = response.json()
        if run_step("Upload note file bytes", "PUT direct_upload.url",
                    endpoints.upload_file_bytes, config.SAMPLE_NOTE_FILE, upload["direct_upload"]):
            note_file_signed_id = upload["signed_id"]
    else:
        skip_step("Upload note file bytes", "PUT direct_upload.url", "Note file upload was not registered.")

    # 2. Add the note to the booking, then change its text.
    note_id = None
    if booking_id:
        response = run_step("Create booking note", "POST /booking/notes/{booking_id}",
                            endpoints.create_booking_note, booking_id, config.NOTE_TEXT, note_file_signed_id)
        note_id = response.json()["booking_note"]["note_id"] if response else None
    else:
        skip_step("Create booking note", "POST /booking/notes/{booking_id}", "Booking was not created.")

    if note_id:
        run_step("Update booking note", "PATCH /booking/notes/{note_id}",
                 endpoints.update_booking_note, note_id, config.UPDATED_NOTE_TEXT)
    else:
        skip_step("Update booking note", "PATCH /booking/notes/{note_id}", "Note was not created.")

    # ---- Write the report -----------------------------------------------------
    write_html_report()


# ---------------------------------------------------------------------------
# HTML report
# ---------------------------------------------------------------------------

def write_html_report():
    """Turn the results list into a simple, self-contained HTML page."""
    colours = {"PASS": "#1a7f37", "FAIL": "#cf222e", "SKIPPED": "#6e7781"}
    passed = sum(1 for r in results if r["outcome"] == "PASS")
    failed = sum(1 for r in results if r["outcome"] == "FAIL")
    skipped = sum(1 for r in results if r["outcome"] == "SKIPPED")

    # Build one table row per call. html.escape() stops response text from
    # breaking the page if it contains characters like "<".
    rows = ""
    for number, r in enumerate(results, start=1):
        rows += f"""
        <tr>
          <td>{number}</td>
          <td>{html.escape(r['name'])}</td>
          <td><code>{html.escape(r['endpoint'])}</code></td>
          <td style="color:#fff;background:{colours[r['outcome']]};font-weight:bold;text-align:center">{r['outcome']}</td>
          <td>{r['status']}</td>
          <td>{r['ms']} ms</td>
          <td><details><summary>show</summary><pre>{html.escape(str(r['detail']))}</pre></details></td>
        </tr>"""

    page = f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Calira API Results</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 24px; color: #1f2328; background: #fff; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid #d0d7de; padding: 6px 10px; text-align: left; vertical-align: top; }}
    th {{ background: #f6f8fa; }}
    pre {{ white-space: pre-wrap; word-break: break-all; max-width: 600px; }}
  </style>
</head>
<body>
  <h1>Calira API example results</h1>
  <p>API: <code>{html.escape(config.API_BASE_URL)}</code><br>
     Run at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
  <p><b style="color:{colours['PASS']}">{passed} passed</b> &middot;
     <b style="color:{colours['FAIL']}">{failed} failed</b> &middot;
     <b style="color:{colours['SKIPPED']}">{skipped} skipped</b></p>
  <table>
    <tr><th>#</th><th>Step</th><th>Endpoint</th><th>Result</th><th>HTTP status</th><th>Time</th><th>Response (first 500 characters)</th></tr>
    {rows}
  </table>
</body>
</html>"""

    with open(config.REPORT_FILE, "w", encoding="utf-8") as report:
        report.write(page)
    print(f"{passed} passed, {failed} failed, {skipped} skipped. Report written to {config.REPORT_FILE}")


if __name__ == "__main__":
    run_all_examples()
