"""
endpoints.py
============

One example function for each Calira REST API endpoint.

Every function:
  * builds the full URL from config.API_BASE_URL plus the endpoint path,
  * sends the request with a fresh access token (see auth.build_headers),
  * returns the "requests" Response object, so you can check
    response.status_code and read response.json() yourself.

A status code in the 200s means success. Common failures are:
  401 - the token is missing, invalid or expired
  403 - missing scope, or the user / app is not allowed to do this
  404 - the record (or the URL) does not exist
  422 - the request body failed validation (the response explains why)
  429 - too many write requests in one minute; wait and try again

List endpoints return at most config.PER_PAGE records per call. See
get_all_pages() at the bottom for how to fetch every page.
"""

import base64
import hashlib
import os

import requests

import auth
import config


# ===========================================================================
# USER
# ===========================================================================

def get_current_user():
    """GET /user - details of the user the access token belongs to. Scope: read_user."""
    url = f"{config.API_BASE_URL}/user"
    return requests.get(url, headers=auth.build_headers(), timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# ACCOUNTS (organisations, departments and labs)
# ===========================================================================

def list_accounts(page=1):
    """GET /accounts - accounts your application can access. Scope: read_accounts."""
    url = f"{config.API_BASE_URL}/accounts"
    params = {"page": page, "per_page": config.PER_PAGE}
    return requests.get(url, headers=auth.build_headers(), params=params,
                        timeout=config.REQUEST_TIMEOUT_SECONDS)


def get_account(account_id):
    """GET /accounts/{id} - full details of one account. Scope: read_accounts."""
    url = f"{config.API_BASE_URL}/accounts/{account_id}"
    return requests.get(url, headers=auth.build_headers(), timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# PROJECTS
# ===========================================================================

def list_projects(account_id, page=1):
    """GET /accounts/{account_id}/projects - projects in a lab. Scope: read_projects."""
    url = f"{config.API_BASE_URL}/accounts/{account_id}/projects"
    params = {"page": page, "per_page": config.PER_PAGE}
    return requests.get(url, headers=auth.build_headers(), params=params,
                        timeout=config.REQUEST_TIMEOUT_SECONDS)


def get_project(account_id, project_id):
    """GET /accounts/{account_id}/projects/{id} - one project and its funding codes. Scope: read_projects."""
    url = f"{config.API_BASE_URL}/accounts/{account_id}/projects/{project_id}"
    return requests.get(url, headers=auth.build_headers(), timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# GROUPS
# ===========================================================================

def list_groups(account_id, page=1):
    """GET /groups?account={id} - user groups in a lab."""
    url = f"{config.API_BASE_URL}/groups"
    params = {"account": account_id, "page": page, "per_page": config.PER_PAGE}
    return requests.get(url, headers=auth.build_headers(), params=params,
                        timeout=config.REQUEST_TIMEOUT_SECONDS)


def get_group(group_id):
    """GET /groups/{id} - one group."""
    url = f"{config.API_BASE_URL}/groups/{group_id}"
    return requests.get(url, headers=auth.build_headers(), timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# USERS
# ===========================================================================

def list_lab_users(account_id, page=1):
    """GET /users/{account_id} - members of a lab. Note: the ID is a lab ID, not a user ID. Scope: read_users."""
    url = f"{config.API_BASE_URL}/users/{account_id}"
    params = {"page": page, "per_page": config.PER_PAGE}
    return requests.get(url, headers=auth.build_headers(), params=params,
                        timeout=config.REQUEST_TIMEOUT_SECONDS)


def list_equipment_users(equipment_id, page=1):
    """GET /equipment/{id}/users - users who have access to a piece of equipment. Scope: read_users."""
    url = f"{config.API_BASE_URL}/equipment/{equipment_id}/users"
    params = {"page": page, "per_page": config.PER_PAGE}
    return requests.get(url, headers=auth.build_headers(), params=params,
                        timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# EQUIPMENT - reading
# ===========================================================================

def list_equipment(account_id, page=1):
    """GET /equipment?account={id} - equipment in a lab. Scope: read_equipment."""
    url = f"{config.API_BASE_URL}/equipment"
    params = {"account": account_id, "page": page, "per_page": config.PER_PAGE}
    return requests.get(url, headers=auth.build_headers(), params=params,
                        timeout=config.REQUEST_TIMEOUT_SECONDS)


def get_equipment(equipment_id):
    """GET /equipment/{id} - full details of one piece of equipment. Scope: read_equipment."""
    url = f"{config.API_BASE_URL}/equipment/{equipment_id}"
    return requests.get(url, headers=auth.build_headers(), timeout=config.REQUEST_TIMEOUT_SECONDS)


def list_equipment_bookings(equipment_id, page=1):
    """GET /equipment/{id}/bookings - bookings on one piece of equipment. Scope: read_equipment."""
    url = f"{config.API_BASE_URL}/equipment/{equipment_id}/bookings"
    params = {"page": page, "per_page": config.PER_PAGE}
    return requests.get(url, headers=auth.build_headers(), params=params,
                        timeout=config.REQUEST_TIMEOUT_SECONDS)


def list_equipment_contact_people(account_id, equipment_id=None):
    """
    GET /equipment/contact_people?account_id={id} - people who can be set as
    equipment contacts (lab admins and instructors). Scope: write_equipment.

    Use the returned IDs in "contact_access_role_ids" when creating/updating equipment.
    """
    url = f"{config.API_BASE_URL}/equipment/contact_people"
    params = {"account_id": account_id}
    if equipment_id is not None:
        params["equipment_id"] = equipment_id  # optional: check rights on a specific item
    return requests.get(url, headers=auth.build_headers(), params=params,
                        timeout=config.REQUEST_TIMEOUT_SECONDS)


def list_booking_add_ons(equipment_id):
    """GET /equipment/{id}/booking_add_ons - add-ons (e.g. consumables) that can be added to a booking."""
    url = f"{config.API_BASE_URL}/equipment/{equipment_id}/booking_add_ons"
    return requests.get(url, headers=auth.build_headers(), timeout=config.REQUEST_TIMEOUT_SECONDS)


def get_available_slots(equipment_id, start_time, end_time):
    """
    GET /equipment_available_slots/{equipment_id} - free time on a piece of
    equipment between start_time and end_time. Scope: write_bookings.

    Times are ISO 8601 strings, e.g. "2026-12-01T09:00:00Z".
    The response looks like:
        {"available_slots": [{"start_time": "...", "end_time": "..."}, ...]}
    """
    url = f"{config.API_BASE_URL}/equipment_available_slots/{equipment_id}"
    params = {"start_time": start_time, "end_time": end_time}
    return requests.get(url, headers=auth.build_headers(), params=params,
                        timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# FILE UPLOADS (used to attach photos/documents to equipment and notes)
# ===========================================================================
# Uploading a file is a two-step process:
#   Step A - register_upload():   tell Calira about the file. It replies with a
#                                 "signed_id" and a "direct_upload" URL.
#   Step B - upload_file_bytes(): send the file contents to that URL.
# You can then put the signed_id in an equipment or booking note request.

def register_upload(file_path, content_type, purpose):
    """
    POST /uploads - register a file before uploading it. Scope: write_equipment or write_bookings.

    purpose must be one of:
      "photo"        - equipment photo (PNG, JPEG or SVG, max 10 MB)
      "document"     - equipment document (max 25 MB)
      "booking_note" - attachment for a booking note
    """
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    # Calira needs a checksum so it can confirm the file arrived intact.
    # It must be the MD5 hash of the file, encoded as base64 text.
    checksum = base64.b64encode(hashlib.md5(file_bytes).digest()).decode("ascii")

    url = f"{config.API_BASE_URL}/uploads"
    body = {
        "filename": os.path.basename(file_path),
        "content_type": content_type,
        "byte_size": len(file_bytes),
        "checksum": checksum,
        "purpose": purpose,
    }
    # json=body converts the Python dictionary to JSON for us.
    return requests.post(url, headers=auth.build_headers(), json=body,
                         timeout=config.REQUEST_TIMEOUT_SECONDS)


def upload_file_bytes(file_path, direct_upload):
    """
    Step B: send the file contents to the "direct_upload" details returned by
    register_upload(). This goes straight to file storage, so it uses the
    headers Calira gave us, NOT our Bearer token.
    """
    with open(file_path, "rb") as f:
        file_bytes = f.read()
    return requests.put(direct_upload["url"], headers=direct_upload["headers"],
                        data=file_bytes, timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# EQUIPMENT - creating and updating
# ===========================================================================

def create_equipment(account_id, name, category, subcategory, manufacturer,
                     model_number, availability_status, photo_signed_ids=None):
    """
    POST /equipment - create a new piece of equipment. Scope: write_equipment.

    Many more optional fields are supported (room, description, pricing,
    booking_rules ...). See https://apidocs.clustermarket.com/ for the full list.
    The new item is returned under "equipment" in the response.
    """
    url = f"{config.API_BASE_URL}/equipment"
    body = {
        "account_id": account_id,
        "name": name,
        "category": category,
        "subcategory": subcategory,
        "manufacturer": manufacturer,
        "model_number": model_number,
        "availability_status": availability_status,
    }
    if photo_signed_ids:
        body["photos"] = photo_signed_ids  # list of signed_ids from register_upload()
    return requests.post(url, headers=auth.build_headers(), json=body,
                         timeout=config.REQUEST_TIMEOUT_SECONDS)


def update_equipment(equipment_id, name):
    """
    PATCH /equipment/{id} - update a piece of equipment. Scope: write_equipment.

    Only send the fields you want to change. Here we just rename it.
    """
    url = f"{config.API_BASE_URL}/equipment/{equipment_id}"
    body = {"name": name}
    return requests.patch(url, headers=auth.build_headers(), json=body,
                          timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# BOOKINGS
# ===========================================================================

def list_bookings(provider_account_id=None, page=1):
    """GET /bookings - bookings the user can see, optionally only for one lab. Scope: read_bookings."""
    url = f"{config.API_BASE_URL}/bookings"
    params = {"page": page, "per_page": config.PER_PAGE}
    if provider_account_id is not None:
        params["provider_account"] = provider_account_id
    return requests.get(url, headers=auth.build_headers(), params=params,
                        timeout=config.REQUEST_TIMEOUT_SECONDS)


def get_booking(booking_id):
    """GET /bookings/{id} - full details of one booking. Scope: read_bookings."""
    url = f"{config.API_BASE_URL}/bookings/{booking_id}"
    return requests.get(url, headers=auth.build_headers(), timeout=config.REQUEST_TIMEOUT_SECONDS)


def create_booking(equipment_id, start_time, end_time):
    """
    POST /bookings - book a piece of equipment. Scope: write_bookings.

    Only equipment_id, start_time and end_time are required. Optional fields
    include:
      "booking_type": "maintenance" (with "maintenance_provider" and "maintenance_type")
      "projects":     [{"project_id": 123, "funding_codes": [...]}]
      "add_ons":      [{"equipment_addon": "Consumables", "quantity": "2"}]
      "invited_users", "booking_on_behalf_of", "recurrence"
    The new booking is returned under "booking" in the response.
    """
    url = f"{config.API_BASE_URL}/bookings"
    body = {
        "equipment_id": equipment_id,
        "start_time": start_time,
        "end_time": end_time,
    }
    return requests.post(url, headers=auth.build_headers(), json=body,
                         timeout=config.REQUEST_TIMEOUT_SECONDS)


def update_booking(booking_id, start_time, end_time):
    """
    PATCH /bookings/{id} - change a booking. Scope: write_bookings.

    Only send the fields you want to change. Here we change the times.
    """
    url = f"{config.API_BASE_URL}/bookings/{booking_id}"
    body = {"start_time": start_time, "end_time": end_time}
    return requests.patch(url, headers=auth.build_headers(), json=body,
                          timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# BOOKING NOTES
# ===========================================================================

def create_booking_note(booking_id, note_text, file_signed_id=None):
    """
    POST /booking/notes/{booking_id} - add a note to a booking. Scope: write_bookings.

    The note fields must be wrapped inside a "booking_note" object.
    The new note's ID is returned at response["booking_note"]["note_id"].
    """
    url = f"{config.API_BASE_URL}/booking/notes/{booking_id}"
    body = {"booking_note": {"note_text": note_text}}
    if file_signed_id:
        body["booking_note"]["note_file_signed_id"] = file_signed_id  # from register_upload()
    return requests.post(url, headers=auth.build_headers(), json=body,
                         timeout=config.REQUEST_TIMEOUT_SECONDS)


def update_booking_note(note_id, note_text):
    """PATCH /booking/notes/{note_id} - change the text of a note. Note: the ID is a note ID. Scope: write_bookings."""
    url = f"{config.API_BASE_URL}/booking/notes/{note_id}"
    body = {"booking_note": {"note_text": note_text}}
    return requests.patch(url, headers=auth.build_headers(), json=body,
                          timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# CUSTOM FORM RESPONSES
# ===========================================================================

def get_custom_form_response(response_id):
    """
    GET /custom_form_responses/{id} - answers a user gave on a booking form.
    Response IDs are listed in each booking's "custom_form_responses" field.
    """
    url = f"{config.API_BASE_URL}/custom_form_responses/{response_id}"
    return requests.get(url, headers=auth.build_headers(), timeout=config.REQUEST_TIMEOUT_SECONDS)


# ===========================================================================
# PAGINATION EXAMPLE - fetching every page of a list
# ===========================================================================

def get_all_pages(list_function, *args):
    """
    Call a list function repeatedly until every record has been fetched.

    Example:
        all_equipment = get_all_pages(list_equipment, config.ACCOUNT_ID)

    Calira returns paging details in the response headers:
      X-Total-Records - how many records exist in total
      X-Current-Page  - the page just returned
      X-Per-Page      - how many records are on each page
    We keep asking for the next page until we have them all.

    Returns (all_records, last_response).
    """
    all_records = []
    page = 1
    while True:
        response = list_function(*args, page=page)
        if not response.ok:
            return all_records, response  # stop on the first error

        all_records.extend(response.json())

        total_records = int(response.headers.get("X-Total-Records", 0))
        per_page = int(response.headers.get("X-Per-Page", config.PER_PAGE))
        if page * per_page >= total_records:
            return all_records, response  # that was the last page
        page += 1
