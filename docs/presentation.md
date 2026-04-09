# Final Presentation Preparation (PM-32, PM-41, PM-42)

## Presentation Outline (PM-41)

**Title:** ClosetIQ — AI-Powered Digital Wardrobe & Outfit Recommendation System  
**Team:** Zain (Zainiss), Hadi (hadiiikhan), Mustafa (mufatamerr)

---

### Slide 1 — Problem Statement
- Getting dressed takes time and mental effort
- People forget what's in their wardrobe
- Outfit choices depend on context: weather, occasion, dress code
- **Solution:** ClosetIQ — a personal wardrobe manager with smart outfit recommendations

### Slide 2 — System Overview
- **Backend:** Python / Flask, SQLAlchemy ORM, JWT authentication
- **Frontend:** React (SPA), react-router-dom, Context API
- **Database:** SQLite (dev), portable to PostgreSQL
- **Architecture:** REST API consumed by React frontend

### Slide 3 — Core Features Demo
1. Register / Login (JWT-secured)
2. Add items to wardrobe (photo upload / link / SKU)
3. Tag items with occasions, weather, dress code, colors
4. Request outfit by: occasion, weather, dress code, color, must-use item, shoes, multiple options

### Slide 4 — Outfit Recommendation Engine
- Rule-based matching against item tags
- `build_outfit_from_items`: categories items into top/bottom/shoes/outerwear/accessories
- Falls back to random selection when no tagged items match
- `recommend_multiple`: generates N distinct outfit combinations using de-duplication

### Slide 5 — Admin Panel
- User account management: list, deactivate, activate, delete
- Activity monitoring: every mutating request logged with user ID, action, IP, timestamp
- System statistics dashboard: total users, items, outfits, events

### Slide 6 — Accessibility
- Full typography scale (CSS variables, --font-xs through --font-3xl)
- High-contrast mode toggle (black/white/yellow palette, persisted in localStorage)
- Responsive design from 480px (mobile) to 1200px+ (desktop)
- All form inputs have labels; buttons have aria-label where icon-only

### Slide 7 — Development Process
- 3 sprints, 3 contributors
- Jira for task tracking (PMP project): 50 tasks across 6 epics
- Git history reflects real authorship (each commit under correct contributor identity)
- Code review process documented with specific feedback per contributor

### Slide 8 — What We'd Do Differently
- Use PostgreSQL from the start (SQLite write-lock issues under load)
- Add ML-based outfit scoring (currently pure rule-matching)
- Add OAuth login (Google/Apple) instead of just email/password
- Add outfit sharing / social feed feature

---

## System Screenshots & Demo Recording (PM-42)

### Screenshots to Capture
1. Login / Register page
2. Empty wardrobe state with prompt to add items
3. Wardrobe page with items loaded (photo cards with tags visible)
4. Photo upload in progress (file selected, form ready)
5. OutfitsPage — By Occasion section with result showing outfit breakdown
6. OutfitsPage — Multiple Options showing 3 outfit cards
7. OutfitsPage — High Contrast mode active
8. Admin Panel — Users tab
9. Admin Panel — Activity Log tab
10. Admin Panel — Stats tab (dashboard numbers)

### Demo Flow (for recording)
1. Register a new account → land on wardrobe
2. Upload 2–3 items via photo with different categories and tags
3. Navigate to Outfits → click "Work" occasion → show result
4. Try "Multiple Options" → show 3 distinct outfits
5. Toggle high-contrast mode → show the visual change
6. Log in as admin → show Users tab + Activity log populating
