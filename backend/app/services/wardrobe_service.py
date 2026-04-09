import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
from app.extensions import db
from app.models.wardrobe_item import WardrobeItem

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'}

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_image(file, upload_folder):
    """
    Save an uploaded image file and return the path.

    Args:
        file: Flask request file object
        upload_folder: Path to upload directory

    Returns:
        Relative path to saved image

    Raises:
        ValueError: If file is not a valid image
    """
    if not file or file.filename == '':
        raise ValueError('No file provided')

    if not allowed_file(file.filename):
        raise ValueError('File type not allowed. Allowed types: png, jpg, jpeg, gif')

    # Reset stream to start before saving
    try:
        file.stream.seek(0)
    except Exception:
        pass

    # Generate unique filename
    filename = secure_filename(file.filename)
    name, ext = os.path.splitext(filename)
    unique_filename = f"{name}_{uuid.uuid4().hex}{ext}"

    # Save file
    filepath = os.path.join(upload_folder, unique_filename)
    os.makedirs(upload_folder, exist_ok=True)
    file.save(filepath)

    # Return relative path
    return unique_filename

def create_item_from_photo(user_id, form_data, image_path):
    """
    Create a WardrobeItem from uploaded photo.

    Args:
        user_id: ID of the user
        form_data: Dict with name, category, color (optional), brand (optional)
        image_path: Path to saved image

    Returns:
        Created WardrobeItem object
    """
    item = WardrobeItem(
        user_id=user_id,
        name=form_data.get('name'),
        category=form_data.get('category'),
        color=form_data.get('color'),
        brand=form_data.get('brand'),
        image_path=image_path
    )

    db.session.add(item)
    db.session.commit()

    return item

def create_item_from_link(user_id, data):
    """
    Create a WardrobeItem from URL/SKU.

    Args:
        user_id: ID of the user
        data: Dict with name, category, color (optional), source_url (optional), sku (optional)

    Returns:
        Created WardrobeItem object
    """
    item = WardrobeItem(
        user_id=user_id,
        name=data.get('name'),
        category=data.get('category'),
        color=data.get('color'),
        brand=data.get('brand'),
        source_url=data.get('source_url'),
        sku=data.get('sku')
    )

    db.session.add(item)
    db.session.commit()

    return item
