# Code Review Session (PM-30, PM-37, PM-38)

## Review Process

Code reviews happen before merging any feature branch to `main`. The reviewer reads the diff, runs the backend locally, and checks the frontend for visual regressions.

---

## Feature Implementation Review (PM-37)

### Wardrobe Routes (`backend/app/routes/wardrobe.py`)

**Reviewed by:** Zain  
**Status:** Approved with notes

- ✅ Photo upload correctly validates file extension before saving
- ✅ All routes are `@jwt_required()` — no unauthenticated data access
- ✅ `user_id` is always taken from JWT identity, never from request body (prevents user spoofing)
- ✅ Tag update route correctly overwrites JSON field rather than appending blindly
- ⚠️ `ALLOWED_EXTENSIONS` set could be extracted to config for easier maintenance
- ⚠️ Image path stored as absolute path — should be relative for portability across environments

### Outfit Service (`backend/app/services/outfit_service.py`)

**Reviewed by:** Zain  
**Status:** Approved

- ✅ All recommend functions fall back to random sample when no tagged items found — avoids empty results
- ✅ `build_outfit_from_items` correctly deduplicates by category slot using `random.choice`
- ✅ `recommend_multiple` uses frozenset key to avoid duplicate outfit combinations
- ✅ `SHOE_CATEGORIES` constant makes category matching easy to extend
- ⚠️ Recommendation logic is rule-based — future improvement would be ML-based scoring

### Frontend API Layer (`frontend/src/api/`)

**Reviewed by:** Zain  
**Status:** Approved

- ✅ `client.js` centralises all `fetch` calls — easy to swap base URL or add auth headers globally
- ✅ JWT token stored in React context (memory), not `localStorage` — reduces XSS attack surface
- ✅ All API functions use `async/await` consistently
- ✅ Error responses are re-thrown so components can catch and display them

---

## Feedback Comments (PM-38)

### To Mustafa — wardrobe routes

> The image upload saves to `backend/uploads/` using the original filename. Two users could overwrite each other's files if they upload a photo with the same name. Suggest prefixing with `user_id` or using `uuid4()` for filenames.

> The `add_by_link` route doesn't validate that `source_url` is a real URL — could add a basic `http/https` prefix check.

### To Hadi — admin routes

> `_require_admin()` helper is clean — good pattern. One note: if `User.query.get(user_id)` returns None (deleted user with valid JWT), the route will 403 rather than 401. Could add a separate check for user existence vs admin status to give cleaner error messages.

> The activity log middleware catches all exceptions silently (`except Exception: pass`) — this is correct for logging but worth a comment explaining why.

### General

> Commit messages are clear and descriptive across all contributors — makes it easy to understand what changed without reading diffs.

> All protected routes consistently use `@jwt_required()` with identity fetched via `get_jwt_identity()`. Good discipline.
