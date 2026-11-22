from datetime import UTC, datetime


def utc_now() -> datetime:
    return datetime.now(UTC)


def start_of_today() -> datetime:
    local_midnight = (
        datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
    )
    return local_midnight.astimezone(UTC)
