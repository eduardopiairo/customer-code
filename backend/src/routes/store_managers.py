from flask import Blueprint, jsonify, request

from src.extensions import db
from src.models.store_manager import StoreManager

store_managers_bp = Blueprint(
    "store_managers", __name__, url_prefix="/api/v1/store-managers"
)


@store_managers_bp.route("", methods=["GET"])
def list_store_managers():
    managers = StoreManager.query.order_by(StoreManager.id).all()
    return jsonify([m.to_dict() for m in managers]), 200


@store_managers_bp.route("", methods=["POST"])
def create_store_manager():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    name  = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    if not name or not email:
        return jsonify(
            {"error": "Fields 'name' and 'email' are required"}
        ), 422

    manager = StoreManager(
        name  = name,
        email = email,
        phone = (data.get("phone") or "").strip() or None,
    )
    db.session.add(manager)
    db.session.commit()
    return jsonify(manager.to_dict()), 201


@store_managers_bp.route("/<int:manager_id>", methods=["GET"])
def get_store_manager(manager_id):
    manager = db.get_or_404(StoreManager, manager_id)
    return jsonify(manager.to_dict()), 200


@store_managers_bp.route("/<int:manager_id>", methods=["PUT"])
def update_store_manager(manager_id):
    manager = db.get_or_404(StoreManager, manager_id)
    data    = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    if "name" in data:
        name = data["name"].strip()
        if not name:
            return jsonify({"error": "'name' cannot be empty"}), 422
        manager.name = name

    if "email" in data:
        email = data["email"].strip()
        if not email:
            return jsonify({"error": "'email' cannot be empty"}), 422
        manager.email = email

    if "phone" in data:
        manager.phone = data["phone"].strip() or None

    db.session.commit()
    return jsonify(manager.to_dict()), 200


@store_managers_bp.route("/<int:manager_id>", methods=["DELETE"])
def delete_store_manager(manager_id):
    manager = db.get_or_404(StoreManager, manager_id)
    db.session.delete(manager)
    db.session.commit()
    return "", 204
