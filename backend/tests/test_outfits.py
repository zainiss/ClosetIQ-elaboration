def test_outfit_by_occasion(client, auth_header):
    """Test outfit recommendation by occasion"""
    client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Formal Shirt',
            'category': 'shirt',
            'source_url': 'https://example.com'
        }
    )

    items = client.get('/wardrobe/items', headers=auth_header).get_json()
    item_id = items[0]['id']
    client.post(f'/wardrobe/items/{item_id}/tags',
        headers=auth_header,
        json={'tags': ['formal']}
    )

    client.put(f'/wardrobe/items/{item_id}',
        headers=auth_header,
        json={'occasion_tags': ['formal', 'wedding']}
    )

    response = client.post('/outfits/by-occasion',
        headers=auth_header,
        json={'occasion': 'formal'}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['occasion'] == 'formal'
    assert len(data['items']) > 0

def test_outfit_by_weather_temp(client, auth_header):
    """Test outfit recommendation by weather (temperature)"""
    client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Winter Coat',
            'category': 'jacket',
            'source_url': 'https://example.com'
        }
    )

    items = client.get('/wardrobe/items', headers=auth_header).get_json()
    item_id = items[0]['id']

    client.put(f'/wardrobe/items/{item_id}',
        headers=auth_header,
        json={'weather_tags': ['cold', 'rainy']}
    )

    response = client.post('/outfits/by-weather',
        headers=auth_header,
        json={'temperature': -5}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert 'items' in data

def test_outfit_by_weather_condition(client, auth_header):
    """Test outfit recommendation by weather condition"""
    client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Raincoat',
            'category': 'jacket',
            'source_url': 'https://example.com'
        }
    )

    items = client.get('/wardrobe/items', headers=auth_header).get_json()
    item_id = items[0]['id']

    client.put(f'/wardrobe/items/{item_id}',
        headers=auth_header,
        json={'weather_tags': ['rainy']}
    )

    response = client.post('/outfits/by-weather',
        headers=auth_header,
        json={'condition': 'rainy'}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['condition'] == 'rainy'

def test_outfit_by_dress_code(client, auth_header):
    """Test outfit recommendation by dress code"""
    client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Business Shirt',
            'category': 'shirt',
            'source_url': 'https://example.com'
        }
    )

    items = client.get('/wardrobe/items', headers=auth_header).get_json()
    item_id = items[0]['id']

    client.put(f'/wardrobe/items/{item_id}',
        headers=auth_header,
        json={'dress_code': 'business casual'}
    )

    response = client.post('/outfits/by-dress-code',
        headers=auth_header,
        json={'dress_code': 'business casual'}
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['dress_code'] == 'business casual'

def test_save_outfit(client, auth_header):
    """Test saving an outfit"""
    client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Shirt',
            'category': 'shirt',
            'source_url': 'https://example.com'
        }
    )

    client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Pants',
            'category': 'pants',
            'source_url': 'https://example.com'
        }
    )

    items = client.get('/wardrobe/items', headers=auth_header).get_json()
    item_ids = [item['id'] for item in items]

    response = client.post('/outfits',
        headers=auth_header,
        json={
            'name': 'Casual Look',
            'occasion': 'casual',
            'items': item_ids
        }
    )

    assert response.status_code == 201
    data = response.get_json()
    assert data['outfit']['name'] == 'Casual Look'
    assert len(data['outfit']['items']) == 2

def test_list_outfits(client, auth_header):
    """Test listing saved outfits"""
    client.post('/wardrobe/items/link',
        headers=auth_header,
        json={
            'name': 'Shirt',
            'category': 'shirt',
            'source_url': 'https://example.com'
        }
    )

    items = client.get('/wardrobe/items', headers=auth_header).get_json()

    client.post('/outfits',
        headers=auth_header,
        json={
            'name': 'Test Outfit',
            'occasion': 'casual',
            'items': [items[0]['id']]
        }
    )

    response = client.get('/outfits', headers=auth_header)

    assert response.status_code == 200
    outfits = response.get_json()
    assert len(outfits) == 1
    assert outfits[0]['name'] == 'Test Outfit'
