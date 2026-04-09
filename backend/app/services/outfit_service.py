import random
from app.models.wardrobe_item import WardrobeItem

def recommend_by_occasion(user_id, occasion):
    """
    Recommend outfit items for a given occasion.

    Args:
        user_id: ID of the user
        occasion: Occasion string (e.g., "casual", "formal", "work")

    Returns:
        List of WardrobeItem objects suitable for the occasion
    """
    # Query items tagged with this occasion
    items = WardrobeItem.query.filter_by(user_id=user_id).all()

    matched_items = []
    for item in items:
        if occasion in item.occasion_tags_list:
            matched_items.append(item)

    # If no exact matches, return random items from wardrobe
    if not matched_items:
        return random.sample(items, min(3, len(items))) if items else []

    return matched_items[:5]  # Return up to 5 items

def recommend_by_weather(user_id, temperature=None, condition=None):
    """
    Recommend outfit items for given weather conditions.

    Args:
        user_id: ID of the user
        temperature: Temperature in Celsius (optional)
        condition: Weather condition string (e.g., "rainy", "sunny")

    Returns:
        List of WardrobeItem objects suitable for the weather
    """
    # Determine weather category from temperature and condition
    weather_category = _determine_weather_category(temperature, condition)

    items = WardrobeItem.query.filter_by(user_id=user_id).all()

    matched_items = []
    for item in items:
        if weather_category in item.weather_tags_list:
            matched_items.append(item)

    # If no exact matches, return random items
    if not matched_items:
        return random.sample(items, min(3, len(items))) if items else []

    return matched_items[:5]

def recommend_by_dress_code(user_id, dress_code):
    """
    Recommend outfit items for a given dress code.

    Args:
        user_id: ID of the user
        dress_code: Dress code string (e.g., "formal", "casual", "business casual")

    Returns:
        List of WardrobeItem objects matching the dress code
    """
    items = WardrobeItem.query.filter_by(user_id=user_id, dress_code=dress_code).all()

    # If no items with exact dress_code, try all items tagged for this dress code
    if not items:
        all_items = WardrobeItem.query.filter_by(user_id=user_id).all()
        items = [item for item in all_items if item.dress_code == dress_code]

    # If still no matches, return random items
    if not items:
        all_items = WardrobeItem.query.filter_by(user_id=user_id).all()
        return random.sample(all_items, min(3, len(all_items))) if all_items else []

    return items[:5]

def build_outfit_from_items(items):
    """
    Build a structured outfit recommendation from a list of items.
    Tries to balance item categories (tops, bottoms, shoes, etc.).

    Args:
        items: List of WardrobeItem objects

    Returns:
        Dict with categories as keys and item dicts as values
    """
    outfit = {
        'top': None,
        'bottom': None,
        'shoes': None,
        'outerwear': None,
        'accessories': None
    }

    # Categorize items
    tops = [i for i in items if i.category.lower() in ['shirt', 'blouse', 'sweater', 'top']]
    bottoms = [i for i in items if i.category.lower() in ['pants', 'jeans', 'shorts', 'skirt', 'leggings']]
    shoes = [i for i in items if i.category.lower() in ['shoes', 'boot', 'sneaker']]
    outerwear = [i for i in items if i.category.lower() in ['jacket', 'coat', 'blazer']]
    accessories = [i for i in items if i.category.lower() in ['belt', 'scarf', 'hat', 'accessory']]

    # Pick one from each category if available
    if tops:
        outfit['top'] = random.choice(tops).to_dict()
    if bottoms:
        outfit['bottom'] = random.choice(bottoms).to_dict()
    if shoes:
        outfit['shoes'] = random.choice(shoes).to_dict()
    if outerwear:
        outfit['outerwear'] = random.choice(outerwear).to_dict()
    if accessories:
        outfit['accessories'] = random.choice(accessories).to_dict()

    # Remove None values
    outfit = {k: v for k, v in outfit.items() if v is not None}

    return outfit

def _determine_weather_category(temperature, condition):
    """
    Helper function to determine weather category from temperature and condition.

    Args:
        temperature: Temperature in Celsius
        condition: Weather condition string

    Returns:
        Weather category string (hot, warm, cool, cold, rainy)
    """
    # Check condition first if provided
    if condition:
        condition_lower = condition.lower()
        if 'rain' in condition_lower:
            return 'rainy'
        if 'snow' in condition_lower:
            return 'cold'
        if 'sunny' in condition_lower or 'clear' in condition_lower:
            # If sunny, use temperature
            pass

    # Use temperature if no condition or need to refine
    if temperature is not None:
        if temperature > 25:
            return 'hot'
        elif temperature > 15:
            return 'warm'
        elif temperature > 5:
            return 'cool'
        else:
            return 'cold'

    # Default
    return 'warm'
