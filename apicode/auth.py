"""
auth.py
=======

Shared functions for getting an access token from Calira.

Calira uses OAuth 2.0 (the "authorization code" flow). There are two stages:

1. FIRST-TIME CONNECTION (done once, by a person)
   - Open the authorisation URL in a web browser.
   - Log in to Calira and approve your application.
   - The browser is redirected to your REDIRECT_URI with "?code=XXXX" on the end.
   - Copy that code and swap it for an access token + refresh token.

2. EVERY RUN AFTER THAT (fully automatic)
   - The access token only lasts a limited time.
   - When it expires, the refresh token is used to get a new one without
     needing a person to log in again.

Tokens are saved to the file named in config.TOKEN_FILE so they survive
between runs.
"""

import json
import os
import time
from urllib.parse import urlencode

import requests

import config


# ---------------------------------------------------------------------------
# Saving and loading tokens
# ---------------------------------------------------------------------------

def save_tokens(token_response):
    """
    Save the token details returned by Calira to the token file.

    Calira returns "expires_in" (seconds until the token expires). We convert
    that into an exact time ("expires_at") so later runs can tell whether the
    token is still valid.
    """
    tokens = {
        "access_token": token_response["access_token"],
        "refresh_token": token_response.get("refresh_token"),
        # time.time() is "now" in seconds. Adding expires_in gives the expiry time.
        "expires_at": time.time() + token_response.get("expires_in", 0),
    }
    with open(config.TOKEN_FILE, "w") as token_file:
        json.dump(tokens, token_file, indent=2)
    return tokens


def load_tokens():
    """Read the saved tokens from the token file, or return None if there is no file yet."""
    if not os.path.exists(config.TOKEN_FILE):
        return None
    with open(config.TOKEN_FILE) as token_file:
        return json.load(token_file)


# ---------------------------------------------------------------------------
# Stage 1: first-time connection
# ---------------------------------------------------------------------------

def get_authorization_url():
    """
    Build the web address a person opens to log in and approve your application.
    """
    query = urlencode({
        "client_id": config.CLIENT_ID,
        "redirect_uri": config.REDIRECT_URI,
        "response_type": "code",      # we want an authorisation code back
        "scope": config.OAUTH_SCOPES,  # the permissions we are asking for
    })
    return f"{config.OAUTH_AUTHORIZE_URL}?{query}"


def exchange_code_for_tokens(authorization_code):
    """
    Swap the one-time authorisation code for an access token and refresh token.
    The code can only be used once and expires after a few minutes.
    """
    response = requests.post(
        config.OAUTH_TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": authorization_code,
            "redirect_uri": config.REDIRECT_URI,  # must match the one used above
            "client_id": config.CLIENT_ID,
            "client_secret": config.CLIENT_SECRET,
        },
        timeout=config.REQUEST_TIMEOUT_SECONDS,
    )
    # raise_for_status() stops the program with an error if the request failed.
    response.raise_for_status()
    return save_tokens(response.json())


def connect_first_time():
    """
    Walk a person through the first-time connection in the terminal.

    Run this once (e.g. "python auth.py"). After it succeeds, the tokens are
    saved and the other scripts can run without anyone logging in.
    """
    print("1. Open this address in your web browser and approve access:\n")
    print(get_authorization_url())
    print("\n2. After approving, your browser goes to a page whose address")
    print("   contains '?code=...'. Copy the text after 'code=' (stop at any '&').\n")
    authorization_code = input("3. Paste the code here and press Enter: ").strip()

    exchange_code_for_tokens(authorization_code)
    print(f"\nConnected. Tokens saved to {config.TOKEN_FILE}")


# ---------------------------------------------------------------------------
# Stage 2: refreshing the token
# ---------------------------------------------------------------------------

def refresh_access_token(refresh_token):
    """
    Use the refresh token to get a new access token (and a new refresh token).
    No person needs to be involved.
    """
    response = requests.post(
        config.OAUTH_TOKEN_URL,
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": config.CLIENT_ID,
            "client_secret": config.CLIENT_SECRET,
        },
        timeout=config.REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return save_tokens(response.json())


def get_access_token():
    """
    Return a valid access token, refreshing it first if it has expired.

    This is the function the endpoint examples call before every request.
    """
    tokens = load_tokens()
    if tokens is None:
        raise RuntimeError(
            "No saved tokens found. Run 'python auth.py' first to connect to Calira."
        )

    # Refresh a minute early so the token cannot expire part-way through a request.
    if time.time() > tokens["expires_at"] - 60:
        tokens = refresh_access_token(tokens["refresh_token"])

    return tokens["access_token"]


def build_headers():
    """
    Build the HTTP headers sent with every API request.

    The "Authorization: Bearer <token>" header proves who is making the request.
    """
    return {
        "Authorization": f"Bearer {get_access_token()}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


# Running this file directly ("python auth.py") starts the first-time connection.
if __name__ == "__main__":
    connect_first_time()
