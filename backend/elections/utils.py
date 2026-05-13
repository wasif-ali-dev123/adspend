import re


def parse_week_dates(spend_week: str):
    """Parse a raw spend-week string into (week_start, week_end) ISO date strings.

    Expected format: ``YYYY_MM/DD-MM/DD``  e.g. ``2024_10/01-10/06``

    Returns ``(None, None)`` when the string does not match the expected pattern.
    """
    match = re.match(r"(\d{4})_(\d{2})/(\d{2})-(\d{2})/(\d{2})", spend_week)
    if not match:
        return None, None
    year, start_month, start_day, end_month, end_day = match.groups()
    return (
        f"{year}-{start_month}-{start_day}",
        f"{year}-{end_month}-{end_day}",
    )
