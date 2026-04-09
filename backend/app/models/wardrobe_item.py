from datetime import datetime
from app.extensions import db
import json

class WardrobeItem(db.Model):
    __tablename__ = 'wardrobe_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Basic attributes
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # shirt, pants, shoes, dress, jacket, etc.
    color = db.Column(db.String(50), nullable=True)
    brand = db.Column(db.String(100), nullable=True)

    # Image and source information
    image_path = db.Column(db.String(255), nullable=True)
    source_url = db.Column(db.String(500), nullable=True)
    sku = db.Column(db.String(100), nullable=True)

    # Tags and metadata (stored as JSON text)
    tags = db.Column(db.Text, nullable=True, default='[]')  # JSON array of strings
    occasion_tags = db.Column(db.Text, nullable=True, default='[]')  # JSON array: casual, formal, etc.
    dress_code = db.Column(db.String(50), nullable=True)  # formal, semi-formal, business casual, casual, smart casual
    weather_tags = db.Column(db.Text, nullable=True, default='[]')  # JSON array: hot, warm, cool, cold, rainy

    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def _get_json_field(self, field_name):
        """Helper to safely deserialize JSON fields"""
        value = getattr(self, field_name)
        if value is None:
            return []
        try:
            return json.loads(value) if isinstance(value, str) else value
        except json.JSONDecodeError:
            return []

    def _set_json_field(self, field_name, value):
        """Helper to safely serialize JSON fields"""
        if isinstance(value, (list, dict)):
            setattr(self, field_name, json.dumps(value))
        else:
            setattr(self, field_name, json.dumps([]) if value is None else value)

    @property
    def tags_list(self):
        return self._get_json_field('tags')

    @tags_list.setter
    def tags_list(self, value):
        self._set_json_field('tags', value)

    @property
    def occasion_tags_list(self):
        return self._get_json_field('occasion_tags')

    @occasion_tags_list.setter
    def occasion_tags_list(self, value):
        self._set_json_field('occasion_tags', value)

    @property
    def weather_tags_list(self):
        return self._get_json_field('weather_tags')

    @weather_tags_list.setter
    def weather_tags_list(self, value):
        self._set_json_field('weather_tags', value)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'category': self.category,
            'color': self.color,
            'brand': self.brand,
            'image_path': self.image_path,
            'source_url': self.source_url,
            'sku': self.sku,
            'tags': self.tags_list,
            'occasion_tags': self.occasion_tags_list,
            'dress_code': self.dress_code,
            'weather_tags': self.weather_tags_list,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
