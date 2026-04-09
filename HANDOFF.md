# ClosetIQ — Full Project Handoff

**Course**: SYST30025 – Software Engineering (Sheridan College)
**Assignment**: Elaboration Release — 20% of project grade
**Repo**: https://github.com/zainiss/ClosetIQ-elaboration
**Jira**: https://hadiiikhan.atlassian.net/jira/software/projects/PM/ (read-only)
**Date of Handoff**: April 9, 2026

---

## Who You Are Receiving This From

Three-person team:
| Name | GitHub Username | Email | Role |
|------|----------------|-------|------|
| Zain Rajper | Zainiss | zarajper@gmail.com | QA Lead, Accessibility |
| Hadi Khan | hadiiikhan | hadimikasa1@gmail.com | Scrum Master, Architecture Lead |
| Mustafa Tamer | mufatamerr | tamermus854@gmail.com | Product Owner, Requirements |

**Git commit rule**: Commit when the assignee changes. Use the git identity of whoever did the work. Hadi's PAT has no push access — push his commits using Zain's PAT but keep author set to hadiiikhan/hadimikasa1@gmail.com.
**Never** include Co-Authored-By: Claude in any commit.

---

## What This Project Is

ClosetIQ is a wardrobe management and outfit recommendation web app. Users digitize their clothing inventory and get outfit recommendations based on occasion, weather, dress code, color, or a must-use item. The recommendation engine is rule-based (no AI/ML) — it filters wardrobe items by tags and assembles outfit combinations.

**Three user types**:
- **End User (Closet Owner)**: manages wardrobe, gets outfit recommendations
- **System Administrator**: manages user accounts, monitors activity logs
- **Accessibility User**: needs high-contrast mode, structured layouts

---

## What Has Been Built (Code)

The full working application is in `backend/` (Python/Flask) and `frontend/` (React). It runs locally.

### Running the Project

**Backend**:
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
python run.py              # Starts on http://localhost:5000
```

**Frontend** — create `frontend/.env` first:
```
REACT_APP_API_URL=http://localhost:5000
```
Then:
```bash
cd frontend
npm install
npm start                  # Starts on http://localhost:3000
```

### Backend Structure

```
backend/
├── run.py                          # Flask entry point
├── requirements.txt
├── app/
│   ├── __init__.py                 # App factory, blueprint registration, activity log middleware
│   ├── config.py                   # Config (SECRET_KEY, JWT_SECRET_KEY, UPLOAD_FOLDER, DB URI)
│   ├── extensions.py               # SQLAlchemy, JWTManager, CORS instances
│   ├── models/
│   │   ├── user.py                 # User model (id, username, email, password_hash, is_admin, is_active)
│   │   ├── wardrobe_item.py        # WardrobeItem model (see below)
│   │   ├── outfit.py               # Outfit model
│   │   └── activity_log.py         # ActivityLog model (user_id, action, ip_address, created_at)
│   ├── routes/
│   │   ├── auth.py                 # POST /auth/register, POST /auth/login (accepts username or email)
│   │   ├── wardrobe.py             # CRUD for wardrobe items, photo upload, tag management
│   │   ├── outfits.py              # All recommendation endpoints
│   │   └── admin.py                # Admin-only: user management, activity log, stats
│   └── services/
│       ├── wardrobe_service.py     # save_image(), create_item_from_photo(), create_item_from_link()
│       └── outfit_service.py       # All recommendation logic (see below)
├── prototype/
│   └── recommendation_prototype.py # Standalone rule-engine demo (no Flask/DB)
└── tests/
    ├── test_auth.py
    ├── test_wardrobe.py
    └── test_outfits.py
```

### WardrobeItem Model Fields
```
id, user_id, name, category, color, brand,
image_path,          # filename in backend/uploads/
source_url,          # for SKU/link items
sku,
tags (JSON),         # general tags list
occasion_tags (JSON), # ["casual", "work", "formal", "athletic", "evening"]
dress_code,          # "casual" | "business casual" | "formal" | "athletic"
weather_tags (JSON), # ["cold", "mild", "warm", "waterproof"]
created_at, updated_at
```

### API Endpoints

**Auth** — no JWT required:
- `POST /auth/register` → `{ username, email, password }` → `{ access_token }`
- `POST /auth/login` → `{ username OR email, password }` → `{ access_token }`

**Wardrobe** — all JWT required:
- `GET /wardrobe/items` → list all user's items
- `POST /wardrobe/items/photo` → multipart form (name, category, color, brand, image[optional])
- `POST /wardrobe/items/link` → JSON (name, category, color, brand, source_url, sku)
- `PUT /wardrobe/items/<id>` → update item fields
- `DELETE /wardrobe/items/<id>`
- `POST /wardrobe/items/<id>/tags` → `{ tags: [] }`
- `GET /wardrobe/uploads/<filename>` → serve uploaded image

**Outfits** — all JWT required:
- `POST /outfits/by-occasion` → `{ occasion }` → outfit items
- `POST /outfits/by-weather` → `{ temperature, condition }` → outfit items
- `POST /outfits/by-dress-code` → `{ dress_code }` → outfit items
- `POST /outfits/multiple` → `{ occasion, count }` → array of outfits
- `POST /outfits/with-shoes` → `{ occasion }` → outfit guaranteed to include shoes
- `POST /outfits/by-color` → `{ color }` → outfit items matching color
- `POST /outfits/with-item` → `{ item_id }` → outfit built around must-use item
- `GET /outfits` → user's saved outfits
- `POST /outfits` → save an outfit

**Admin** — JWT + is_admin=True required:
- `GET /admin/users` → list all users
- `PUT /admin/users/<id>` → update user (deactivate/reactivate)
- `DELETE /admin/users/<id>` → delete user
- `GET /admin/activity` → activity log
- `GET /admin/stats` → system stats

### Recommendation Engine Logic (`outfit_service.py`)

- `recommend_by_occasion(user_id, occasion)` — filters items by occasion_tags
- `recommend_by_weather(user_id, temperature, condition)` — maps temp/condition to weather category, filters by weather_tags
- `recommend_by_dress_code(user_id, dress_code)` — filters by dress_code field
- `recommend_by_color(user_id, color)` — filters by color field substring match
- `recommend_with_item(user_id, item_id)` — anchors outfit around specific item, picks complementary categories
- `recommend_with_shoes(user_id, occasion)` — guarantees a shoe item in output
- `recommend_multiple(user_id, occasion, count=3)` — generates N distinct outfit combos using frozenset dedup
- `build_outfit_from_items(items)` — assembles `{top, bottom, shoes, outerwear, accessories}` dict from item list

Weather mapping:
- `>25°C` → `hot`
- `15–25°C` → `warm`
- `5–15°C` → `cool`
- `≤5°C` → `cold`
- `rain` in condition → `rainy`
- `snow` in condition → `cold`

### Frontend Structure

```
frontend/src/
├── App.jsx                         # Routes + high-contrast toggle (stored in localStorage)
├── AuthContext.jsx                 # Auth context: login/logout, token stored in localStorage
├── ProtectedRoute.jsx              # Wraps routes that need auth
├── api/
│   ├── client.js                   # Base fetch wrapper; reads REACT_APP_API_URL; token in localStorage
│   ├── wardrobe.js                 # getItems, uploadPhoto, addByLink, updateTags, deleteItem
│   ├── outfits.js                  # getByOccasion, getByWeather, getByDressCode, getByColor,
│   │                               #   getWithItem, getMultipleOutfits, getWithShoes
│   └── admin.js                    # listUsers, deactivateUser, activateUser, deleteUser,
│                                   #   getActivity, getStats
├── pages/
│   ├── LoginPage.jsx               # Login form (accepts username or email)
│   ├── RegisterPage.jsx            # Registration form
│   ├── WardrobePage.jsx            # Wardrobe management (add/edit/delete/tag items)
│   ├── OutfitsPage.jsx             # All 7 recommendation modes with form UI
│   └── AdminPage.jsx               # Three tabs: Users, Activity, Stats
├── components/
│   ├── layout/Navbar.jsx           # Nav with Admin link (only shown if user.is_admin)
│   ├── wardrobe/
│   │   ├── PhotoUpload.jsx         # Add-by-photo form (photo is optional)
│   │   ├── LinkSKUForm.jsx         # Add-by-link/SKU form
│   │   ├── TagEditor.jsx           # Edit tags inline on item card
│   │   └── WardrobeItemCard.jsx    # Item card with image, tags, edit/delete buttons
│   └── outfits/
│       └── OutfitResult.jsx        # Outfit display broken down by slot (top/bottom/shoes/etc.)
└── styles/
    ├── global.css                  # CSS variables, typography scale, spacing scale,
    │                               #   high-contrast overrides (body.high-contrast),
    │                               #   admin panel styles, responsive breakpoints
    ├── auth.css
    ├── navbar.css
    ├── wardrobe.css
    └── outfits.css
```

### Known Issues / Active Bugs

1. **Image display in wardrobe cards** — Images upload and save correctly to `backend/uploads/`. The backend serves them at `GET /wardrobe/uploads/<filename>`. The frontend constructs the URL as `process.env.REACT_APP_API_URL + '/wardrobe/uploads/' + item.image_path`. Despite the config and route being correct, images display as broken in the browser. The actual JPEG bytes are valid (confirmed via magic bytes check). This is the primary unresolved bug. Suspected cause: `REACT_APP_API_URL` may not be embedded correctly at CRA compile time, or there's a CORS header issue on the file-serving route. **Try adding `"proxy": "http://localhost:5000"` to `frontend/package.json` and changing the img src to just `/wardrobe/uploads/${item.image_path}`** — this may resolve it without needing the env var.

2. **Photo must be a real JPEG/PNG** — AVIF files will fail because `allowed_file()` now accepts png, jpg, jpeg, gif, webp, avif but PIL validation was removed. AVIF renamed to .jpg will still save but browser won't render.

3. **Admin accounts** — Must be manually created by setting `is_admin = 1` in the SQLite `users` table. No signup flow for admins.

---

## What Has NOT Been Built (Remaining Work)

The code is complete. What remains is the **Visual Paradigm modeling work** required for the assignment submission. The professor requires a Visual Paradigm (VP) model with these diagrams:

### Part I — Software Architecture Diagrams

### Part II — Interaction Model (per use-case)

### Part III — Deployment Diagram

These are described in full detail below.

---

## Diagram Specifications

> These specs are written so you can build each diagram from scratch in Visual Paradigm. All diagrams go into the VP project (VPository, shared by all 3 team members).

### Architecture Overview

**System Type**: Client-Server Information Management System
**Architectural Pattern**: Layered Architecture with Domain-Driven Design
- Layer 1 (Presentation): React SPA — renders UI, manages client state
- Layer 2 (Application Logic): Flask REST API — orchestrates requests, enforces auth
- Layer 3 (Domain): Models + Services — business rules, recommendation engine
- Layer 4 (Infrastructure): SQLite/SQLAlchemy — persistence, file storage

---

### DIAGRAM 1: Software System Architecture (Class Diagram)

**Name in VP**: `Software System Architecture`
**Type**: Class Diagram
**Location**: Design Model package (root level)
**Purpose**: High-level decomposition + dependency structure of the whole system

**Subsystems (packages/components to show)**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ClosetIQ System                              │
│                                                                 │
│  ┌──────────────────┐        ┌────────────────────────────┐    │
│  │  «subsystem»     │        │  «subsystem»               │    │
│  │  Presentation    │───────>│  Application Logic         │    │
│  │  Layer           │        │  Layer                     │    │
│  │                  │        │                            │    │
│  │  React SPA       │        │  Flask REST API            │    │
│  │  - LoginPage     │        │  - AuthController          │    │
│  │  - RegisterPage  │        │  - WardrobeController      │    │
│  │  - WardrobePage  │        │  - OutfitController        │    │
│  │  - OutfitsPage   │        │  - AdminController         │    │
│  │  - AdminPage     │        │                            │    │
│  │  - AuthContext   │        │                            │    │
│  └──────────────────┘        └────────────────────────────┘    │
│                                         │                       │
│                                         ▼                       │
│                              ┌────────────────────────────┐    │
│                              │  «subsystem»               │    │
│                              │  Domain Layer              │    │
│                              │                            │    │
│                              │  - User                    │    │
│                              │  - WardrobeItem            │    │
│                              │  - Outfit                  │    │
│                              │  - ActivityLog             │    │
│                              │  - OutfitService           │    │
│                              │  - WardrobeService         │    │
│                              │  - RecommendationEngine    │    │
│                              └────────────────────────────┘    │
│                                         │                       │
│                                         ▼                       │
│                              ┌────────────────────────────┐    │
│                              │  «subsystem»               │    │
│                              │  Infrastructure Layer      │    │
│                              │                            │    │
│                              │  - SQLiteDatabase          │    │
│                              │  - SQLAlchemy ORM          │    │
│                              │  - FileStorage (uploads/)  │    │
│                              │  - JWTManager              │    │
│                              └────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Dependency arrows** (dashed `«use»` or `«depend»`):
- Presentation → Application Logic
- Application Logic → Domain Layer
- Domain Layer → Infrastructure Layer
- Application Logic → Infrastructure Layer (direct DB access via ORM)

**Diagram description to write in VP**:
> ClosetIQ follows a Layered Architecture pattern with Domain-Driven Design. The system is a Client-Server information management application. The Presentation Layer (React SPA) communicates exclusively with the Application Logic Layer via HTTP REST calls. The Application Logic Layer (Flask API) orchestrates requests, enforces JWT authentication, and delegates to the Domain Layer for business rules. The Domain Layer contains the core models and the rule-based Recommendation Engine. The Infrastructure Layer provides persistence via SQLite/SQLAlchemy and file storage for uploaded clothing images. This layered pattern was selected because it cleanly separates UI concerns from business logic and persistence, supports independent team development per layer, and is well-suited to information management systems with CRUD operations and rule-based processing.

---

### DIAGRAM 2: Subsystem — Presentation Layer (Class Diagram)

**Name**: `Subsystem Design - Presentation Layer`
**Location**: Design Model > Presentation Layer package

**Public interfaces (show as classes with + visibility)**:
```
«component» ReactApp
  + render() : JSX
  + route(path) : Page

«component» AuthContext
  + login(email, password) : void
  + logout() : void
  + register(username, email, password) : void
  + isAuthenticated : boolean
  + user : UserDTO

«component» APIClient
  + get(path) : Promise
  + post(path, body) : Promise
  + put(path, body) : Promise
  + delete(path) : Promise
```

**Internal components (show as classes with - visibility or «private»)**:
```
«page» LoginPage
«page» RegisterPage
«page» WardrobePage
«page» OutfitsPage
«page» AdminPage
«component» Navbar
«component» ProtectedRoute
«component» PhotoUpload
«component» WardrobeItemCard
«component» OutfitResult
«component» TagEditor
```

**Description**: The Presentation Layer is a React single-page application. It manages client-side routing (react-router-dom), authentication state (AuthContext using localStorage-persisted JWT), and communicates with the backend through a centralized API client that attaches Bearer tokens. The layer has no business logic — it delegates all decisions to the Application Logic Layer.

---

### DIAGRAM 3: Subsystem — Application Logic Layer (Class Diagram)

**Name**: `Subsystem Design - Application Logic Layer`
**Location**: Design Model > Application Logic Layer package

**Public interfaces**:
```
«controller» AuthController
  + register(username, email, password) : TokenResponse
  + login(identifier, password) : TokenResponse

«controller» WardrobeController
  + getItems(userId) : List<WardrobeItemDTO>
  + addItemByPhoto(userId, formData) : WardrobeItemDTO
  + addItemByLink(userId, data) : WardrobeItemDTO
  + updateItem(userId, itemId, data) : WardrobeItemDTO
  + deleteItem(userId, itemId) : void
  + updateTags(userId, itemId, tags) : WardrobeItemDTO
  + serveImage(filename) : File

«controller» OutfitController
  + recommendByOccasion(userId, occasion) : OutfitDTO
  + recommendByWeather(userId, temp, condition) : OutfitDTO
  + recommendByDressCode(userId, dressCode) : OutfitDTO
  + recommendMultiple(userId, occasion, count) : List<OutfitDTO>
  + recommendWithShoes(userId, occasion) : OutfitDTO
  + recommendByColor(userId, color) : OutfitDTO
  + recommendWithItem(userId, itemId) : OutfitDTO
  + getOutfits(userId) : List<OutfitDTO>
  + saveOutfit(userId, outfitData) : OutfitDTO

«controller» AdminController
  + listUsers() : List<UserDTO>
  + updateUser(userId, data) : UserDTO
  + deleteUser(userId) : void
  + getActivityLog() : List<ActivityLogDTO>
  + getStats() : StatsDTO
```

**Internal components**:
```
«middleware» JWTAuthFilter
  - verifyToken(token) : UserId
  - requireAdmin(userId) : void

«middleware» ActivityLogger
  - logRequest(method, path, userId, ip) : void
```

**Description**: The Application Logic Layer is a Flask REST API. It receives HTTP requests from the Presentation Layer, enforces JWT authentication on all protected endpoints, delegates data retrieval and business rule execution to the Domain Layer, and returns JSON responses. The activity logging middleware automatically records all mutating requests (POST/PUT/PATCH/DELETE). The admin controller enforces an additional is_admin check before any admin operation.

---

### DIAGRAM 4: Subsystem — Domain Layer (Class Diagram)

**Name**: `Subsystem Design - Domain Layer`
**Location**: Design Model > Domain Layer package

**Public interfaces**:
```
«service» OutfitService
  + recommendByOccasion(userId, occasion) : List<WardrobeItem>
  + recommendByWeather(userId, temp, condition) : List<WardrobeItem>
  + recommendByDressCode(userId, dressCode) : List<WardrobeItem>
  + recommendByColor(userId, color) : List<WardrobeItem>
  + recommendWithItem(userId, itemId) : (WardrobeItem, List<WardrobeItem>)
  + recommendWithShoes(userId, occasion) : OutfitResult
  + recommendMultiple(userId, occasion, count) : List<OutfitResult>
  + buildOutfitFromItems(items) : OutfitDict

«service» WardrobeService
  + saveImage(file, uploadFolder) : String
  + createItemFromPhoto(userId, formData, imagePath) : WardrobeItem
  + createItemFromLink(userId, data) : WardrobeItem
```

**Domain entities (models)**:
```
«entity» User
  - id : int
  - username : String
  - email : String
  - password_hash : String
  - is_admin : Boolean
  - is_active : Boolean
  + checkPassword(password) : Boolean
  + toDict() : dict

«entity» WardrobeItem
  - id : int
  - user_id : int
  - name : String
  - category : String
  - color : String
  - brand : String
  - image_path : String
  - source_url : String
  - sku : String
  - tags : JSON
  - occasion_tags : JSON
  - dress_code : String
  - weather_tags : JSON
  + tags_list : List<String>
  + occasion_tags_list : List<String>
  + weather_tags_list : List<String>
  + toDict() : dict

«entity» Outfit
  - id : int
  - user_id : int
  + toDict() : dict

«entity» ActivityLog
  - id : int
  - user_id : int
  - action : String
  - resource : String
  - ip_address : String
  - created_at : DateTime
```

**Internal helper**:
```
«helper» WeatherMapper
  - determineWeatherCategory(temp, condition) : String
    Rule: >25°C → hot | 15-25°C → warm | 5-15°C → cool | ≤5°C → cold
          rain in condition → rainy | snow → cold
```

**Description**: The Domain Layer contains the core business entities and the rule-based Recommendation Engine. OutfitService implements deterministic filtering rules — items are matched against user-applied tags (occasion_tags, weather_tags, dress_code, color). No machine learning is used. The engine guarantees shoes are included when requested (BR-10). Multiple outfit generation uses frozenset deduplication to avoid returning identical combinations.

---

### DIAGRAM 5: Subsystem — Infrastructure Layer (Class Diagram)

**Name**: `Subsystem Design - Infrastructure Layer`
**Location**: Design Model > Infrastructure Layer package

**Components**:
```
«database» SQLiteDatabase
  + tables: users, wardrobe_items, outfits, activity_logs
  + location: backend/instance/closetiq.db

«ORM» SQLAlchemy
  + db.session.add(entity)
  + db.session.commit()
  + db.session.delete(entity)
  + Model.query.filter_by(**kwargs)

«storage» FileStorage
  + uploadFolder: backend/uploads/
  + allowedExtensions: {png, jpg, jpeg, gif, webp, avif}
  + save(file, folder) : filename
  + serve(filename) : File

«security» JWTManager
  + createAccessToken(identity) : String
  + decodeToken(token) : identity
  + tokenExpiry: configurable
```

---

### DIAGRAM 6–8: Interaction Model — Mustafa's Use Cases

Each use case gets 3 diagrams: Collaboration Overview, Structural Overview, Behavioural Overview.

---

#### UC-M2: Manage Wardrobe Items

**DIAGRAM 6a: Collaboration Overview — Manage Wardrobe Items**
- Type: Class Diagram
- Shows: The `«use case» Manage Wardrobe Items` oval in center
- Connected to subsystems involved: Presentation Layer, Application Logic Layer, Domain Layer, Infrastructure Layer
- Label the connections with the responsibility (e.g., "submits item data", "validates & routes", "creates entity", "persists record")

**DIAGRAM 6b: Structural Overview — Manage Wardrobe Items**
- Type: Class Diagram
- Classes to show with full methods/fields:

```
PhotoUpload (React Component)
  - formData: { name, category, color, brand, image }
  - error: String
  + handleSubmit() : void
  + handleFileChange(e) : void
  + handleInputChange(e) : void

WardrobeController (Flask Route /wardrobe)
  + uploadPhoto(userId) : Response[201]
  + addByLink(userId) : Response[201]
  + updateItem(userId, itemId) : Response[200]
  + deleteItem(userId, itemId) : Response[200]
  + updateTags(userId, itemId) : Response[200]

WardrobeService
  + saveImage(file, uploadFolder) : String
  + createItemFromPhoto(userId, formData, imagePath) : WardrobeItem
  + createItemFromLink(userId, data) : WardrobeItem

WardrobeItem
  (all fields as in Diagram 4)

SQLAlchemy (db.session)
  + add(item)
  + commit()
  + delete(item)
```

Relationships:
- PhotoUpload calls WardrobeController (POST /wardrobe/items/photo)
- WardrobeController calls WardrobeService
- WardrobeService creates WardrobeItem
- WardrobeService calls FileStorage to save image
- WardrobeItem persisted via SQLAlchemy

**DIAGRAM 6c: Behavioural Overview — Manage Wardrobe Items (Add by Photo)**
- Type: Sequence Diagram
- Participants (left to right): `:User`, `:PhotoUpload`, `:APIClient`, `:WardrobeController`, `:WardrobeService`, `:FileStorage`, `:SQLAlchemy`

```
User → PhotoUpload: fills form (name, category, color, brand, image[optional])
User → PhotoUpload: clicks "Add Item"
PhotoUpload → PhotoUpload: validates (name + category required)
PhotoUpload → APIClient: POST /wardrobe/items/photo (FormData)
APIClient → WardrobeController: HTTP POST with Bearer token
WardrobeController → WardrobeController: jwt_required() — extract user_id
WardrobeController → WardrobeController: validate name + category present
alt image provided
    WardrobeController → WardrobeService: saveImage(file, UPLOAD_FOLDER)
    WardrobeService → FileStorage: write file to uploads/
    FileStorage → WardrobeService: returns filename
    WardrobeService → WardrobeController: returns image_path
end
WardrobeController → WardrobeService: createItemFromPhoto(userId, formData, imagePath)
WardrobeService → SQLAlchemy: db.session.add(WardrobeItem)
WardrobeService → SQLAlchemy: db.session.commit()
SQLAlchemy → WardrobeService: returns persisted item
WardrobeService → WardrobeController: returns WardrobeItem
WardrobeController → APIClient: 201 { item: WardrobeItemDTO }
APIClient → PhotoUpload: success
PhotoUpload → User: shows updated wardrobe with new item
```

---

#### UC-M3: Request Outfit by Occasion

**DIAGRAM 7a: Collaboration Overview — Request Outfit by Occasion**
- Center: `«use case» Request Outfit by Occasion`
- Subsystems: Presentation Layer, Application Logic Layer, Domain Layer, Infrastructure Layer

**DIAGRAM 7b: Structural Overview — Request Outfit by Occasion**
```
OutfitsPage (React)
  - occasionMode: String
  - result: OutfitDTO
  + handleOccasionSubmit(occasion) : void

OutfitController
  + recommendByOccasion(userId, occasion) : Response

OutfitService
  + recommendByOccasion(userId, occasion) : List<WardrobeItem>
  + buildOutfitFromItems(items) : OutfitDict

WardrobeItem
  + occasion_tags_list : List<String>

SQLAlchemy
  + WardrobeItem.query.filter_by(user_id)
```

**DIAGRAM 7c: Behavioural Overview — Request Outfit by Occasion**
```
User → OutfitsPage: selects "By Occasion" mode
User → OutfitsPage: selects occasion (Work/Casual/Formal/Athletic/Evening)
User → OutfitsPage: clicks "Get Outfit"
OutfitsPage → APIClient: POST /outfits/by-occasion { occasion }
APIClient → OutfitController: HTTP POST with Bearer token
OutfitController → OutfitController: extract user_id from JWT
OutfitController → OutfitService: recommendByOccasion(userId, occasion)
OutfitService → SQLAlchemy: WardrobeItem.query.filter_by(user_id=userId).all()
SQLAlchemy → OutfitService: returns all user items
OutfitService → OutfitService: filter items where occasion in occasion_tags_list
alt no matching items
    OutfitService → OutfitService: random.sample(items, min(3, len))
end
OutfitService → OutfitService: buildOutfitFromItems(matched)
  note: assigns items to slots: top, bottom, shoes, outerwear, accessories
OutfitService → OutfitController: returns OutfitDict
OutfitController → APIClient: 200 { outfit: OutfitDTO }
APIClient → OutfitsPage: outfit result
OutfitsPage → OutfitResult: renders structured outfit by slot
OutfitResult → User: displays Top/Bottom/Shoes/Outerwear with item cards
```

---

#### UC-M4: View Multiple Outfit Options

**DIAGRAM 8c: Behavioural Overview — View Multiple Outfit Options**
```
User → OutfitsPage: selects "Multiple Outfit Options" mode
User → OutfitsPage: selects occasion (optional), count defaults to 3
OutfitsPage → APIClient: POST /outfits/multiple { occasion, count: 3 }
APIClient → OutfitController: HTTP POST
OutfitController → OutfitService: recommendMultiple(userId, occasion, 3)
OutfitService → SQLAlchemy: fetch all user items
loop up to count * 10 attempts, until 3 unique outfits
    OutfitService → OutfitService: random.sample(items, min(5, len))
    OutfitService → OutfitService: buildOutfitFromItems(sample)
    OutfitService → OutfitService: frozenset(item ids) — check for duplicate
    alt not a duplicate
        OutfitService → OutfitService: append to outfits list
    end
end
OutfitService → OutfitController: returns List[OutfitDict] (max 3)
OutfitController → APIClient: 200 { outfits: [...] }
OutfitsPage → User: renders each outfit option with item cards
```

---

### DIAGRAM 9–11: Interaction Model — Hadi's Use Cases

#### UC-H2: Manage User Accounts

**DIAGRAM 9b: Structural Overview — Manage User Accounts**
```
AdminPage (React)
  - users: List<UserDTO>
  - activeTab: "users"
  + handleDeactivate(userId) : void
  + handleActivate(userId) : void
  + handleDelete(userId) : void

AdminAPIClient (frontend/src/api/admin.js)
  + listUsers() : List<UserDTO>
  + deactivateUser(userId) : void
  + activateUser(userId) : void
  + deleteUser(userId) : void

AdminController (Flask /admin)
  + listUsers() : Response
  + updateUser(userId, data) : Response
  + deleteUser(userId) : Response
  - _requireAdmin(userId) : void
  - logAction(userId, action, resource, resourceId) : void

User (model)
  - is_active : Boolean
  + toDict() : dict

ActivityLog (model)
  - action : String
  - user_id : int
  - created_at : DateTime

SQLAlchemy
  + db.session.commit()
```

**DIAGRAM 9c: Behavioural Overview — Manage User Accounts (Disable)**
```
Admin → AdminPage: opens Users tab
AdminPage → AdminAPIClient: GET /admin/users
AdminAPIClient → AdminController: HTTP GET + Bearer token
AdminController → AdminController: _requireAdmin(userId) — checks is_admin flag
AdminController → SQLAlchemy: User.query.all()
SQLAlchemy → AdminController: returns user list
AdminController → AdminAPIClient: 200 [UserDTO list]
AdminPage → Admin: renders user table

Admin → AdminPage: clicks "Deactivate" for target user
AdminPage → AdminAPIClient: PUT /admin/users/<id> { is_active: false }
AdminAPIClient → AdminController: HTTP PUT + Bearer token
AdminController → AdminController: _requireAdmin(userId)
AdminController → SQLAlchemy: find User by id
AdminController → SQLAlchemy: user.is_active = False, db.session.commit()
AdminController → AdminController: logAction(adminId, "deactivate", "user", targetId)
AdminController → SQLAlchemy: db.session.add(ActivityLog), commit()
AdminController → AdminAPIClient: 200 { user: UserDTO }
AdminPage → Admin: updates user row showing "Inactive" status
```

---

#### UC-H4: Select Color Preference

**DIAGRAM 10c: Behavioural Overview — Select Color Preference**
```
User → OutfitsPage: selects "By Color Preference" mode
User → OutfitsPage: types color (e.g., "blue")
User → OutfitsPage: clicks "Get Outfit"
OutfitsPage → APIClient: POST /outfits/by-color { color: "blue" }
APIClient → OutfitController: HTTP POST
OutfitController → OutfitService: recommendByColor(userId, "blue")
OutfitService → SQLAlchemy: WardrobeItem.query.filter_by(user_id).all()
OutfitService → OutfitService: filter where "blue" in item.color.lower()
OutfitService → OutfitService: buildOutfitFromItems(matched)
OutfitController → APIClient: 200 { outfit: OutfitDTO }
OutfitsPage → User: renders outfit filtered to blue items
```

---

#### UC-H5: Specify Must-Use Item

**DIAGRAM 11c: Behavioural Overview — Specify Must-Use Item**
```
User → OutfitsPage: selects "Build Around an Item" mode
OutfitsPage → APIClient: GET /wardrobe/items (loads item list for dropdown)
APIClient → WardrobeController: fetch user's items
WardrobeController → OutfitsPage: returns item list
OutfitsPage → User: renders item selector dropdown

User → OutfitsPage: selects must-use item from dropdown
User → OutfitsPage: clicks "Build Outfit"
OutfitsPage → APIClient: POST /outfits/with-item { item_id }
APIClient → OutfitController: HTTP POST
OutfitController → OutfitService: recommendWithItem(userId, itemId)
OutfitService → SQLAlchemy: find must-use WardrobeItem by id + userId
OutfitService → SQLAlchemy: get all other user items
OutfitService → OutfitService: pick complementary categories based on must-use category
  note: if must-use is top → pick bottoms; if bottom → pick tops
OutfitService → OutfitService: always append a shoe if available (BR-10)
OutfitService → OutfitController: returns (mustUseItem, complements)
OutfitController → APIClient: 200 { must_use_item, outfit }
OutfitsPage → User: renders outfit with must-use item highlighted
```

---

### DIAGRAM 12–14: Interaction Model — Zain's Use Cases

#### UC-Z2: Request Outfit by Weather

**DIAGRAM 12b: Structural Overview — Request Outfit by Weather**
```
OutfitsPage (React)
  - weatherMode: true
  - temperature: Number
  - condition: String
  - result: OutfitDTO
  + handleWeatherSubmit(temp, condition) : void

OutfitController
  + recommendByWeather(userId, temperature, condition) : Response

OutfitService
  + recommendByWeather(userId, temp, condition) : List<WardrobeItem>
  - _determineWeatherCategory(temp, condition) : String

WardrobeItem
  + weather_tags_list : List<String>
  # values: ["cold", "mild", "warm", "waterproof"]

WeatherMapper (internal)
  Rules:
  - rain/snow in condition → rainy/cold
  - >25°C → hot | 15-25°C → warm | 5-15°C → cool | ≤5°C → cold
```

**DIAGRAM 12c: Behavioural Overview — Request Outfit by Weather**
```
User → OutfitsPage: selects "By Weather" mode
User → OutfitsPage: enters temperature (°C) + condition (sunny/cloudy/rainy/snowy)
User → OutfitsPage: clicks "Get Outfit"
OutfitsPage → APIClient: POST /outfits/by-weather { temperature, condition }
APIClient → OutfitController: HTTP POST + Bearer token
OutfitController → OutfitController: extract userId from JWT
OutfitController → OutfitService: recommendByWeather(userId, temperature, condition)
OutfitService → WeatherMapper: _determineWeatherCategory(temperature, condition)
alt condition contains "rain"
    WeatherMapper → OutfitService: "rainy"
else condition contains "snow"
    WeatherMapper → OutfitService: "cold"
else temperature > 25
    WeatherMapper → OutfitService: "hot"
else temperature > 15
    WeatherMapper → OutfitService: "warm"
else temperature > 5
    WeatherMapper → OutfitService: "cool"
else
    WeatherMapper → OutfitService: "cold"
end
OutfitService → SQLAlchemy: WardrobeItem.query.filter_by(user_id).all()
OutfitService → OutfitService: filter items where weatherCategory in weather_tags_list
alt no matching items
    OutfitService → OutfitService: random.sample fallback
end
OutfitService → OutfitService: buildOutfitFromItems(matched)
OutfitService → OutfitController: OutfitDict
OutfitController → APIClient: 200 { outfit: OutfitDTO }
OutfitsPage → User: renders weather-appropriate outfit
```

---

#### UC-Z4: Include Shoes in Recommendation

**DIAGRAM 13c: Behavioural Overview — Include Shoes in Recommendation**
```
User → OutfitsPage: selects "Complete Look with Shoes" mode
User → OutfitsPage: enters occasion (optional)
User → OutfitsPage: clicks "Get Outfit"
OutfitsPage → APIClient: POST /outfits/with-shoes { occasion }
APIClient → OutfitController: HTTP POST
OutfitController → OutfitService: recommendWithShoes(userId, occasion)
OutfitService → SQLAlchemy: fetch all user items
OutfitService → OutfitService: partition items into shoes vs non-shoes
  shoes: category in {shoes, boot, boots, sneaker, sneakers, heel, heels, loafer, loafers, sandal, sandals}
alt occasion provided
    OutfitService → OutfitService: filter non-shoes by occasion_tags
end
OutfitService → OutfitService: random.sample(non_shoes, min(4, len))
alt shoes list not empty
    OutfitService → OutfitService: append random.choice(shoes) to selection
end
OutfitService → OutfitService: buildOutfitFromItems(selected)
OutfitService → OutfitController: { items, outfit, shoe_included: true/false }
OutfitController → APIClient: 200 response
OutfitsPage → User: renders outfit with shoes slot always shown
```

---

#### UC-Z5: View Outfit in Accessible Format

**DIAGRAM 14b: Structural Overview — View Outfit in Accessible Format**
```
App (React)
  - highContrast: Boolean (persisted in localStorage)
  + toggleHighContrast() : void
  # applies/removes body.high-contrast class

OutfitResult (React Component)
  - outfit: OutfitDTO
  + render() : JSX
  # renders slots: Top, Bottom, Shoes, Outerwear, Accessories
  # each slot shows: item name, brand, image (or placeholder)

global.css
  body.high-contrast:
    --bg: #000000
    --text: #FFFFFF
    --border: #FFFFFF
    --interactive: #00FFFF
    --label: #FFFF00
  Standard mode:
    --bg: #FFFFFF
    --text: #000000
    --border: #CCCCCC
    --interactive: #0066CC
    --label: #666666

HCToggleButton (in App.jsx)
  # fixed-position button in bottom-right corner
  # label: "High Contrast"
  # toggles body.high-contrast on/off
  # state persisted in localStorage key "hc"
```

**DIAGRAM 14c: Behavioural Overview — View Outfit in Accessible Format**
```
User → HCToggleButton: clicks "High Contrast"
App → App: toggleHighContrast()
App → localStorage: set "hc" = "true"
App → document.body: classList.add("high-contrast")
document.body → OutfitResult: CSS variables re-apply
  background becomes #000000
  text becomes #FFFFFF
  labels become #FFFF00
  interactive becomes #00FFFF
OutfitResult → User: re-renders with high-contrast palette
note: outfit content unchanged — only visual presentation affected

OutfitsPage → OutfitResult: passes outfit { top, bottom, shoes, outerwear, accessories }
OutfitResult → User: renders structured display
  row: "Top:" + item.name + item.brand + item image or "No Image" placeholder
  row: "Bottom:" + item.name ...
  row: "Shoes:" + item.name ...   ← always present if shoes in outfit
  row: "Outerwear:" + item.name ... (if present)
  row: "Accessories:" + item.name ... (if present)
```

---

### DIAGRAM 15: Deployment Diagram

**Name**: `Deployment Model`
**Type**: Deployment Diagram
**Location**: Deployment Model package (root level)

```
┌──────────────────────────────────────────────────┐
│  «device»                                        │
│  Developer Workstation (Windows 11)              │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  «execution environment»                   │  │
│  │  Node.js Runtime (v18+)                    │  │
│  │                                            │  │
│  │  ┌──────────────────────────────────────┐  │  │
│  │  │  «artifact»                          │  │  │
│  │  │  React SPA (npm start / CRA DevServer│  │  │
│  │  │  Port: 3000                          │  │  │
│  │  │  Source: frontend/src/               │  │  │
│  │  └──────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  «execution environment»                   │  │
│  │  Python 3.10+ / venv                       │  │
│  │                                            │  │
│  │  ┌──────────────────────────────────────┐  │  │
│  │  │  «artifact»                          │  │  │
│  │  │  Flask REST API (Werkzeug dev server)│  │  │
│  │  │  Port: 5000                          │  │  │
│  │  │  Source: backend/app/               │  │  │
│  │  │  Entry: backend/run.py              │  │  │
│  │  └──────────────────────────────────────┘  │  │
│  │                                            │  │
│  │  ┌──────────────────────────────────────┐  │  │
│  │  │  «artifact»                          │  │  │
│  │  │  SQLite Database                     │  │  │
│  │  │  File: backend/instance/closetiq.db  │  │  │
│  │  │  Tables: users, wardrobe_items,      │  │  │
│  │  │          outfits, activity_logs      │  │  │
│  │  └──────────────────────────────────────┘  │  │
│  │                                            │  │
│  │  ┌──────────────────────────────────────┐  │  │
│  │  │  «artifact»                          │  │  │
│  │  │  File Storage                        │  │  │
│  │  │  Path: backend/uploads/             │  │  │
│  │  │  Contains: user-uploaded .jpg/.png  │  │  │
│  │  └──────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

**Communication paths** (draw as lines with labels):
- React SPA → Flask API: `HTTP/REST :5000` (JSON + multipart/form-data)
- Flask API → SQLite: `SQLAlchemy ORM` (local file I/O)
- Flask API → File Storage: `OS file I/O` (local disk read/write)
- Browser → Flask API: `HTTP GET :5000/wardrobe/uploads/<file>` (image serving)
- User Browser → React SPA: `HTTP :3000` (page load + hot reload)

**Note to include in diagram description**:
> This deployment model describes the development/prototype configuration. All components run on a single developer workstation. In a production deployment, the React SPA would be served as static files from a CDN or web server, the Flask API would run on a cloud VM or container, and SQLite would be replaced with PostgreSQL. File storage would migrate to a cloud object store (e.g., AWS S3 or Firebase Storage).

---

## Jira Task Reference

**JIRA**: https://hadiiikhan.atlassian.net — Project: PMP — READ ONLY.

All tasks listed below. Completed ones have code in the repo. VP diagram tasks are still needed.

| Ticket | Description | Assignee | Status |
|--------|-------------|----------|--------|
| PM-1 | Project setup, repo init | Zain | Done |
| PM-2 | Upload clothing via photo | Mustafa | Done |
| PM-3 | Auth (register/login) | Zain | Done |
| PM-4 | Wardrobe item model | Mustafa | Done |
| PM-5 | JWT middleware | Zain | Done |
| PM-6 | Add clothing via link/SKU | Mustafa | Done |
| PM-7 | Tag clothing items | Mustafa | Done |
| PM-8 | Request outfit by occasion | Mustafa | Done |
| PM-9 | Request outfit by weather | Zain | Done |
| PM-10 | Outfit result display | Zain | Done |
| PM-11 | Outfit by dress code | Zain | Done |
| PM-12 | Include shoes in outfit | Zain | Done |
| PM-13 | Multiple outfit options | Hadi | Done |
| PM-14 | Color preference filter | Hadi | Done |
| PM-15 | Manage user accounts (admin) | Hadi | Done |
| PM-16 | Monitor system activity | Hadi | Done |
| PM-17 | Structured DB implementation | Hadi | Done (docs/database-schema.md) |
| PM-18 | Readable text layout | Zain | Done |
| PM-19 | High-contrast mode | Zain | Done |
| PM-20 | Structured outfit presentation | Zain | Done |
| PM-21 | Must-use item in outfit | Hadi | Done |
| PM-22–24 | DB schema docs | Hadi | Done |
| PM-29–42 | Sprint planning, reviews, presentations, backlog docs | Mixed | Done (docs/) |
| PM-44–50 | Research docs, prototype | Mixed | Done |

---

## Files to Know

| File | What It Does |
|------|-------------|
| `backend/app/services/outfit_service.py` | All recommendation logic |
| `backend/app/routes/outfits.py` | REST endpoints for all outfit recommendation modes |
| `backend/app/routes/wardrobe.py` | CRUD + photo upload + image serving |
| `backend/app/routes/auth.py` | Register + login (accepts username or email) |
| `backend/app/routes/admin.py` | Admin endpoints (user mgmt, activity log, stats) |
| `backend/app/models/wardrobe_item.py` | WardrobeItem model with JSON tag helpers |
| `frontend/src/AuthContext.jsx` | Auth state, token stored in localStorage |
| `frontend/src/pages/OutfitsPage.jsx` | All 7 outfit recommendation modes |
| `frontend/src/components/outfits/OutfitResult.jsx` | Outfit slot display component |
| `frontend/src/styles/global.css` | CSS variables + high-contrast overrides |
| `docs/` | Sprint planning, code review, backlog, presentation, research notes |
| `backend/prototype/recommendation_prototype.py` | Standalone rule engine demo |
