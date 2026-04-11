from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()

    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields (username, email, password)'}), 400

    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409

    # Create new user
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': access_token, 'user': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    data = request.get_json()

    if not data or not data.get('password'):
        return jsonify({'error': 'Missing credentials'}), 400

    identifier = data.get('username') or data.get('email')
    if not identifier:
        return jsonify({'error': 'Missing username or email'}), 400

    # Accept login by either username or email
    user = User.query.filter_by(username=identifier).first() or \
           User.query.filter_by(email=identifier).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """Return the current user's profile."""
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update username and/or bio for the current user."""
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}

    new_username = data.get('username', '').strip()
    new_bio = data.get('bio', None)

    if new_username and new_username != user.username:
        if len(new_username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
        if User.query.filter_by(username=new_username).first():
            return jsonify({'error': 'Username already taken'}), 409
        user.username = new_username

    if new_bio is not None:
        user.bio = new_bio.strip()[:300] or None

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()}), 200
