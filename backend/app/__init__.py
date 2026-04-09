import os
from flask import Flask
from app.config import Config
from app.extensions import db, jwt, cors

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)

    # Create upload folder if it doesn't exist
    upload_folder = app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.wardrobe import wardrobe_bp
    from app.routes.outfits import outfits_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(wardrobe_bp, url_prefix='/wardrobe')
    app.register_blueprint(outfits_bp, url_prefix='/outfits')

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
