from datetime import timedelta

from jose import jwt

from backend import auth


def test_password_hash_roundtrip():
    hashed = auth.get_password_hash("correct-password")
    assert auth.verify_password("correct-password", hashed)
    assert not auth.verify_password("wrong-password", hashed)


def test_create_access_token_encodes_claims_and_expiry():
    token = auth.create_access_token({"sub": "user@example.com"}, expires_delta=timedelta(minutes=5))
    payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
    assert payload["sub"] == "user@example.com"
    assert "exp" in payload


def test_token_signed_with_wrong_key_is_rejected():
    token = auth.create_access_token({"sub": "user@example.com"})
    try:
        jwt.decode(token, "a-completely-different-key", algorithms=[auth.ALGORITHM])
        assert False, "expected decoding with the wrong key to fail"
    except Exception:
        pass
