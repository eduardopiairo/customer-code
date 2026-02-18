from flask import Blueprint, jsonify, request

from src.extensions import db
from src.models.store import Store

stores_bp = Blueprint("stores", __name__, url_prefix="/api/v1/stores")


@stores_bp.route("", methods=["GET"])
def list_stores():
    stores = Store.query.order_by(Store.id).all()
    return jsonify([s.to_dict() for s in stores]), 200


@stores_bp.route("", methods=["POST"])
def create_store():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    name    = (data.get("name") or "").strip()
    address = (data.get("address") or "").strip()
    if not name or not address:
        return jsonify({"error": "Fields 'name' and 'address' are required"}), 422

    store = Store(
        name    = name,
        address = address,
        phone   = (data.get("phone") or "").strip() or None,
        email   = (data.get("email") or "").strip() or None,
    )
    db.session.add(store)
    db.session.commit()
    return jsonify(store.to_dict()), 201


@stores_bp.route("/<int:store_id>", methods=["GET"])
def get_store(store_id):
    store = db.get_or_404(Store, store_id)
    return jsonify(store.to_dict()), 200


@stores_bp.route("/<int:store_id>", methods=["PUT"])
def update_store(store_id):
    store = db.get_or_404(Store, store_id)
    data  = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    if "name" in data:
        name = data["name"].strip()
        if not name:
            return jsonify({"error": "'name' cannot be empty"}), 422
        store.name = name

    if "address" in data:
        address = data["address"].strip()
        if not address:
            return jsonify({"error": "'address' cannot be empty"}), 422
        store.address = address

    if "phone" in data:
        store.phone = data["phone"].strip() or None

    if "email" in data:
        store.email = data["email"].strip() or None

    db.session.commit()
    return jsonify(store.to_dict()), 200


@stores_bp.route("/<int:store_id>", methods=["DELETE"])
def delete_store(store_id):
    store = db.get_or_404(Store, store_id)
    db.session.delete(store)
    db.session.commit()
    return "", 204
