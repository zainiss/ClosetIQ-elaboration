import io
from PIL import Image

def test_get_wardrobe_items_empty(client, auth_header):
    """Test getting empty wardrobe"""
    response = client.get('/wardrobe/items', headers=auth_header)

    assert response.status_code == 200
    assert response.get_json() == []

def test_add_item_via_link(client, auth_header):
    """Test adding item via product link"""
    response = client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Blue Jeans',
            'category': 'pants',
            'color': 'blue',
            'source_url': 'https://example.com/jeans'
        }
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data['item']['name'] == 'Blue Jeans'
    assert data['item']['category'] == 'pants'
    assert data['item']['source_url'] == 'https://example.com/jeans'

def test_add_item_via_sku(client, auth_header):
    """Test adding item via SKU"""
    response = client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Red Shirt',
            'category': 'shirt',
            'sku': 'SKU-123456'
        }
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data['item']['sku'] == 'SKU-123456'

def test_add_item_missing_fields(client, auth_header):
    """Test adding item with missing required fields"""
    response = client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Blue Jeans'
        }
    )

    assert response.status_code == 400

def test_upload_photo(client, auth_header, app):
    """Test uploading clothing item photo"""
    img = Image.new('RGB', (100, 100), color='red')
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)

    response = client.post('/wardrobe/items/photo',
        headers=auth_header,
        data={
            'name': 'Red Jacket',
            'category': 'jacket',
            'color': 'red',
            'image': (img_io, 'test.png')
        },
        content_type='multipart/form-data'
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data['item']['name'] == 'Red Jacket'
    assert data['item']['image_path'] is not None

def test_set_tags(client, auth_header):
    """Test setting tags on wardrobe item"""
    add_response = client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Casual Shirt',
            'category': 'shirt',
            'source_url': 'https://example.com'
        }
    )

    item_id = add_response.get_json()['item']['id']

    response = client.post(f'/wardrobe/items/{item_id}/tags',
        headers=auth_header,
        json={'tags': ['summer', 'casual', 'cotton']}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert set(data['item']['tags']) == {'summer', 'casual', 'cotton'}

def test_update_item(client, auth_header):
    """Test updating wardrobe item"""
    add_response = client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Old Name',
            'category': 'shirt',
            'source_url': 'https://example.com'
        }
    )

    item_id = add_response.get_json()['item']['id']

    response = client.put(f'/wardrobe/items/{item_id}',
        headers=auth_header,
        json={
            'name': 'New Name',
            'dress_code': 'casual',
            'occasion_tags': ['casual', 'weekend']
        }
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['item']['name'] == 'New Name'
    assert data['item']['dress_code'] == 'casual'

def test_delete_item(client, auth_header):
    """Test deleting wardrobe item"""
    add_response = client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Temporary Item',
            'category': 'shirt',
            'source_url': 'https://example.com'
        }
    )

    item_id = add_response.get_json()['item']['id']

    response = client.delete(f'/wardrobe/items/{item_id}', headers=auth_header)
    assert response.status_code == 200

    get_response = client.get(f'/wardrobe/items/{item_id}', headers=auth_header)
    assert get_response.status_code == 404

def test_list_wardrobe_items(client, auth_header):
    """Test listing wardrobe items"""
    for i in range(3):
        client.post('/wardrobe/items/link',
            headers=auth_header,
            json={
                'name': f'Item {i}',
                'category': 'shirt',
                'source_url': f'https://example.com/{i}'
            }
        )

    response = client.get('/wardrobe/items', headers=auth_header)

    assert response.status_code == 200
    items = response.get_json()
    assert len(items) == 3
