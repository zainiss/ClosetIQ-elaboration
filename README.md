# ClosetIQ

AI-powered wardrobe and outfit recommendation app.

## Tech Stack
- **Backend:** Python / Flask
- **Frontend:** React
- **Database:** SQLite (auto-created on first run)

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

---

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

Backend runs at `http://localhost:5000`

---

### Frontend

```bash
cd frontend
```

Create a `.env` file in the `frontend/` folder:
```
REACT_APP_API_URL=http://localhost:5000
```

Then:
```bash
npm install
npm start
```

Frontend runs at `http://localhost:3000`

---

## Notes
- The SQLite database and uploaded images are created automatically — no DB setup needed.
- Run backend and frontend at the same time in separate terminals.
- To create an admin account, manually set `is_admin = 1` in the `users` table via SQLite.
