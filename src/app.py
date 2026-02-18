import socket
from datetime import datetime, timezone

from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/api/v1/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/api/v1/details", methods=["GET"])
def details():
    return jsonify({
        "name": "stakeholder-management-backend",
        "version": "1.0.0",
        "description": "Stakeholder Management API",
        "time": datetime.now(timezone.utc).isoformat(),
        "hostname": socket.gethostname()
    })


if __name__ == "__main__":
    app.run(debug=True)
