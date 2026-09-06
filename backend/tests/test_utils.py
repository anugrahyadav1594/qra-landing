"""Pure-logic unit tests (§18.2): ids, email rules, client hints."""

from app.utils import (
    is_disposable_email, normalize_email, sha256_hex, user_agent_summary, uuid7,
)


def test_uuid7_is_time_ordered_and_versioned():
    ids = [uuid7() for _ in range(50)]
    for value in ids:
        # canonical hyphenated UUIDv7 form, version nibble = 7
        assert len(value) == 36
        assert value[14] == "7"
    # the 48-bit millisecond timestamp prefix must be non-decreasing
    timestamps = [int(value.replace("-", "")[:12], 16) for value in ids]
    assert timestamps == sorted(timestamps)


def test_uuid7_unguessable():
    seen = {uuid7() for _ in range(500)}
    assert len(seen) == 500


def test_normalize_email():
    assert normalize_email("  Person@Example.COM ") == "person@example.com"
    assert normalize_email("not-an-email") is None
    assert normalize_email("") is None
    assert normalize_email(None) is None


def test_plus_tags_kept_deliberately():
    # §9.4: plus tags are kept on purpose (users use them deliberately).
    assert normalize_email("user+tag@example.com") == "user+tag@example.com"


def test_disposable_domains():
    assert is_disposable_email("x@mailinator.com")
    assert is_disposable_email("x@10minutemail.com")
    assert not is_disposable_email("x@gmail.com")
    assert is_disposable_email("x@custom-throwaway.example", extra=["custom-throwaway.example"])


def test_ua_summary_never_raw():
    assert user_agent_summary("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                              "(KHTML, like Gecko) Chrome/126.0 Safari/537.36") == "Chrome"
    assert user_agent_summary("curl/8.5.0") == "curl"
    assert user_agent_summary(None) == "other"


def test_sha256_stable():
    assert sha256_hex("abc") == sha256_hex("abc")
    assert len(sha256_hex("x")) == 64
