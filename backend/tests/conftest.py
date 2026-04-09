import pytest
import os
import tempfile
from app import create_app
from app.extensions import db

@pytest.fixture
def app():
    """Create test app with temporary database"""
    db_fd, db_path = tempfile.mkstemp()
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

    os.close(db_fd)
    os.unlink(db_path)

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def runner(app):
    """Create test CLI runner"""
    return app.test_cli_runner()

@pytest.fixture
def auth_header(client):
    """Register and login user, return auth header"""
    # Register
    client.post('/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123'
    })

    # Login
    response = client.post('/auth/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })

    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}
