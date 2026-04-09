# Outfit Rule Logic Research (PM-46)

## Research Question

What recommendation logic structure should ClosetIQ use to generate outfit suggestions?

---

## Approaches Considered

### 1. Pure Rule-Based (Tag Matching)
Each wardrobe item is tagged with metadata (occasion, weather, dress code, color). The recommendation engine filters items whose tags match the user's request.

**Pros:** Simple, explainable, no training data needed, works with a wardrobe of any size  
**Cons:** Recommendations are only as good as the tags the user provides; no learning from usage

**Current implementation** — this is what ClosetIQ v1 uses.

---

### 2. Constraint Satisfaction
Model outfit generation as a CSP (Constraint Satisfaction Problem): variables are outfit slots (top, bottom, shoes, outerwear), domains are the items in each category, constraints are tag compatibility.

**Example constraints:**
- `top.occasion_tags ∩ request.occasions ≠ ∅`
- `bottom.dress_code == top.dress_code` (formality consistency)
- `shoes.weather_tags ∩ weather_category ≠ ∅`

**Pros:** More principled than random sampling, can enforce style rules  
**Cons:** More complex to implement; requires richer constraint definitions

---

### 3. Collaborative Filtering
Learn from what outfits users save, and recommend combinations that similar users liked.

**Pros:** Improves over time, discovers non-obvious combinations  
**Cons:** Requires substantial user data (cold-start problem), adds ML infrastructure

---

### 4. Embedding-Based Similarity
Encode items as vectors (category, color, brand embeddings) and recommend items with high cosine similarity to the target item or style.

**Pros:** Can learn "these colors work together" without explicit rules  
**Cons:** Requires training or pre-trained fashion embeddings; overkill for this scope

---

## Decision: Rule-Based with Slot Balancing

ClosetIQ v1 uses tag-matching with slot-balanced outfit building:

1. Filter candidate items by requested tag (occasion / weather / dress code / color)
2. Partition candidates into category slots (top, bottom, shoes, outerwear, accessories)
3. Randomly select one item per slot from qualified candidates
4. Return structured outfit dict + flat item list

**Upgrade path for v2:**
- Add constraint scoring: outfits where more slots share the same occasion tag score higher
- Add color harmony rules: complementary / monochromatic / neutral + accent
- Add "wore recently" penalty to avoid repetitive suggestions

---

## Rule Engine Logic Structure

```
recommend(user_id, filters) →
  items = query_wardrobe(user_id)
  candidates = filter(items, filters)      # tag matching
  if candidates empty → candidates = items  # fallback
  slots = partition_by_category(candidates)
  outfit = {slot: random.choice(items) for slot, items in slots.items() if items}
  return outfit
```

**Filter types supported:**
| Filter | Field Matched |
|--------|--------------|
| occasion | item.occasion_tags (JSON array) |
| weather | item.weather_tags (JSON array), derived from temperature |
| dress_code | item.dress_code (string) |
| color | item.color (string, substring match) |
| must_use | item.id (exact match, complemented by category-based filling) |
