# Database Schema — ClosetIQ (PM-17, PM-22, PM-23, PM-24)

ClosetIQ uses SQLite in development and can be swapped to PostgreSQL for production via the `DATABASE_URL` environment variable. ORM layer is SQLAlchemy (Flask-SQLAlchemy).

---

## Collections / Tables

### `users`
Stores registered user accounts.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | Auto-increment |
| username | VARCHAR(80) | Unique, required |
| email | VARCHAR(120) | Unique, required |
| password_hash | VARCHAR(255) | Werkzeug bcrypt hash |
| is_admin | BOOLEAN | Default false |
| is_active | BOOLEAN | Default true — deactivated users cannot log in |
| created_at | DATETIME | UTC timestamp |

### `wardrobe_items`
Represents a single clothing or accessory item owned by a user.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| user_id | INTEGER FK → users.id | Cascades delete |
| name | VARCHAR(120) | Required |
| category | VARCHAR(50) | shirt, pants, shoes, jacket, etc. |
| color | VARCHAR(50) | Optional |
| brand | VARCHAR(100) | Optional |
| image_path | VARCHAR(255) | Relative path to uploaded image |
| source_url | VARCHAR(500) | URL if added via link |
| sku | VARCHAR(100) | SKU if added via product code |
| tags | TEXT | JSON array of custom strings |
| occasion_tags | TEXT | JSON array: casual, formal, work, wedding, gym |
| dress_code | VARCHAR(50) | formal / semi-formal / business casual / smart casual / casual |
| weather_tags | TEXT | JSON array: hot, warm, cool, cold, rainy |
| created_at | DATETIME | |
| updated_at | DATETIME | Auto-updated on save |

### `outfits`
A saved outfit — a named collection of wardrobe item IDs.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| user_id | INTEGER FK → users.id | Cascades delete |
| name | VARCHAR(120) | Optional label |
| occasion | VARCHAR(50) | Optional |
| dress_code | VARCHAR(50) | Optional |
| items | TEXT | JSON array of wardrobe_item IDs |
| created_at | DATETIME | |

### `activity_logs`
Audit trail of user actions within the system (PM-16).

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| user_id | INTEGER FK → users.id | Nullable (system events) |
| action | VARCHAR(100) | e.g. "POST /wardrobe/items" |
| resource | VARCHAR(100) | e.g. "wardrobe_item" |
| resource_id | INTEGER | ID of affected resource |
| ip_address | VARCHAR(45) | Supports IPv6 |
| details | TEXT | Optional free-text notes |
| created_at | DATETIME | |

---

## Relationships

```
users ──< wardrobe_items   (one-to-many, cascade delete)
users ──< outfits          (one-to-many, cascade delete)
users ──< activity_logs    (one-to-many)
```

---

## Authentication (PM-23)

Authentication uses JWT tokens issued by Flask-JWT-Extended.

- `POST /auth/register` — creates a user, returns JWT access token
- `POST /auth/login` — validates credentials, returns JWT access token
- All protected endpoints require `Authorization: Bearer <token>` header
- Tokens are stored in memory on the frontend (not localStorage) to reduce XSS risk

---

## Security Rules (PM-24)

- All wardrobe and outfit data is scoped to `user_id = get_jwt_identity()` — users can only read/write their own data
- Admin routes check `user.is_admin` before any operation
- Passwords are hashed with Werkzeug's `generate_password_hash` (PBKDF2+SHA256)
- CORS is configured to only allow the frontend origin in production
- JWT secret is loaded from environment variable (`JWT_SECRET_KEY`) — never hard-coded
