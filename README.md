# ITAM System

A comprehensive IT Asset Management system built with Django (backend) and React (frontend).

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- MySQL (optional, defaults to SQLite)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ITAM_System
```

### 2. Backend Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

4. Create a superuser (optional, for admin access):
   ```bash
   python manage.py createsuperuser
   ```

5. Set up initial roles (if needed):
   ```bash
   python manage.py setup_roles
   ```

6. Run the Django server:
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd itam_frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`.

## Database

The project uses SQLite by default (db.sqlite3 is ignored in .gitignore). On a fresh setup, running migrations will create the database automatically.

If you prefer MySQL, update the DATABASES setting in `itam_backend/settings.py` and ensure mysqlclient is installed.

## Environment Variables

Create a `.env` file in the root directory if needed for sensitive settings (currently not required for basic setup).

## Features

- User management with roles
- Asset tracking and management
- Master data management (regions, departments, etc.)
- Audit logging
- REST API with JWT authentication

## Development

- Backend API docs: `http://localhost:8000/api/`
- Admin panel: `http://localhost:8000/admin/`

## Troubleshooting

- Ensure all prerequisites are installed
- Activate virtual environment before running backend commands
- Check that ports 8000 and 3000 are available
- If migrations fail, ensure database permissions are correct