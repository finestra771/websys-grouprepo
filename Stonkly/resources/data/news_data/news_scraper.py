import os
import time
import mediacloud.api as mc_api
import pandas as pd
import ast
import requests
from datetime import datetime, timedelta

# ----------------------------------------
# CONFIG
# ----------------------------------------

API_KEY = "INSERT_API_KEY"  # <- Put your Media Cloud API key here
mc = mc_api.SearchApi(API_KEY)

# Define the query with synonyms
QUERY = (
    'tariff OR tariffs OR duty OR duties OR "import tax" OR "import taxes" '
    'OR "trade levy" OR "trade levies" OR "trade duty" OR "trade duties" '
    'OR "customs duty" OR "customs duties"'
)

START_DATE = datetime(2023, 1, 3)
END_DATE   = datetime(2025, 8, 29)

OUTPUT_CSV = "mediacloud_tariff_daily_counts.csv"

# ----------------------------------------
# Fetch daily counts
# ----------------------------------------

# If an output CSV already exists, load it and use its dates as a cache
results = []
existing_df = None
existing_dates = set()
if os.path.exists(OUTPUT_CSV):
    try:
        existing_df = pd.read_csv(OUTPUT_CSV)
        if 'date' in existing_df.columns:
            # Only treat a date as cached if its stored value looks valid
            # (non-zero numeric or a dict-like payload with 'relevant'/'count'/'total').
            existing_dates = set()
            if 'tariff_story_count' in existing_df.columns:
                for _, r in existing_df.iterrows():
                    d = str(r['date'])
                    val = r['tariff_story_count']
                    valid = False
                    # NaN check
                    if pd.isna(val):
                        valid = False
                    else:
                        # numeric and non-zero
                        try:
                            if isinstance(val, (int, float)) and val != 0:
                                valid = True
                            else:
                                s = str(val)
                                # try to parse a stringified dict
                                try:
                                    obj = ast.literal_eval(s)
                                    if isinstance(obj, dict) and any(k in obj for k in ('relevant', 'count', 'total')):
                                        valid = True
                                except Exception:
                                    # fallback heuristic: look for keys
                                    if any(k in s for k in ('relevant', 'count', 'total', '{')):
                                        valid = True
                        except Exception:
                            valid = False
                    if valid:
                        existing_dates.add(d)
            else:
                # no count column; mark all dates as cached
                existing_dates = set(existing_df['date'].astype(str).tolist())
        else:
            existing_df = None
    except Exception as e:
        print(f"Warning: could not read existing cache '{OUTPUT_CSV}': {e}")

# Retry / rate-limit settings
max_retries = 5
base_backoff = 1.0
sleep_between_requests = 0.25  # seconds between requests to avoid burst limits

appended_count = 0

def _append_row_to_csv(path, row):
    df_row = pd.DataFrame([row])
    write_header = not os.path.exists(path)
    df_row.to_csv(path, mode='a', header=write_header, index=False)


def get_story_count(client, query, start_date, end_date, api_key):
    """Try several ways to get a story count:
    1) call client.storyCount or client.story_count if available
    2) fall back to raw HTTP requests against likely Media Cloud endpoints
    Returns either an int count, or raises an exception on unrecoverable error.
    """
    # Prepare both string and datetime forms for the dates
    start_dt = None
    end_dt = None
    if isinstance(start_date, str):
        try:
            start_dt = datetime.fromisoformat(start_date)
        except Exception:
            start_dt = None
    else:
        start_dt = start_date

    if isinstance(end_date, str):
        try:
            end_dt = datetime.fromisoformat(end_date)
        except Exception:
            end_dt = None
    else:
        end_dt = end_date

    # Try client method variants first. Some client implementations expect
    # datetime objects and will call .isoformat() on them; others accept strings.
    for name in ("storyCount", "story_count", "storyCountForDate", "storyCountOnDate"):
        fn = getattr(client, name, None)
        if callable(fn):
            # First try with datetime objects if we were able to parse them
            if start_dt is not None and end_dt is not None:
                try:
                    return fn(query, start_date=start_dt, end_date=end_dt)
                except Exception:
                    # fall through and try passing strings
                    pass
            try:
                return fn(query, start_date=start_date, end_date=end_date)
            except TypeError:
                # some wrappers may expect positional args
                return fn(query, start_date, end_date)

    # Fallback: try several HTTP endpoints/auth formats
    endpoints = [
        "https://api.mediacloud.org/api/rest/v1/stories/count",
        "https://api.mediacloud.org/api/rest/v2/stories/count",
        "https://api.mediacloud.org/api/rest/v1/stories/counts",
    ]
    auth_variants = [
        ("params", {"key": api_key}),
        ("params", {"api_key": api_key}),
        ("params", {"apikey": api_key}),
        ("headers", {"Authorization": f"Bearer {api_key}"}),
    ]

    params_base = {"query": query, "start_date": start_date, "end_date": end_date}
    for endpoint in endpoints:
        for mode, auth in auth_variants:
            params = dict(params_base)
            headers = {}
            if mode == "params":
                params.update(auth)
            else:
                headers.update(auth)
            try:
                r = requests.get(endpoint, params=params, headers=headers, timeout=30)
            except Exception as e:
                # network error, try next combo
                continue

            if r.status_code == 200:
                try:
                    payload = r.json()
                    # payload might be {'count': N} or direct integer
                    if isinstance(payload, dict) and 'count' in payload:
                        return payload['count']
                    if isinstance(payload, int):
                        return payload
                    # try common keys
                    for k in ('results', 'count', 'story_count'):
                        if isinstance(payload, dict) and k in payload:
                            return payload[k]
                    # fallback: if payload is list and length is 1 with dict
                    if isinstance(payload, list) and len(payload) == 1 and isinstance(payload[0], dict):
                        for k in ('count', 'value'):
                            if k in payload[0]:
                                return payload[0][k]
                except Exception:
                    continue
            elif r.status_code == 429:
                # raise to allow retry/backoff higher-level logic to inspect
                err = Exception(f"429: rate limited from {endpoint}")
                setattr(err, 'response', r)
                raise err

    # if we reach here we couldn't get a count
    raise RuntimeError("Could not determine story count: client lacks method and HTTP fallbacks failed")

current = START_DATE
while current <= END_DATE:
    next_day = current + timedelta(days=1)
    # Media Cloud uses ISO format dates
    start_str = current.strftime("%Y-%m-%d")
    end_str = next_day.strftime("%Y-%m-%d")

    # Skip if we already have this date in the CSV cache
    if start_str in existing_dates:
        print(f"Skipping {start_str} (cached)")
        current = next_day
        continue

    attempt = 0
    count = None
    while attempt < max_retries:
        try:
            # use helper that tries client methods then HTTP fallbacks
            count = get_story_count(mc, QUERY, start_str, end_str, API_KEY)
            break
        except Exception as e:
            # try to detect rate limit / Retry-After
            resp = getattr(e, 'response', None)
            status = None
            retry_after = None
            if resp is not None:
                status = getattr(resp, 'status_code', None) or getattr(resp, 'status', None)
                headers = getattr(resp, 'headers', None) or {}
                retry_after = headers.get('Retry-After') if isinstance(headers, dict) else None

            attempt += 1
            if status == 429 or (isinstance(status, str) and '429' in status) or '429' in str(e):
                wait = float(retry_after) if retry_after and str(retry_after).isdigit() else (base_backoff * (2 ** attempt))
                print(f"Rate limited on {start_str}: retrying in {wait}s (attempt {attempt}/{max_retries})")
                time.sleep(wait)
            else:
                wait = 0.5 * (2 ** attempt)
                print(f"Error fetching {start_str}: {e}. Retrying in {wait:.1f}s (attempt {attempt}/{max_retries})")
                time.sleep(wait)

    if count is None:
        print(f"Failed to fetch {start_str} after {max_retries} attempts — recording 0.")
        count = 0

    print(f"{start_str}: {count}")
    row = {"date": start_str, "tariff_story_count": count}
    results.append(row)

    # append the successful (or final-failed) result immediately to the CSV
    try:
        _append_row_to_csv(OUTPUT_CSV, row)
        appended_count += 1
        # add to cache so we don't re-fetch in this run
        existing_dates.add(start_str)
    except Exception as e:
        print(f"Warning: failed to append {start_str} to {OUTPUT_CSV}: {e}")

    time.sleep(sleep_between_requests)
    current = next_day

# ----------------------------------------
# Summary
# ----------------------------------------

if appended_count == 0:
    print("No new dates to fetch — cache is up to date.")
else:
    print(f"Appended {appended_count} new rows to {OUTPUT_CSV}")
