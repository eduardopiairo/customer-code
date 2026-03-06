from datetime import UTC, datetime

from src.extensions import db


class StoreManager(db.Model):
    __tablename__ = "store_managers"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(255), nullable=False)
    email      = db.Column(db.String(255), nullable=False, unique=True)
    phone      = db.Column(db.String(50),  nullable=True)
    created_at = db.Column(db.DateTime(timezone=True),
                           default=lambda: datetime.now(UTC))
    updated_at = db.Column(db.DateTime(timezone=True),
                           default=lambda: datetime.now(UTC),
                           onupdate=lambda: datetime.now(UTC))

    stores = db.relationship("Store", back_populates="manager")

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "phone":      self.phone,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
