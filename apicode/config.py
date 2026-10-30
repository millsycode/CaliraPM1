"""
config.py
=========

All the settings used by the Calira API examples live in this one file.

Change the values below to match your own Calira account before running
anything. Every other file in this folder reads its settings from here, so
you should not need to edit URLs or IDs anywhere else.
"""

import os

# The folder this file is in. Files below (tokens, samples, report) are kept
# here, so the scripts work no matter which folder you run them from.
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# 1. ENVIRONMENT URLS
# ---------------------------------------------------------------------------
# Calira has several environments. Exactly ONE block below should be
# uncommented. Comment out the block you are not using by putting a "#" at the
# start of each line.
#
#   API_BASE_URL     - the root of the REST API (all endpoint paths are added to this)
#   OAUTH_AUTHORIZE_URL - the web page where a user logs in and approves your app
#   OAUTH_TOKEN_URL  - where your code swaps a code / refresh token for an access token

# --- Production -------------------------------------------------------------
# API_BASE_URL = "https://api.clustermarket.com/v1"
# OAUTH_AUTHORIZE_URL = "https://app.clustermarket.com/oauth/authorize"
# OAUTH_TOKEN_URL = "https://app.clustermarket.com/oauth/token"

# --- Staging ----------------------------------------------------------------
# API_BASE_URL = "https://api.clustermarket.dev/v1"
# OAUTH_AUTHORIZE_URL = "https://app.clustermarket.dev/oauth/authorize"
# OAUTH_TOKEN_URL = "https://app.clustermarket.dev/oauth/token"

# --- Review app (pre-release testing) ---------------------------------------

API_BASE_URL = "https://5975.api.review.clustermarket.dev/v1"
OAUTH_AUTHORIZE_URL = "https://5975.review.clustermarket.dev/oauth/authorize"
OAUTH_TOKEN_URL = "https://5975.review.clustermarket.dev/oauth/token"


# ---------------------------------------------------------------------------
# 2. OAUTH APPLICATION DETAILS
# ---------------------------------------------------------------------------
# These are issued by Calira when your API application is registered.
# Keep the client secret private - do not commit it to a public repository.
CLIENT_ID = "UwOlOgVrCnf1A7PIiDsqdnJ_DWQ1cYLdqCp76LSwF80"
CLIENT_SECRET = "wN45qHLZXH08Q-94mLs6YC9exfazXeeQmtG_zOy9k5I"

# The redirect URI registered for your application. After the user approves
# access, the browser is sent to this address with "?code=..." added to the end.
REDIRECT_URI = "http://localhost:3000/callback"

# The permissions (scopes) your application asks for, separated by spaces.
# Only request the scopes you actually need.
#   read_accounts   - read labs / departments / organisations
#   read_bookings   - read bookings
#   read_equipment  - read equipment
#   read_projects   - read projects and funding codes
#   read_user       - read the logged-in user's own details
#   read_users      - read the users of a lab / users with access to equipment
#   write_bookings  - create and update bookings and booking notes
#   write_equipment - create and update equipment
OAUTH_SCOPES = (
    "read_accounts read_bookings read_equipment read_projects "
    "read_user read_users write_bookings write_equipment"
)

# File where the access token and refresh token are saved between runs.
# Treat this file like a password - anyone holding it can call the API as you.
TOKEN_FILE = os.path.join(THIS_FOLDER, "tokens.json")


# ---------------------------------------------------------------------------
# 3. IDS USED BY THE EXAMPLES
# ---------------------------------------------------------------------------
# Replace the zeros with real IDs from your own Calira account.
# Tip: run list_accounts() and list_equipment() from endpoints.py to find them.

# The lab (account) the examples work with.
ACCOUNT_ID = 543

# A piece of equipment in that lab that the logged-in user is allowed to book.
# Used for the equipment GET examples and for creating a booking.
EQUIPMENT_ID = 18369

# An existing piece of equipment whose category and subcategory are copied
# when the "create equipment" example makes a new item.
TEMPLATE_EQUIPMENT_ID = 18369


# ---------------------------------------------------------------------------
# 4. VALUES USED WHEN CREATING / UPDATING RECORDS
# ---------------------------------------------------------------------------

# --- Equipment --------------------------------------------------------------
NEW_EQUIPMENT_NAME = "API Example Microscope"
NEW_EQUIPMENT_CATEGORY = "Microscopy & Imaging"
NEW_EQUIPMENT_MANUFACTURER = "Nikon"
NEW_EQUIPMENT_MODEL_NUMBER = "A1 HD25"
NEW_EQUIPMENT_AVAILABILITY = "Always Available"   # or "Unavailable"
UPDATED_EQUIPMENT_NAME = "API Example Microscope (updated)"

# --- Bookings ---------------------------------------------------------------
# Booking times are worked out when the script runs, so the examples never go
# out of date. The script looks for free time starting this many days from
# today, searching a window of this many days.
BOOKING_SEARCH_START_DAYS_FROM_TODAY = 1
BOOKING_SEARCH_WINDOW_DAYS = 7

# The hour of the day (UTC, 24-hour clock) the search window starts at.
BOOKING_SEARCH_START_HOUR_UTC = 9

# How long the example booking lasts, and how long it is after the update.
BOOKING_LENGTH_MINUTES = 60
UPDATED_BOOKING_LENGTH_MINUTES = 30

# --- Booking notes ----------------------------------------------------------
NOTE_TEXT = "Note added by the Calira API example script."
UPDATED_NOTE_TEXT = "Note updated by the Calira API example script."

# --- File uploads -----------------------------------------------------------
# Small sample files shipped alongside this code.
# The photo is attached to the new equipment; the PDF is attached to the note.
SAMPLE_PHOTO_FILE = os.path.join(THIS_FOLDER, "sample_photo.png")
SAMPLE_PHOTO_CONTENT_TYPE = "image/png"
SAMPLE_NOTE_FILE = os.path.join(THIS_FOLDER, "sample_note.pdf")
SAMPLE_NOTE_CONTENT_TYPE = "application/pdf"


# ---------------------------------------------------------------------------
# 5. GENERAL SETTINGS
# ---------------------------------------------------------------------------
# Number of records requested per page from list endpoints (maximum 100).
PER_PAGE = 100

# How long to wait (in seconds) for the server before giving up on a request.
REQUEST_TIMEOUT_SECONDS = 30

# Name of the HTML report written by run_all_examples.py.
REPORT_FILE = os.path.join(THIS_FOLDER, "api_results.html")
