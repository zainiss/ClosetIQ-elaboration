# Architecture Research — Firebase vs SQLAlchemy (PM-44, PM-48, PM-49)

## Research Question

Should ClosetIQ use Firebase (Firestore + Firebase Auth) or a traditional Python backend with SQLAlchemy?

---

## Firebase Authentication Comparison (PM-48)

| Factor | Firebase Auth | Flask-JWT-Extended |
|--------|--------------|-------------------|
| Setup time | Low — SDK handles everything | Medium — manual implementation |
| Token management | Automatic refresh | Manual (client stores + refreshes token) |
| Social login | Built-in (Google, Apple, GitHub) | Not included — needs extra library |
| Customisation | Limited | Full control over claims, expiry, logic |
| Cost | Free tier, then pay-per-MAU | No additional cost (self-hosted) |
| Backend dependency | None for auth | Requires running Flask server |
| Token storage risk | Same XSS risk | Same XSS risk — depends on client strategy |

**Decision:** Flask-JWT-Extended chosen.  
**Reason:** Full control over the auth flow, no external dependency, JWT tokens stored in React memory (not localStorage) to mitigate XSS. Social login is out of scope for this project.

---

## Firestore Data Modeling Examples (PM-49)

If Firebase had been chosen, the Firestore collections would map as follows:

### `users/{userId}`
```json
{
  "username": "string",
  "email": "string",
  "isAdmin": false,
  "isActive": true,
  "createdAt": "timestamp"
}
```

### `users/{userId}/wardrobeItems/{itemId}`
```json
{
  "name": "string",
  "category": "string",
  "color": "string",
  "brand": "string",
  "imageUrl": "string",
  "sourceUrl": "string",
  "sku": "string",
  "tags": ["string"],
  "occasionTags": ["casual", "work", "wedding"],
  "dressCode": "string",
  "weatherTags": ["hot", "warm", "cold"],
  "createdAt": "timestamp"
}
```

### `users/{userId}/outfits/{outfitId}`
```json
{
  "name": "string",
  "occasion": "string",
  "dressCode": "string",
  "itemIds": ["itemId1", "itemId2"],
  "createdAt": "timestamp"
}
```

### Security Rules (Firestore equivalent of PM-24)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read: if request.auth != null &&
        (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
    }
  }
}
```

---

## Final Decision: SQLAlchemy + SQLite/PostgreSQL

**Why SQLAlchemy was chosen over Firebase:**

1. **Course requirements** — the backend is Python/Flask; using Firestore would mean the Python backend is just a pass-through with no real backend logic
2. **Complex querying** — filtering wardrobe items by multiple tag fields (occasion + weather + dress code) is much cleaner in SQL than Firestore composite queries
3. **Relational data** — outfit → items relationship is naturally a join, not a Firestore sub-collection traversal
4. **Local dev** — SQLite works offline with zero setup; Firebase requires internet and credentials
5. **Cost** — no Firebase billing surprises as data grows
