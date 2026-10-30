# Calira REST API – Python examples

Simple, heavily commented Python examples for every customer-facing endpoint of
the Calira (formerly Clustermarket) REST API.
Full API reference: https://apidocs.clustermarket.com/

## Files

| File | What it does |
|---|---|
| `config.py` | **All settings** – URLs, OAuth app details, IDs and example values. The only file you need to edit. |
| `auth.py` | First-time connection, saving tokens, and refreshing the access token. |
| `endpoints.py` | One function per API endpoint, plus `get_all_pages()` for pagination. |
| `run_all_examples.py` | Calls every endpoint in order and writes `api_results.html`. |
| `sample_photo.png`, `sample_note.pdf` | Small files used by the upload examples. |

## Setup

1. Install Python 3.9 or newer, then install the one library used:
   ```
   pip install requests
   ```
2. Open `config.py` and:
   - uncomment the environment you want (production, staging or review),
   - enter your `CLIENT_ID` and `CLIENT_SECRET`,
   - replace the zero IDs (`ACCOUNT_ID`, `EQUIPMENT_ID`, `TEMPLATE_EQUIPMENT_ID`) with real ones.
3. Connect to Calira (only needed once):
   ```
   python auth.py
   ```
   Open the printed link, approve access, then copy the `code=` value from the
   address bar of the page you land on and paste it into the terminal.
   Tokens are saved to `tokens.json` and refreshed automatically after that.
   **Keep `tokens.json` private.**

## Run every example

```
python run_all_examples.py
```

Open `api_results.html` to see a green **PASS**, red **FAIL** or grey
**SKIPPED** for each call, with the HTTP status code and the start of the
response. A step is skipped when it depends on an earlier step that failed.

The run creates real records: a piece of equipment, a booking (in the first
free slot found from tomorrow onwards) and a booking note with a PDF attached.

## Use a single endpoint

```python
import config
import endpoints

response = endpoints.get_equipment(config.EQUIPMENT_ID)
print(response.status_code)
print(response.json())
```

Fetch every page of a list:

```python
records, last_response = endpoints.get_all_pages(endpoints.list_equipment, config.ACCOUNT_ID)
print(len(records), "equipment items")
```

## Scopes needed

`read_accounts read_bookings read_equipment read_projects read_user read_users write_bookings write_equipment`
