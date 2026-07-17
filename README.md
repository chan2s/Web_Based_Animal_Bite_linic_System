# Animal Bite Clinic System 🏥

A web-based healthcare management system for animal bite clinics — built with **React (Vite)** + **Django REST Framework** + **Channels (WebSocket)**.

## Architecture

```
project/
├── backend/            # Django REST API + WebSocket server
│   ├── manage.py
│   ├── requirements.txt
│   └── Web_Based_Animal_Bite_linic_System/   # Django project settings
├── frontend/           # React (Vite) SPA
│   └── Web_Based_Animal_Bite_linic_System/
│       ├── src/
│       └── vite.config.js
├── .vscode/            # VS Code debug & task configs
└── README.md
```

## Quick Start

### Prerequisites

- Python **3.11+**
- Node.js **20+**
- npm **10+**

### 1. Clone & Enter the Project

```bash
git clone <repo-url>
cd Web_Based_Animal_Bite_linic_System
```

### 2. Backend Setup

```bash
# Create virtual environment
cd backend
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# macOS / Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment — copy the example file
# Windows:
copy .env.example .env
# macOS / Linux:
# cp .env.example .env
# Edit .env and set SECRET_KEY to a random value
```

**`.env` — Required:**
```ini
SECRET_KEY=django-insecure-<generate-a-random-key>
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

> ⚠️ **Windows users**: If your hostname contains non-ASCII characters (e.g. "Cristian"), add it to `ALLOWED_HOSTS` or set `ALLOWED_HOSTS=*` in `.env`.

```bash
# Run database migrations
python manage.py migrate

# Create a superuser (admin panel)
python manage.py createsuperuser

# Start the server
python manage.py runserver 0.0.0.0:8000
```

Django is now running at **http://localhost:8000**

### 3. Frontend Setup

Open a **second terminal**:

```bash
cd frontend/Web_Based_Animal_Bite_linic_System
npm install
npm run dev
```

React is now running at **http://localhost:5173**

> The Vite dev server proxies `/api` and `/ws` requests to Django (`localhost:8000`), so no CORS issues in development.

## Default URLs

| Service  | URL                          | Description          |
|----------|------------------------------|----------------------|
| React    | http://localhost:5173         | Frontend SPA         |
| Django   | http://localhost:8000         | Backend API          |
| Admin    | http://localhost:8000/admin/  | Django Admin Panel   |

## VS Code Development

Open the **root** folder in VS Code:

```
File → Open Folder → Web_Based_Animal_Bite_linic_System
```

### Tasks

Run `Ctrl+Shift+B` / `Cmd+Shift+B` to see:

| Task                          | Description                       |
|-------------------------------|-----------------------------------|
| `Start Django Backend`         | Starts Django on `:8000`          |
| `Start React Dev Server`       | Starts Vite on `:5173`            |
| `Start Full Stack (Django + React)` | Starts both in parallel      |
| `Django Migrate`               | Runs `python manage.py migrate`   |
| `Django Create Superuser`      | Creates admin account             |

### Debugging

Open the **Run and Debug** panel (`Ctrl+Shift+D` / `Cmd+Shift+D`):

| Configuration                    | Description                          |
|----------------------------------|--------------------------------------|
| `Django Backend`                 | Debug Django with breakpoints        |
| `React Frontend`                 | Launch Edge and attach to Vite       |
| `Full Stack (Django + React)`    | Runs both together (compound)        |
| `Django Shell`                   | Interactive Django shell             |
| `Django Migrate`                 | Run migrations with debugger         |

### Port Forwarding (VS Code Tunnel / Codespaces)

Ports `5173` (React) and `8000` (Django) are auto-labeled in VS Code.
When using Remote — Tunnels, Dev Containers, or GitHub Codespaces:

1. Open the **PORTS** tab (bottom panel)
2. Ensure ports `5173` and `8000` are forwarded
3. Click the globe icon to make them public if needed

## Troubleshooting

### CORS Errors in Browser

The Vite proxy (`vite.config.js`) routes `/api/*` and `/ws` directly to Django. This means **no CORS headers are needed** in development. If you see CORS errors:

1. Confirm Vite is running on port **5173**
2. Confirm Django is running on port **8000**
3. Check that the proxy config in `vite.config.js` is correct
4. If accessing via a forwarded/remote URL (not `localhost`), the Vite proxy handles it — you may need to add the forwarded host to Django's `ALLOWED_HOSTS` in `.env`

### Host Header Errors (Django)

If Django shows `Invalid HTTP_HOST header`:

- Add the hostname to `ALLOWED_HOSTS` in `.env`:
  ```
  ALLOWED_HOSTS=localhost,127.0.0.1,your-hostname
  ```
- Or use a wildcard for development:
  ```
  ALLOWED_HOSTS=*
  ```

### WebSocket Not Connecting

1. Ensure Daphne/Channels is running (Django `runserver` works with `daphne` in `INSTALLED_APPS`)
2. Check that `ASGI_APPLICATION` is set in `settings.py`
3. Verify the WebSocket URL matches: `ws://localhost:8000/ws/chat/?token=...`
4. If using a remote/forwarded URL, ensure the Vite proxy's `ws: true` is present

### Database Errors

The project defaults to **SQLite** (zero config). To use PostgreSQL:

1. Install `psycopg-binary` (uncomment in `requirements.txt`)
2. Set env vars in `.env`:
   ```ini
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=animal_bite_clinic
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_HOST=localhost
   DB_PORT=5432
   ```

### Port Already in Use

```bash
# Find what's using port 8000 (Windows)
netstat -ano | findstr :8000
# Kill the process
taskkill /PID <PID> /F

# Find what's using port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

## Scripts

### Backend

```bash
# Start server (0.0.0.0 for network access)
python manage.py runserver 0.0.0.0:8000

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic
```

### Frontend

| Script      | Description                   |
|-------------|-------------------------------|
| `npm run dev`    | Start Vite dev server         |
| `npm run build`  | Build for production          |
| `npm run preview`| Preview production build      |
| `npm run lint`   | Run ESLint                    |
