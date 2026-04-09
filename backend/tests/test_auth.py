def test_register_user(client):
    """Test user registration"""
    response = client.post('/auth/register', json={
        'username': 'newuser',
        'email': 'new@example.com',
        'password': 'password123'
    })

    assert response.status_code == 201
    data = response.get_json()
    assert data['user']['username'] == 'newuser'
    assert data['user']['email'] == 'new@example.com'

def test_register_duplicate_username(client):
    """Test registration with duplicate username"""
    client.post('/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })

    response = client.post('/auth/register', json={
        'username': 'testuser',
        'email': 'other@example.com',
        'password': 'password123'
    })

    assert response.status_code == 409
    assert 'already exists' in response.get_json()['error']

def test_login_user(client):
    """Test user login"""
    client.post('/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })

    response = client.post('/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })

    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data
    assert data['user']['username'] == 'testuser'

def test_login_invalid_password(client):
    """Test login with invalid password"""
    client.post('/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })

    response = client.post('/auth/login', json={
        'username': 'testuser',
        'password': 'wrongpassword'
    })

    assert response.status_code == 401
