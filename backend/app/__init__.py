import os
from flask import Flask, request
from app.config import Config
from app.extensions import db, jwt, cors

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}}, supports_credentials=False)

    # Create upload folder if it doesn't exist
    upload_folder = app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.wardrobe import wardrobe_bp
    from app.routes.outfits import outfits_bp
    from app.routes.admin import admin_bp
    from app.routes.social import social_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(wardrobe_bp, url_prefix='/wardrobe')
    app.register_blueprint(outfits_bp, url_prefix='/outfits')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(social_bp, url_prefix='/social')

    # Activity logging middleware — log mutating requests after they complete
    @app.after_request
    def log_mutating_requests(response):
        if request.method in ('POST', 'PUT', 'PATCH', 'DELETE') and response.status_code < 400:
            try:
                from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
                from app.models.activity_log import ActivityLog
                verify_jwt_in_request(optional=True)
                user_id = get_jwt_identity()
                if user_id:
                    entry = ActivityLog(
                        user_id=user_id,
                        action=f'{request.method} {request.path}',
                        ip_address=request.remote_addr
                    )
                    db.session.add(entry)
                    db.session.commit()
            except Exception:
                pass  # Never let logging break a response
        return response

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
