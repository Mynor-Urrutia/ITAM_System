# ITAM System

A comprehensive IT Asset Management system built with Django (backend) and React (frontend). This system provides complete asset tracking, user management, maintenance scheduling, and reporting capabilities for IT infrastructure management.

## 🚀 Quick Start

For experienced developers, here's the condensed setup:

```bash
git clone https://github.com/Mynor-Urrutia/ITAM_System.git
cd ITAM_System

# Backend setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py setup_roles
python manage.py create_superadmin
python manage.py runserver

# Frontend setup (new terminal)
cd itam_frontend
npm install
npm start
```

## 📋 Prerequisites

### System Requirements
- **Python**: 3.8 or higher (Python 3.13 recommended)
- **Node.js**: 16 or higher (Node.js 18+ recommended)
- **npm**: 7 or higher (comes with Node.js)
- **Git**: Latest version
- **MySQL Server**: 8.0 or higher (MariaDB 10.5+ compatible)

### Development Tools
- **Code Editor**: VS Code, PyCharm, or similar
- **Terminal**: Command prompt, PowerShell, or bash
- **Browser**: Chrome, Firefox, or Edge (latest versions)

## 🛠️ Detailed Setup Instructions

### Step 1: Clone and Prepare the Repository

```bash
# Clone the repository
git clone https://github.com/Mynor-Urrutia/ITAM_System.git
cd ITAM_System

# Verify Python version
python --version  # Should be 3.8+

# Verify Node.js version
node --version    # Should be 16+
npm --version     # Should be 7+
```

### Step 2: Database Setup (MySQL)

#### Option A: Using XAMPP (Recommended for Windows)
1. Download and install XAMPP from https://www.apachefriends.org/
2. Start XAMPP Control Panel
3. Start MySQL module
4. Open phpMyAdmin (http://localhost/phpmyadmin)
5. Create a new database named `itam_db`
6. Create a user with the following privileges:
   - Username: `root`
   - Password: `Myn0r0406.` (or your preferred password)
   - Host: `localhost`
   - Grant all privileges on `itam_db`

#### Option B: Using MySQL Workbench
1. Download MySQL Workbench from https://dev.mysql.com/downloads/workbench/
2. Connect to your MySQL server
3. Create a new schema named `itam_db`
4. Create a user account with appropriate permissions

#### Option C: Command Line
```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE itam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'Myn0r0406.';
GRANT ALL PRIVILEGES ON itam_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Backend Configuration

#### Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Verify activation (you should see (venv) in your prompt)
```

#### Install Dependencies
```bash
# Install Python packages
pip install -r requirements.txt

# Verify installation
pip list | grep -E "(Django|djangorestframework|mysqlclient)"
```

#### Database Configuration
The database is pre-configured in `itam_backend/settings.py`. If you need to modify the database settings:

```python
# itam_backend/settings.py - DATABASES section
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'itam_db',           # Database name
        'USER': 'root',              # Database user
        'PASSWORD': 'Myn0r0406.',    # Database password
        'HOST': '127.0.0.1',         # Database host
        'PORT': '3306',              # Database port
    }
}
```

#### Apply Migrations
```bash
# Apply database migrations
python manage.py migrate

# Verify migrations applied
python manage.py showmigrations
```

#### Create Superuser and Initial Data
```bash
# Create superuser (interactive)
python manage.py createsuperuser

# Setup roles and permissions
python manage.py setup_roles

# Create initial superadmin user (alternative)
python manage.py create_superadmin
```

### Step 4: Frontend Configuration

```bash
# Navigate to frontend directory
cd itam_frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 5: Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the project root (optional but recommended for production):

```bash
# .env file
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=mysql://root:Myn0r0406.@127.0.0.1:3306/itam_db
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### Frontend Environment Variables
Create a `.env` file in `itam_frontend/` directory:

```bash
# itam_frontend/.env
REACT_APP_API_BASE_URL=http://localhost:8000/api
GENERATE_SOURCEMAP=false
```

### Step 6: Running the Application

#### Development Mode (Recommended)
```bash
# Terminal 1: Backend
cd ITAM_System
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver

# Terminal 2: Frontend
cd ITAM_System/itam_frontend
npm start
```

#### Production Mode (Optional)
```bash
# Backend
python manage.py collectstatic --noinput
python manage.py runserver 0.0.0.0:8000

# Frontend
cd itam_frontend
npm run build
npx serve -s build -l 3000
```

## 🏗️ Project Structure

```
ITAM_System/
├── itam_backend/              # Django backend
│   ├── settings.py           # Django settings
│   ├── urls.py              # URL configuration
│   └── wsgi.py              # WSGI application
├── itam_frontend/            # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── api.js          # API configuration
│   └── package.json         # Node dependencies
├── assets/                   # Asset management app
├── employees/               # Employee management app
├── masterdata/              # Master data management app
├── users/                   # User management app
├── manage.py                # Django management script
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🔧 Available Management Commands

```bash
# Database operations
python manage.py makemigrations    # Create migrations
python manage.py migrate          # Apply migrations
python manage.py showmigrations   # Show migration status

# User management
python manage.py createsuperuser  # Create admin user
python manage.py create_superadmin # Create predefined superadmin
python manage.py setup_roles      # Initialize user roles

# Asset management
python manage.py update_activo_assignments  # Update asset assignments
python manage.py update_activo_maintenance  # Update maintenance schedules

# Development
python manage.py shell            # Django shell
python manage.py dbshell          # Database shell
```

## 🌐 Access Points

Once running, access the application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/api/ (DRF browsable API)

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check MySQL service status
# Windows: services.msc → MySQL
# Linux: sudo systemctl status mysql

# Test database connection
python manage.py dbshell
```

#### 2. Port Conflicts
```bash
# Check what's using ports 8000 and 3000
# Windows:
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Linux/Mac:
lsof -i :8000
lsof -i :3000
```

#### 3. Permission Errors
```bash
# Fix file permissions
chmod +x manage.py
chmod -R 755 .

# On Windows, run terminal as Administrator
```

#### 4. Node.js/npm Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 5. Python Virtual Environment Issues
```bash
# Recreate virtual environment
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Error Messages and Solutions

#### "mysqlclient not found"
```bash
# Install MySQL development headers
# Ubuntu/Debian:
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential

# macOS:
brew install mysql

# Windows:
pip install mysqlclient
```

#### "Port already in use"
```bash
# Kill process using port
# Linux/Mac:
sudo lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

#### "Module not found" errors
```bash
# Reinstall requirements
pip uninstall -r requirements.txt -y
pip install -r requirements.txt

# For frontend
cd itam_frontend
rm -rf node_modules
npm install
```

## 🚀 Deployment Checklist

- [ ] Repository cloned
- [ ] Python virtual environment created and activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] MySQL database created and configured
- [ ] Migrations applied (`python manage.py migrate`)
- [ ] Superuser created (`python manage.py createsuperuser`)
- [ ] Roles initialized (`python manage.py setup_roles`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend server running (`python manage.py runserver`)
- [ ] Frontend server running (`npm start`)
- [ ] Application accessible at http://localhost:3000

## 📞 Support

For technical support, contact:
- **Email**: soporte@naturaceites.com
- **Phone**: +502 2328-5200
- **Department**: Área de Soporte

## 📝 Development Notes

- The system uses JWT authentication for API security
- CORS is configured for frontend-backend communication
- Database uses UTF-8 encoding for international characters
- Static files are served by Django in development
- The frontend uses React Router for navigation

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update dependencies
pip install -r requirements.txt
cd itam_frontend && npm install

# Apply new migrations
python manage.py migrate

# Restart servers
```

## 📊 Features Overview

- **User Management**: Role-based access control with JWT authentication
- **Asset Management**: Complete lifecycle tracking of IT assets
- **Maintenance Scheduling**: Automated maintenance reminders and tracking
- **Master Data**: Centralized management of regions, departments, brands, etc.
- **Audit Logging**: Complete audit trail of all system activities
- **Reporting**: Comprehensive reports and analytics
- **REST API**: Full REST API with OpenAPI documentation

---

**ITAM System v1.0.0** - Developed by Mynor Urrutia