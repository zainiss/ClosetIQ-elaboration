from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.outfit import Outfit
from app.models.wardrobe_item import WardrobeItem
from app.services.outfit_service import (
    recommend_by_occasion,
    recommend_by_weather,
    recommend_by_dress_code,
    recommend_by_color,
    recommend_with_item,
    recommend_multiple,
    recommend_with_shoes,
    build_outfit_from_items
)

outfits_bp = Blueprint('outfits', __name__)


@outfits_bp.route('/by-occasion', methods=['POST'])
@jwt_required()
def get_outfit_by_occasion():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('occasion'):
        return jsonify({'error': 'Missing occasion field'}), 400

    items = recommend_by_occasion(user_id, data['occasion'])
    outfit = build_outfit_from_items(items)

    return jsonify({
        'occasion': data['occasion'],
        'items': [item.to_dict() for item in items],
        'outfit': outfit
    }), 200


@outfits_bp.route('/by-weather', methods=['POST'])
@jwt_required()
def get_outfit_by_weather():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or ('temperature' not in data and 'condition' not in data):
        return jsonify({'error': 'Missing temperature or condition field'}), 400

    items = recommend_by_weather(
        user_id,
        temperature=data.get('temperature'),
        condition=data.get('condition')
    )
    outfit = build_outfit_from_items(items)

    return jsonify({
        'temperature': data.get('temperature'),
        'condition': data.get('condition'),
        'items': [item.to_dict() for item in items],
        'outfit': outfit
    }), 200


@outfits_bp.route('/by-dress-code', methods=['POST'])
@jwt_required()
def get_outfit_by_dress_code():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('dress_code'):
        return jsonify({'error': 'Missing dress_code field'}), 400

    items = recommend_by_dress_code(user_id, data['dress_code'])
    outfit = build_outfit_from_items(items)

    return jsonify({
        'dress_code': data['dress_code'],
        'items': [item.to_dict() for item in items],
        'outfit': outfit
    }), 200


@outfits_bp.route('/multiple', methods=['POST'])
@jwt_required()
def get_multiple_outfits():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    count = min(int(data.get('count', 3)), 10)
    occasion = data.get('occasion')
    options = recommend_multiple(user_id, occasion=occasion, count=count)

    return jsonify({
        'occasion': occasion,
        'count': len(options),
        'options': [
            {
                'items': [item.to_dict() for item in opt['items']],
                'outfit': opt['outfit']
            }
            for opt in options
        ]
    }), 200


@outfits_bp.route('/with-shoes', methods=['POST'])
@jwt_required()
def get_outfit_with_shoes():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    result = recommend_with_shoes(user_id, occasion=data.get('occasion'))

    return jsonify({
        'occasion': data.get('occasion'),
        'shoe_included': result['shoe_included'],
        'items': [item.to_dict() for item in result['items']],
        'outfit': result['outfit']
    }), 200


@outfits_bp.route('/by-color', methods=['POST'])
@jwt_required()
def get_outfit_by_color():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('color'):
        return jsonify({'error': 'Missing color field'}), 400

    items = recommend_by_color(user_id, data['color'])
    outfit = build_outfit_from_items(items)

    return jsonify({
        'color': data['color'],
        'items': [item.to_dict() for item in items],
        'outfit': outfit
    }), 200


@outfits_bp.route('/with-item', methods=['POST'])
@jwt_required()
def get_outfit_with_item():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('item_id'):
        return jsonify({'error': 'Missing item_id field'}), 400

    must_use, complements = recommend_with_item(user_id, data['item_id'])

    if must_use is None:
        return jsonify({'error': 'Item not found'}), 404

    all_items = [must_use] + complements
    outfit = build_outfit_from_items(all_items)

    return jsonify({
        'must_use_item': must_use.to_dict(),
        'complementary_items': [i.to_dict() for i in complements],
        'outfit': outfit
    }), 200


@outfits_bp.route('', methods=['GET'])
@jwt_required()
def list_outfits():
    user_id = int(get_jwt_identity())
    outfits = Outfit.query.filter_by(user_id=user_id).all()
    return jsonify([outfit.to_dict() for outfit in outfits]), 200


@outfits_bp.route('', methods=['POST'])
@jwt_required()
def save_outfit():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('items') or not isinstance(data['items'], list):
        return jsonify({'error': 'Missing or invalid items field (must be a list)'}), 400

    for item_id in data['items']:
        item = WardrobeItem.query.filter_by(id=item_id, user_id=user_id).first()
        if not item:
            return jsonify({'error': f'Item {item_id} not found or does not belong to user'}), 404

    outfit = Outfit(
        user_id=user_id,
        name=data.get('name'),
        occasion=data.get('occasion'),
        dress_code=data.get('dress_code')
    )
    outfit.items_list = data['items']

    db.session.add(outfit)
    db.session.commit()

    return jsonify({
        'message': 'Outfit saved successfully',
        'outfit': outfit.to_dict()
    }), 201
