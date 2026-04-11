import json
from datetime import datetime
from app.extensions import db


class SharedOutfit(db.Model):
    __tablename__ = 'shared_outfits'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    caption = db.Column(db.String(280), nullable=True)
    outfit_data = db.Column(db.Text, nullable=False, default='[]')
    is_hidden = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    ratings = db.relationship('OutfitRating', backref='shared_outfit', lazy=True, cascade='all, delete-orphan')
    comments = db.relationship('OutfitComment', backref='shared_outfit', lazy=True, cascade='all, delete-orphan')

    @property
    def outfit_items(self):
        if not self.outfit_data:
            return []
        try:
            return json.loads(self.outfit_data) if isinstance(self.outfit_data, str) else self.outfit_data
        except (json.JSONDecodeError, TypeError):
            return []

    @outfit_items.setter
    def outfit_items(self, value):
        self.outfit_data = json.dumps(value if value is not None else [])

    def avg_rating(self):
        active = [r for r in self.ratings]
        if not active:
            return 0
        return round(sum(r.rating for r in active) / len(active), 1)

    def rating_count(self):
        return len(self.ratings)

    def comment_count(self):
        return sum(1 for c in self.comments if not c.is_deleted)

    def to_dict(self, current_user_id=None):
        from app.models.user import User
        user = User.query.get(self.user_id)
        d = {
            'id': self.id,
            'user_id': self.user_id,
            'username': user.username if user else 'Unknown',
            'caption': self.caption,
            'items': self.outfit_items,
            'is_hidden': self.is_hidden,
            'avg_rating': self.avg_rating(),
            'rating_count': self.rating_count(),
            'comment_count': self.comment_count(),
            'created_at': self.created_at.isoformat(),
        }
        if current_user_id:
            my_rating = next((r.rating for r in self.ratings if r.user_id == current_user_id), None)
            d['my_rating'] = my_rating
        return d


class OutfitRating(db.Model):
    __tablename__ = 'outfit_ratings'
    __table_args__ = (
        db.UniqueConstraint('user_id', 'shared_outfit_id', name='uq_user_outfit_rating'),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    shared_outfit_id = db.Column(db.Integer, db.ForeignKey('shared_outfits.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'shared_outfit_id': self.shared_outfit_id,
            'rating': self.rating,
            'created_at': self.created_at.isoformat(),
        }


class OutfitComment(db.Model):
    __tablename__ = 'outfit_comments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    shared_outfit_id = db.Column(db.Integer, db.ForeignKey('shared_outfits.id', ondelete='CASCADE'), nullable=False)
    text = db.Column(db.String(500), nullable=False)
    is_flagged = db.Column(db.Boolean, nullable=False, default=False)
    is_deleted = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        from app.models.user import User
        user = User.query.get(self.user_id)
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': user.username if user else 'Unknown',
            'shared_outfit_id': self.shared_outfit_id,
            'text': '[deleted]' if self.is_deleted else self.text,
            'is_flagged': self.is_flagged,
            'is_deleted': self.is_deleted,
            'created_at': self.created_at.isoformat(),
        }
