"""
Throwaway prototype for recommendation logic (PM-47, PM-50).

This is a standalone script — no Flask, no database.
It simulates the rule engine using plain Python dicts to test
the logic before wiring it into the real backend.

Run: python recommendation_prototype.py
"""

import random
from typing import Optional

# ── Sample wardrobe data ──────────────────────────────────────────────────────

SAMPLE_WARDROBE = [
    {'id': 1,  'name': 'White Oxford Shirt',    'category': 'shirt',    'color': 'white',  'occasion_tags': ['work', 'formal'],     'dress_code': 'Formal',          'weather_tags': ['warm', 'cool']},
    {'id': 2,  'name': 'Navy Chinos',           'category': 'pants',    'color': 'navy',   'occasion_tags': ['work', 'casual'],     'dress_code': 'Business Casual', 'weather_tags': ['warm', 'cool']},
    {'id': 3,  'name': 'Black Leather Shoes',   'category': 'shoes',    'color': 'black',  'occasion_tags': ['work', 'formal'],     'dress_code': 'Formal',          'weather_tags': ['warm', 'cool', 'cold']},
    {'id': 4,  'name': 'Grey Hoodie',           'category': 'hoodie',   'color': 'grey',   'occasion_tags': ['casual', 'gym'],      'dress_code': 'Casual',          'weather_tags': ['cool', 'cold']},
    {'id': 5,  'name': 'Black Joggers',         'category': 'pants',    'color': 'black',  'occasion_tags': ['casual', 'gym'],      'dress_code': 'Casual',          'weather_tags': ['warm', 'cool', 'cold']},
    {'id': 6,  'name': 'White Sneakers',        'category': 'sneakers', 'color': 'white',  'occasion_tags': ['casual', 'gym'],      'dress_code': 'Casual',          'weather_tags': ['hot', 'warm']},
    {'id': 7,  'name': 'Floral Dress',          'category': 'dress',    'color': 'floral', 'occasion_tags': ['casual', 'wedding'],  'dress_code': 'Smart Casual',    'weather_tags': ['hot', 'warm']},
    {'id': 8,  'name': 'Black Blazer',          'category': 'blazer',   'color': 'black',  'occasion_tags': ['work', 'formal'],     'dress_code': 'Formal',          'weather_tags': ['cool', 'cold']},
    {'id': 9,  'name': 'Denim Jacket',          'category': 'jacket',   'color': 'blue',   'occasion_tags': ['casual'],             'dress_code': 'Casual',          'weather_tags': ['cool']},
    {'id': 10, 'name': 'Graphic Tee',           'category': 'top',      'color': 'black',  'occasion_tags': ['casual'],             'dress_code': 'Casual',          'weather_tags': ['hot', 'warm']},
]

# ── Category slot definitions ─────────────────────────────────────────────────

TOPS      = {'shirt', 'blouse', 'sweater', 'top', 't-shirt', 'tshirt', 'dress'}
BOTTOMS   = {'pants', 'jeans', 'shorts', 'skirt', 'leggings', 'trousers'}
SHOES     = {'shoes', 'boot', 'boots', 'sneaker', 'sneakers', 'heel', 'heels', 'loafer', 'sandal'}
OUTERWEAR = {'jacket', 'coat', 'blazer', 'hoodie', 'cardigan'}


def partition_into_slots(items):
    slots = {'top': [], 'bottom': [], 'shoes': [], 'outerwear': []}
    for item in items:
        cat = item['category'].lower()
        if cat in TOPS:       slots['top'].append(item)
        elif cat in BOTTOMS:  slots['bottom'].append(item)
        elif cat in SHOES:    slots['shoes'].append(item)
        elif cat in OUTERWEAR: slots['outerwear'].append(item)
    return slots


def build_outfit(items):
    slots = partition_into_slots(items)
    return {slot: random.choice(picks) for slot, picks in slots.items() if picks}


# ── Draft rule engine logic (PM-50) ──────────────────────────────────────────

def filter_by_occasion(wardrobe, occasion: str):
    occasion_lower = occasion.lower()
    return [i for i in wardrobe if occasion_lower in [t.lower() for t in i['occasion_tags']]]


def filter_by_weather(wardrobe, temperature: Optional[float] = None, condition: Optional[str] = None):
    category = _weather_category(temperature, condition)
    return [i for i in wardrobe if category in i['weather_tags']]


def filter_by_dress_code(wardrobe, dress_code: str):
    return [i for i in wardrobe if i['dress_code'].lower() == dress_code.lower()]


def filter_by_color(wardrobe, color: str):
    return [i for i in wardrobe if color.lower() in i['color'].lower()]


def _weather_category(temperature, condition):
    if condition:
        if 'rain' in condition.lower(): return 'rainy'
        if 'snow' in condition.lower(): return 'cold'
    if temperature is not None:
        if temperature > 25:  return 'hot'
        if temperature > 15:  return 'warm'
        if temperature > 5:   return 'cool'
        return 'cold'
    return 'warm'


def recommend(wardrobe, filter_fn, fallback=True):
    """Apply a filter function; fall back to full wardrobe if no matches."""
    candidates = filter_fn(wardrobe)
    if not candidates and fallback:
        candidates = wardrobe
    if not candidates:
        return None
    sample = random.sample(candidates, min(5, len(candidates)))
    return build_outfit(sample)


def recommend_multiple(wardrobe, filter_fn, count=3):
    """Generate multiple distinct outfit options."""
    candidates = filter_fn(wardrobe) or wardrobe
    outfits = []
    seen = set()
    for _ in range(count * 10):
        if len(outfits) >= count:
            break
        sample = random.sample(candidates, min(5, len(candidates)))
        outfit = build_outfit(sample)
        key = frozenset((slot, item['id']) for slot, item in outfit.items())
        if key not in seen:
            seen.add(key)
            outfits.append(outfit)
    return outfits


# ── Demo run ──────────────────────────────────────────────────────────────────

def print_outfit(outfit, label=''):
    print(f"\n{'─'*40}")
    if label: print(f"  {label}")
    print(f"{'─'*40}")
    for slot, item in outfit.items():
        print(f"  {slot:12s} → {item['name']} ({item['color']})")


if __name__ == '__main__':
    print("=== ClosetIQ Recommendation Prototype ===\n")

    print("1. By occasion: work")
    outfit = recommend(SAMPLE_WARDROBE, lambda w: filter_by_occasion(w, 'work'))
    if outfit: print_outfit(outfit, "Occasion: Work")

    print("\n2. By weather: 10°C, no condition")
    outfit = recommend(SAMPLE_WARDROBE, lambda w: filter_by_weather(w, temperature=10))
    if outfit: print_outfit(outfit, "Weather: 10°C")

    print("\n3. By dress code: Formal")
    outfit = recommend(SAMPLE_WARDROBE, lambda w: filter_by_dress_code(w, 'Formal'))
    if outfit: print_outfit(outfit, "Dress Code: Formal")

    print("\n4. By color: black")
    outfit = recommend(SAMPLE_WARDROBE, lambda w: filter_by_color(w, 'black'))
    if outfit: print_outfit(outfit, "Color: Black")

    print("\n5. Multiple options (casual, 3 outfits)")
    options = recommend_multiple(SAMPLE_WARDROBE, lambda w: filter_by_occasion(w, 'casual'), count=3)
    for idx, o in enumerate(options, 1):
        print_outfit(o, f"Option {idx} — Casual")

    print(f"\n{'='*40}")
    print("Prototype complete.")
