from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.activity_log import ActivityLog

admin_bp = Blueprint('admin', __name__)


def _require_admin():
    """Returns the current user if they are an admin, otherwise None."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return None
    return user


def log_action(user_id, action, resource=None, resource_id=None, details=None):
    """Helper to record an activity log entry."""
    ip = request.remote_addr
    entry = ActivityLog(
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        ip_address=ip,
        details=details
    )
    db.session.add(entry)
    db.session.commit()


# ── User Account Management (PM-15) ──────────────────────────────────────────

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    """List all registered users (admin only)"""
    admin = _require_admin()
    if not admin:
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get a specific user's details (admin only)"""
    admin = _require_admin()
    if not admin:
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@admin_bp.route('/users/<int:user_id>/deactivate', methods=['POST'])
@jwt_required()
def deactivate_user(user_id):
    """Deactivate a user account (admin only)"""
    admin = _require_admin()
    if not admin:
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(user_id)
    if user.id == admin.id:
        return jsonify({'error': 'Cannot deactivate your own account'}), 400

    user.is_active = False
    db.session.commit()
    log_action(admin.id, 'deactivate_user', resource='user', resource_id=user_id)
    return jsonify({'message': f'User {user.username} deactivated'}), 200


@admin_bp.route('/users/<int:user_id>/activate', methods=['POST'])
@jwt_required()
def activate_user(user_id):
    """Reactivate a user account (admin only)"""
    admin = _require_admin()
    if not admin:
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(user_id)
    user.is_active = True
    db.session.commit()
    log_action(admin.id, 'activate_user', resource='user', resource_id=user_id)
    return jsonify({'message': f'User {user.username} activated'}), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    """Delete a user account and all their data (admin only)"""
    admin = _require_admin()
    if not admin:
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get_or_404(user_id)
    if user.id == admin.id:
        return jsonify({'error': 'Cannot delete your own account'}), 400

    username = user.username
    db.session.delete(user)
    db.session.commit()
    log_action(admin.id, 'delete_user', details=f'Deleted user: {username}')
    return jsonify({'message': f'User {username} deleted'}), 200


# ── System Activity Monitoring (PM-16) ───────────────────────────────────────

@admin_bp.route('/activity', methods=['GET'])
@jwt_required()
def get_activity():
    """View system activity log (admin only)"""
    admin = _require_admin()
    if not admin:
        return jsonify({'error': 'Admin access required'}), 403

    limit = min(int(request.args.get('limit', 50)), 200)
    offset = int(request.args.get('offset', 0))
    user_filter = request.args.get('user_id')

    query = ActivityLog.query.order_by(ActivityLog.created_at.desc())
    if user_filter:
        query = query.filter_by(user_id=int(user_filter))

    logs = query.offset(offset).limit(limit).all()
    total = ActivityLog.query.count()

    return jsonify({
        'total': total,
        'offset': offset,
        'limit': limit,
        'logs': [log.to_dict() for log in logs]
    }), 200


@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get system-wide statistics (admin only)"""
    admin = _require_admin()
    if not admin:
        return jsonify({'error': 'Admin access required'}), 403

    from app.models.wardrobe_item import WardrobeItem
    from app.models.outfit import Outfit

    return jsonify({
        'total_users': User.query.count(),
        'active_users': User.query.filter_by(is_active=True).count(),
        'total_wardrobe_items': WardrobeItem.query.count(),
        'total_saved_outfits': Outfit.query.count(),
        'total_activity_events': ActivityLog.query.count()
    }), 200
