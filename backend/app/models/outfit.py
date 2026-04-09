from datetime import datetime
from app.extensions import db
import json

class Outfit(db.Model):
    __tablename__ = 'outfits'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    name = db.Column(db.String(120), nullable=True)
    occasion = db.Column(db.String(50), nullable=True)  # casual, formal, etc.
    dress_code = db.Column(db.String(50), nullable=True)

    # Items stored as JSON array of wardrobe item IDs
    items = db.Column(db.Text, nullable=True, default='[]')

    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def _get_items_list(self):
        """Safely deserialize items JSON"""
        if self.items is None:
            return []
        try:
            return json.loads(self.items) if isinstance(self.items, str) else self.items
        except json.JSONDecodeError:
            return []

    def _set_items_list(self, value):
        """Safely serialize items JSON"""
        if isinstance(value, list):
            self.items = json.dumps(value)
        else:
            self.items = json.dumps([])

    @property
    def items_list(self):
        return self._get_items_list()

    @items_list.setter
    def items_list(self, value):
        self._set_items_list(value)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'occasion': self.occasion,
            'dress_code': self.dress_code,
            'items': self.items_list,
            'created_at': self.created_at.isoformat()
        }
