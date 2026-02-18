from datetime import datetime, timezone

from src.extensions import db


class Store(db.Model):
    __tablename__ = "stores"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(255), nullable=False)
    address    = db.Column(db.String(500), nullable=False)
    phone      = db.Column(db.String(50),  nullable=True)
    email      = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True),
                           default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True),
                           default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "address":    self.address,
            "phone":      self.phone,
            "email":      self.email,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
