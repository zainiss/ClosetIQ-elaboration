from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from app.extensions import db
from app.models.social import SharedOutfit, OutfitRating, OutfitComment
from app.models.user import User

social_bp = Blueprint('social', __name__)


# ── Feed ────────────────────────────────────────────────────────────────────

@social_bp.route('/feed', methods=['GET'])
@jwt_required()
def get_feed():
    """Paginated feed of public, non-hidden shared outfits.

    Query params:
      sort   – 'top' (by avg rating) | 'trending' (recent, default)
      limit  – max items (default 20, max 50)
      offset – pagination offset (default 0)
    """
    user_id = int(get_jwt_identity())
    sort = request.args.get('sort', 'trending')
    limit = min(int(request.args.get('limit', 20)), 50)
    offset = int(request.args.get('offset', 0))

    query = SharedOutfit.query.filter_by(is_hidden=False)

    if sort == 'top':
        # Pull all, sort in Python by avg_rating (SQLite has no clean window fn)
        outfits = query.order_by(SharedOutfit.created_at.desc()).all()
        outfits.sort(key=lambda o: o.avg_rating(), reverse=True)
        total = len(outfits)
        outfits = outfits[offset: offset + limit]
    else:
        total = query.count()
        outfits = query.order_by(SharedOutfit.created_at.desc()).offset(offset).limit(limit).all()

    return jsonify({
        'total': total,
        'offset': offset,
        'limit': limit,
        'sort': sort,
        'outfits': [o.to_dict(current_user_id=user_id) for o in outfits],
    }), 200


# ── Share / delete own outfits ───────────────────────────────────────────────

@social_bp.route('/share', methods=['POST'])
@jwt_required()
def share_outfit():
    """Share an outfit to the social feed."""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    items = data.get('items')
    if not items or not isinstance(items, list) or len(items) == 0:
        return jsonify({'error': 'items must be a non-empty list'}), 400

    caption = (data.get('caption') or '').strip()[:280]

    shared = SharedOutfit(user_id=user_id, caption=caption or None)
    shared.outfit_items = items
    db.session.add(shared)
    db.session.commit()

    return jsonify({
        'message': 'Outfit shared',
        'outfit': shared.to_dict(current_user_id=user_id),
    }), 201


@social_bp.route('/outfits/<int:outfit_id>', methods=['DELETE'])
@jwt_required()
def delete_share(outfit_id):
    """Delete your own shared outfit."""
    user_id = int(get_jwt_identity())
    shared = SharedOutfit.query.get_or_404(outfit_id)

    user = User.query.get(user_id)
    if shared.user_id != user_id and not (user and user.is_admin):
        return jsonify({'error': 'Not authorized'}), 403

    db.session.delete(shared)
    db.session.commit()
    return jsonify({'message': 'Shared outfit removed'}), 200


@social_bp.route('/my-shares', methods=['GET'])
@jwt_required()
def my_shares():
    """Return all outfits the current user has shared."""
    user_id = int(get_jwt_identity())
    outfits = SharedOutfit.query.filter_by(user_id=user_id).order_by(SharedOutfit.created_at.desc()).all()
    return jsonify([o.to_dict(current_user_id=user_id) for o in outfits]), 200


# ── Ratings ──────────────────────────────────────────────────────────────────

@social_bp.route('/outfits/<int:outfit_id>/rate', methods=['POST'])
@jwt_required()
def rate_outfit(outfit_id):
    """Rate a shared outfit (1–5). Re-submitting updates the rating."""
    user_id = int(get_jwt_identity())
    shared = SharedOutfit.query.get_or_404(outfit_id)

    if shared.is_hidden:
        return jsonify({'error': 'Outfit not available'}), 404

    data = request.get_json() or {}
    rating_val = data.get('rating')
    if rating_val is None or not isinstance(rating_val, int) or not (1 <= rating_val <= 5):
        return jsonify({'error': 'rating must be an integer between 1 and 5'}), 400

    existing = OutfitRating.query.filter_by(user_id=user_id, shared_outfit_id=outfit_id).first()
    if existing:
        existing.rating = rating_val
    else:
        db.session.add(OutfitRating(user_id=user_id, shared_outfit_id=outfit_id, rating=rating_val))

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Could not save rating'}), 409

    db.session.refresh(shared)
    return jsonify({
        'message': 'Rating saved',
        'avg_rating': shared.avg_rating(),
        'rating_count': shared.rating_count(),
        'my_rating': rating_val,
    }), 200


# ── Comments ─────────────────────────────────────────────────────────────────

@social_bp.route('/outfits/<int:outfit_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(outfit_id):
    """Get all non-deleted comments for a shared outfit."""
    SharedOutfit.query.get_or_404(outfit_id)
    comments = (
        OutfitComment.query
        .filter_by(shared_outfit_id=outfit_id, is_deleted=False)
        .order_by(OutfitComment.created_at.asc())
        .all()
    )
    return jsonify([c.to_dict() for c in comments]), 200


@social_bp.route('/outfits/<int:outfit_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(outfit_id):
    """Add a comment to a shared outfit."""
    user_id = int(get_jwt_identity())
    shared = SharedOutfit.query.get_or_404(outfit_id)

    if shared.is_hidden:
        return jsonify({'error': 'Outfit not available'}), 404

    data = request.get_json() or {}
    text = (data.get('text') or '').strip()
    if not text:
        return jsonify({'error': 'Comment text is required'}), 400
    if len(text) > 500:
        return jsonify({'error': 'Comment cannot exceed 500 characters'}), 400

    comment = OutfitComment(user_id=user_id, shared_outfit_id=outfit_id, text=text)
    db.session.add(comment)
    db.session.commit()

    return jsonify({'message': 'Comment added', 'comment': comment.to_dict()}), 201


@social_bp.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Soft-delete a comment (owner or admin)."""
    user_id = int(get_jwt_identity())
    comment = OutfitComment.query.get_or_404(comment_id)

    user = User.query.get(user_id)
    if comment.user_id != user_id and not (user and user.is_admin):
        return jsonify({'error': 'Not authorized'}), 403

    comment.is_deleted = True
    db.session.commit()
    return jsonify({'message': 'Comment deleted'}), 200


@social_bp.route('/comments/<int:comment_id>/flag', methods=['POST'])
@jwt_required()
def flag_comment(comment_id):
    """Flag a comment for admin review."""
    comment = OutfitComment.query.get_or_404(comment_id)
    if comment.is_deleted:
        return jsonify({'error': 'Comment already deleted'}), 404

    comment.is_flagged = True
    db.session.commit()
    return jsonify({'message': 'Comment flagged for review'}), 200
