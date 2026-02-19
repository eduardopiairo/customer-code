import os
import socket
from datetime import UTC, datetime

from flask import Flask, jsonify

from src.extensions import db
from src.routes import stores_bp


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()

    app.register_blueprint(stores_bp)

    @app.route("/api/v1/health", methods=["GET"])
    def health():
        return jsonify({"status": "healthy"}), 200

    @app.route("/api/v1/details", methods=["GET"])
    def details():
        return jsonify({
            "name":        "customer-code-api",
            "version":     "1.0.0",
            "description": "Customer Code API",
            "time":        datetime.now(UTC).isoformat(),
            "hostname":    socket.gethostname(),
        })

    return app


app = create_app()

if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug)
