"""Tests for card transaction disputes."""
import copy
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient

from app.repositories.data_manager import data_manager


def _user_id(username: str) -> int:
    return next(u['id'] for u in data_manager.users if u['username'] == username)


def _login(client: TestClient, username: str) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"username": username, "password": "DemoUser2026Banking"},
    )
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.fixture
def make_transaction():
    """Return a factory that reshapes one of john_doe's transactions, restoring it afterwards."""
    john_accounts = {a['id'] for a in data_manager.accounts if a['user_id'] == _user_id('john_doe')}
    candidates = [t for t in data_manager.transactions if t['account_id'] in john_accounts]
    originals: list[tuple[dict, dict]] = []

    def factory(**overrides):
        tx = candidates[len(originals)]
        originals.append((tx, copy.deepcopy(tx)))
        tx.update({
            'status': 'completed',
            'transaction_type': 'debit',
            'transaction_date': datetime.now(UTC) - timedelta(days=3),
            'is_disputed': False,
            'dispute_id': None,
            **overrides,
        })
        return tx['id']

    yield factory

    touched = {tx['id'] for tx, _ in originals}
    data_manager.transaction_disputes[:] = [
        d for d in data_manager.transaction_disputes if d['transaction_id'] not in touched
    ]
    for tx, original in originals:
        tx.clear()
        tx.update(original)


def _open(client, headers, tx_id, reason="unrecognised", details=None):
    return client.post(
        f"/api/transactions/{tx_id}/dispute",
        json={"reason": reason, "details": details},
        headers=headers,
    )


class TestDisputeLifecycle:
    def test_open_get_cancel(self, client, auth_headers, make_transaction):
        tx_id = make_transaction()

        response = _open(client, auth_headers, tx_id, "duplicate", "Charged twice")
        assert response.status_code == 201
        dispute = response.json()
        assert dispute['transaction_id'] == tx_id
        assert dispute['user_id'] == _user_id('john_doe')
        assert dispute['reason'] == 'duplicate'
        assert dispute['details'] == 'Charged twice'
        assert dispute['status'] == 'open'
        assert dispute['created_at']

        tx = client.get(f"/api/transactions/{tx_id}", headers=auth_headers).json()
        assert tx['is_disputed'] is True
        assert tx['dispute_id'] == dispute['id']

        response = client.get(f"/api/transactions/{tx_id}/dispute", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()['id'] == dispute['id']

        response = client.delete(f"/api/transactions/{tx_id}/dispute", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()['status'] == 'cancelled'

        tx = client.get(f"/api/transactions/{tx_id}", headers=auth_headers).json()
        assert tx['is_disputed'] is False
        assert tx['dispute_id'] is None
        response = client.get(f"/api/transactions/{tx_id}/dispute", headers=auth_headers)
        assert response.status_code == 404

    def test_open_and_cancel_create_notifications(self, client, auth_headers, make_transaction):
        tx_id = make_transaction()
        _open(client, auth_headers, tx_id)
        client.delete(f"/api/transactions/{tx_id}/dispute", headers=auth_headers)

        notifications = client.get("/api/notifications?limit=100", headers=auth_headers).json()
        titles = [
            n['title'] for n in notifications
            if n.get('related_entity_type') == 'transaction' and n.get('related_entity_id') == tx_id
        ]
        assert 'Dispute opened' in titles
        assert 'Dispute cancelled' in titles

    def test_disputed_filter(self, client, auth_headers, make_transaction):
        disputed_id = make_transaction()
        other_id = make_transaction()
        _open(client, auth_headers, disputed_id)

        response = client.get("/api/transactions?disputed=true&limit=500", headers=auth_headers)
        assert response.status_code == 200
        ids = [t['id'] for t in response.json()]
        assert disputed_id in ids
        assert other_id not in ids
        assert all(t['is_disputed'] for t in response.json())

        response = client.get("/api/transactions?disputed=false&limit=500", headers=auth_headers)
        assert disputed_id not in [t['id'] for t in response.json()]

    def test_cancel_without_open_dispute_is_404(self, client, auth_headers, make_transaction):
        tx_id = make_transaction()
        response = client.delete(f"/api/transactions/{tx_id}/dispute", headers=auth_headers)
        assert response.status_code == 404


class TestDisputeEligibility:
    @pytest.mark.parametrize(("overrides", "message"), [
        ({'status': 'pending'}, "Pending"),
        ({'status': 'failed'}, "Failed"),
        ({'status': 'cancelled'}, "completed"),
        ({'transaction_date': datetime.now(UTC) - timedelta(days=121)}, "120 days"),
        ({'transaction_type': 'credit'}, "card payments"),
    ])
    def test_ineligible_transactions_are_rejected(
        self, client, auth_headers, make_transaction, overrides, message
    ):
        tx_id = make_transaction(**overrides)
        response = _open(client, auth_headers, tx_id)
        assert response.status_code == 400
        assert message in response.json()['detail']

    def test_transaction_just_inside_window_is_eligible(self, client, auth_headers, make_transaction):
        tx_id = make_transaction(transaction_date=datetime.now(UTC) - timedelta(days=119))
        assert _open(client, auth_headers, tx_id).status_code == 201

    def test_double_dispute_is_rejected(self, client, auth_headers, make_transaction):
        tx_id = make_transaction()
        assert _open(client, auth_headers, tx_id).status_code == 201

        response = _open(client, auth_headers, tx_id, "duplicate")
        assert response.status_code == 409
        open_disputes = [
            d for d in data_manager.transaction_disputes
            if d['transaction_id'] == tx_id and d['status'] == 'open'
        ]
        assert len(open_disputes) == 1

    def test_can_dispute_again_after_cancelling(self, client, auth_headers, make_transaction):
        tx_id = make_transaction()
        _open(client, auth_headers, tx_id)
        client.delete(f"/api/transactions/{tx_id}/dispute", headers=auth_headers)
        assert _open(client, auth_headers, tx_id).status_code == 201

    def test_invalid_reason_is_rejected(self, client, auth_headers, make_transaction):
        tx_id = make_transaction()
        assert _open(client, auth_headers, tx_id, "changed_my_mind").status_code == 422


class TestDisputeOwnership:
    def test_other_user_cannot_open_view_or_cancel(self, client, auth_headers, make_transaction):
        tx_id = make_transaction()
        assert _open(client, auth_headers, tx_id).status_code == 201

        jane = _login(client, 'jane_smith')
        assert _open(client, jane, tx_id).status_code == 400
        assert client.get(f"/api/transactions/{tx_id}/dispute", headers=jane).status_code == 400
        assert client.delete(f"/api/transactions/{tx_id}/dispute", headers=jane).status_code == 400

        response = client.get(f"/api/transactions/{tx_id}/dispute", headers=auth_headers)
        assert response.json()['status'] == 'open'

    def test_unknown_transaction_is_404(self, client, auth_headers):
        assert _open(client, auth_headers, 999_999_999).status_code == 404

    def test_requires_auth(self, client, make_transaction):
        tx_id = make_transaction()
        assert client.post(
            f"/api/transactions/{tx_id}/dispute", json={"reason": "unrecognised"}
        ).status_code in (401, 403)
