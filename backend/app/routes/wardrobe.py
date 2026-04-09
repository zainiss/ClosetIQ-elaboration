from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.wardrobe_item import WardrobeItem
from app.services.wardrobe_service import save_image, create_item_from_photo, create_item_from_link

wardrobe_bp = Blueprint('wardrobe', __name__)

@wardrobe_bp.route('/items', methods=['GET'])
@jwt_required()
def get_items():
    """Get all wardrobe items for current user"""
    user_id = int(get_jwt_identity())
    items = WardrobeItem.query.filter_by(user_id=user_id).all()
    return jsonify([item.to_dict() for item in items]), 200

@wardrobe_bp.route('/items/<int:item_id>', methods=['GET'])
@jwt_required()
def get_item(item_id):
    """Get a single wardrobe item"""
    user_id = int(get_jwt_identity())
    item = WardrobeItem.query.filter_by(id=item_id, user_id=user_id).first()

    if not item:
        return jsonify({'error': 'Item not found'}), 404

    return jsonify(item.to_dict()), 200

@wardrobe_bp.route('/items/photo', methods=['POST'])
@jwt_required()
def upload_photo():
    """Upload a clothing item via photo"""
    user_id = int(get_jwt_identity())

    # Check if file is present
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Get form data
    name = request.form.get('name')
    category = request.form.get('category')

    if not name or not category:
        return jsonify({'error': 'Missing required fields (name, category)'}), 400

    try:
        # Save image
        image_path = save_image(file, current_app.config['UPLOAD_FOLDER'])

        # Create item from photo
        item = create_item_from_photo(user_id, {
            'name': name,
            'category': category,
            'color': request.form.get('color'),
            'brand': request.form.get('brand')
        }, image_path)

        return jsonify({
            'message': 'Item created successfully',
            'item': item.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@wardrobe_bp.route('/items/link', methods=['POST'])
@jwt_required()
def add_by_link():
    """Add a clothing item via product link or SKU"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('name') or not data.get('category'):
        return jsonify({'error': 'Missing required fields (name, category)'}), 400

    if not data.get('source_url') and not data.get('sku'):
        return jsonify({'error': 'Must provide either source_url or sku'}), 400

    try:
        item = create_item_from_link(user_id, data)
        return jsonify({
            'message': 'Item created successfully',
            'item': item.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@wardrobe_bp.route('/items/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_item(item_id):
    """Update a wardrobe item"""
    user_id = int(get_jwt_identity())
    item = WardrobeItem.query.filter_by(id=item_id, user_id=user_id).first()

    if not item:
        return jsonify({'error': 'Item not found'}), 404

    data = request.get_json()

    # Update allowed fields
    if 'name' in data:
        item.name = data['name']
    if 'category' in data:
        item.category = data['category']
    if 'color' in data:
        item.color = data['color']
    if 'brand' in data:
        item.brand = data['brand']
    if 'dress_code' in data:
        item.dress_code = data['dress_code']
    if 'occasion_tags' in data:
        item.occasion_tags_list = data['occasion_tags']
    if 'weather_tags' in data:
        item.weather_tags_list = data['weather_tags']

    db.session.commit()
    return jsonify({'message': 'Item updated', 'item': item.to_dict()}), 200

@wardrobe_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    """Delete a wardrobe item"""
    user_id = int(get_jwt_identity())
    item = WardrobeItem.query.filter_by(id=item_id, user_id=user_id).first()

    if not item:
        return jsonify({'error': 'Item not found'}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': 'Item deleted'}), 200

@wardrobe_bp.route('/items/<int:item_id>/tags', methods=['POST'])
@jwt_required()
def set_tags(item_id):
    """Set tags on a wardrobe item"""
    user_id = int(get_jwt_identity())
    item = WardrobeItem.query.filter_by(id=item_id, user_id=user_id).first()

    if not item:
        return jsonify({'error': 'Item not found'}), 404

    data = request.get_json()

    if 'tags' not in data or not isinstance(data['tags'], list):
        return jsonify({'error': 'tags must be a list'}), 400

    item.tags_list = data['tags']
    db.session.commit()

    return jsonify({'message': 'Tags updated', 'item': item.to_dict()}), 200

@wardrobe_bp.route('/uploads/<filename>', methods=['GET'])
def serve_upload(filename):
    """Serve uploaded image files"""
    try:
        return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename), 200
    except Exception:
        return jsonify({'error': 'File not found'}), 404
