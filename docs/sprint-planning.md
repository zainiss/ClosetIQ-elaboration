# Sprint Planning (PM-29, PM-33, PM-34, PM-35, PM-36)

## Sprint 1 — Foundation

**Duration:** Week 1–2  
**Goal:** Establish core project infrastructure and basic wardrobe management

### Sprint Backlog (PM-33)

| Story | Assignee | Points | Description |
|-------|----------|--------|-------------|
| PM-2  | Mustafa  | 5 | Upload clothing via photo |
| PM-6  | Mustafa  | 3 | Add clothing via link/SKU |
| PM-7  | Mustafa  | 3 | Tag clothing items |
| PM-17 | Hadi     | 5 | Structured database implementation |

### Sprint Goals (PM-34)

- Users can register and log in with JWT authentication
- Users can add items to their wardrobe via photo upload or link/SKU
- Items can be tagged with occasion, weather, and dress code metadata
- Database schema is finalized and documented

### Story Ownership (PM-35)

- **Mustafa** owns all wardrobe item CRUD features (PM-2, PM-6, PM-7)
- **Hadi** owns database design, auth integration, and security rules (PM-17)
- **Zain** owns frontend routing, auth context, and protected routes

### Sprint Plan Documentation (PM-36)

**Definition of Done:**
- Backend route implemented and returning correct JSON
- Frontend component wired to API and rendering correctly
- No console errors in browser
- Code pushed to main under correct git identity

---

## Sprint 2 — Outfit Recommendations

**Duration:** Week 3–4  
**Goal:** Implement all outfit recommendation features

### Sprint Backlog

| Story | Assignee | Points | Description |
|-------|----------|--------|-------------|
| PM-8  | Mustafa  | 3 | Request outfit by occasion |
| PM-9  | Zain     | 3 | Request outfit by weather |
| PM-10 | Mustafa  | 2 | Specify dress code |
| PM-11 | Mustafa  | 3 | Select color preference |
| PM-12 | Mustafa  | 3 | Must-use clothing item |
| PM-13 | Hadi     | 5 | Generate multiple outfit options |
| PM-14 | Mustafa  | 2 | Include shoes in recommendations |

### Sprint Goals

- All recommendation endpoints operational (occasion, weather, dress code, color, must-use, shoes, multiple)
- Outfits page shows all recommendation types with working UI
- Outfit can be saved with name and occasion

### Story Ownership

- **Mustafa** owns PM-8, PM-10, PM-11, PM-12, PM-14 (recommendation variants)
- **Zain** owns PM-9 (weather)
- **Hadi** owns PM-13 (multiple options engine)

---

## Sprint 3 — Admin & Accessibility

**Duration:** Week 5–6  
**Goal:** Admin controls, accessibility improvements, and project documentation

### Sprint Backlog

| Story | Assignee | Points | Description |
|-------|----------|--------|-------------|
| PM-15 | Hadi     | 5 | Manage user accounts |
| PM-16 | Hadi     | 3 | Monitor system activity |
| PM-18 | Zain     | 3 | Implement readable text layout |
| PM-19 | Zain     | 3 | Implement high-contrast mode |
| PM-20 | Zain     | 2 | Structured outfit presentation format |

### Sprint Goals

- Admin panel fully functional with user management and activity log
- High-contrast mode toggle persists across sessions
- Typography scale applied consistently across all pages
- All pages responsive on mobile (320px minimum)
