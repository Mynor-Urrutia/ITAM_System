# Sistema ITAM - Guía de Instalación y Despliegue

Un sistema completo de Gestión de Activos de TI construido con Django (backend) y React (frontend). Esta guía está diseñada para personas sin conocimientos técnicos avanzados.

## 🚀 Instalación Rápida (Entorno de Desarrollo)

### Paso 1: Instalar Requisitos Previos

#### Para Windows:
1. **Python 3.8+**: Descarga desde https://www.python.org/downloads/
2. **Node.js 16+**: Descarga desde https://nodejs.org/
3. **MySQL Server**: Instala XAMPP desde https://www.apachefriends.org/

#### Para Linux/Ubuntu:
```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Python y pip
sudo apt install python3 python3-pip python3-venv -y

# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar MySQL
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Paso 2: Configurar Base de Datos MySQL

#### Opción A: Usando XAMPP (Windows)
1. Abre el Panel de Control de XAMPP
2. Inicia el módulo MySQL
3. Abre phpMyAdmin (http://localhost/phpmyadmin)
4. Crea una nueva base de datos llamada `itam_db`

#### Opción B: Usando Terminal
```bash
# Iniciar sesión en MySQL
mysql -u root -p

# Dentro de MySQL, ejecutar:
CREATE DATABASE itam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'itam_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON itam_db.* TO 'itam_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Paso 3: Instalar y Ejecutar el Sistema

#### Opción A: Usando Script Automático (Recomendado)
```bash
# Clonar el repositorio
git clone https://github.com/Mynor-Urrutia/ITAM_System.git
cd ITAM_System

# Ejecutar instalación automática
python setup_dev.py
```

#### Opción B: Instalación Manual
```bash
# Clonar el repositorio
git clone https://github.com/Mynor-Urrutia/ITAM_System.git
cd ITAM_System

# Configurar backend
cd itam_backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
python manage.py migrate
python manage.py setup_roles
python manage.py create_superadmin

# Configurar frontend
cd ../itam_frontend
npm install --legacy-peer-deps
```

### Paso 4: Ejecutar la Aplicación

#### Opción A: Usando Script de Inicio
```bash
# Desde la raíz del proyecto
python start_dev.py
```

#### Opción B: Inicio Manual
```bash
# Terminal 1: Backend
cd itam_backend
venv\Scripts\activate  # Windows
python manage.py runserver

# Terminal 2: Frontend
cd itam_frontend
npm start
```

### Paso 5: Acceder al Sistema
- **Aplicación principal**: http://localhost:3000
- **Panel de administración**: http://localhost:8000/admin/
- **Usuario administrador**: admin / admin123 (cambiar después del primer inicio)

## 🏭 Despliegue en Producción

### Opción A: Despliegue Automático (Servidor Linux)

#### Paso 1: Preparar el Servidor
```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar requisitos
sudo apt install python3 python3-pip python3-venv nodejs npm mysql-server nginx -y

# Instalar PM2 para gestión de procesos
sudo npm install -g pm2
```

#### Paso 2: Configurar Base de Datos
```bash
# Crear base de datos de producción
sudo mysql -u root -p
CREATE DATABASE itam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'itam_prod'@'localhost' IDENTIFIED BY 'tu_password_muy_segura';
GRANT ALL PRIVILEGES ON itam_db.* TO 'itam_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Paso 3: Desplegar la Aplicación
```bash
# Clonar el repositorio
git clone https://github.com/Mynor-Urrutia/ITAM_System.git
cd ITAM_System

# Ejecutar despliegue automático
sudo python3 deploy_prod.py
```

### Opción B: Despliegue Manual en Producción

#### Configurar Backend
```bash
cd itam_backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Crear archivo .env para producción
cat > .env << EOF
SECRET_KEY=tu_clave_secreta_muy_segura_aqui
DEBUG=False
DB_NAME=itam_db
DB_USER=itam_prod
DB_PASSWORD=tu_password_muy_segura
DB_HOST=localhost
DB_PORT=3306
EOF

python manage.py migrate
python manage.py collectstatic --noinput
python manage.py setup_roles
python manage.py create_superadmin
```

#### Configurar Frontend
```bash
cd ../itam_frontend
npm install --legacy-peer-deps
npm run build
```

#### Configurar Nginx
```bash
# Crear configuración de Nginx
sudo cat > /etc/nginx/sites-available/itam_system << EOF
server {
    listen 80;
    server_name tu_dominio_o_ip;

    # Servir archivos estáticos
    location /static/ {
        alias /var/www/ITAM_System/itam_backend/staticfiles/;
    }

    # Servir archivos media
    location /media/ {
        alias /var/www/ITAM_System/media/;
    }

    # Proxy para el backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Servir el frontend React
    location / {
        root /var/www/ITAM_System/itam_frontend/build;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/itam_system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Iniciar Servicios
```bash
# Iniciar backend con Gunicorn
cd /var/www/ITAM_System/itam_backend
source venv/bin/activate
gunicorn --bind 127.0.0.1:8000 itam_backend.wsgi:application --daemon

# Verificar que todo funciona
curl http://localhost/api/
curl http://tu_dominio_o_ip
```

## 🔧 Solución de Problemas Comunes

### Error: "mysqlclient not found"
```bash
# Windows
pip install mysqlclient

# Linux
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential
pip install mysqlclient
```

### Error: "Port already in use"
```bash
# Verificar qué usa el puerto
netstat -ano | findstr :3000  # Windows
lsof -i :3000  # Linux

# Matar el proceso
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # Linux
```

### Error: "Module not found"
```bash
# Limpiar y reinstalar dependencias
cd itam_frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

cd ../itam_backend
rm -rf venv
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Base de Datos no Conecta
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql  # Linux
# En Windows: Panel de Control XAMPP

# Verificar credenciales en .env
cat .env
```

## 📞 Soporte

Para soporte técnico:
- **Correo**: soporte@naturaceites.com
- **Teléfono**: +502 2328-5200
- **Desarrollador**: Mynor Urrutia

## 📋 Lista de Verificación de Instalación

- [ ] Requisitos previos instalados (Python, Node.js, MySQL)
- [ ] Base de datos creada y configurada
- [ ] Repositorio clonado
- [ ] Dependencias instaladas
- [ ] Migraciones aplicadas
- [ ] Usuario administrador creado
- [ ] Aplicación ejecutándose en http://localhost:3000
- [ ] Panel de administración accesible

---

**Sistema ITAM v1.0.0** - Desarrollado por Mynor Urrutia

```
ITAM_System
├─ deploy_prod.py
├─ itam_backend
│  ├─ apps
│  │  ├─ assets
│  │  │  ├─ admin.py
│  │  │  ├─ apps.py
│  │  │  ├─ management
│  │  │  │  └─ commands
│  │  │  │     ├─ update_activo_assignments.py
│  │  │  │     └─ update_activo_maintenance.py
│  │  │  ├─ migrations
│  │  │  │  ├─ 0001_initial.py
│  │  │  │  ├─ 0002_activo_cuenta_contable_activo_cuotas_and_more.py
│  │  │  │  ├─ 0003_activo_costo_activo_moneda.py
│  │  │  │  ├─ 0004_alter_activo_correo_electronico_and_more.py
│  │  │  │  ├─ 0005_activo_estado_activo_fecha_baja.py
│  │  │  │  ├─ 0006_activo_motivo_baja_activo_usuario_baja.py
│  │  │  │  ├─ 0007_add_missing_fields.py
│  │  │  │  ├─ 0008_activo_documentos_baja.py
│  │  │  │  ├─ 0009_activo_proximo_mantenimiento_and_more.py
│  │  │  │  ├─ 0010_alter_maintenance_options_and_more.py
│  │  │  │  ├─ 0011_alter_maintenance_options_assignment.py
│  │  │  │  ├─ 0012_activo_administrable_activo_alimentacion_and_more.py
│  │  │  │  ├─ 0013_alter_activo_administrable_alter_activo_ethernet_and_more.py
│  │  │  │  ├─ 0014_set_boolean_fields_to_null.py
│  │  │  │  ├─ 0015_activo_assigned_to.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ models.py
│  │  │  ├─ serializers.py
│  │  │  ├─ tests.py
│  │  │  ├─ urls.py
│  │  │  ├─ views.py
│  │  │  └─ __init__.py
│  │  ├─ employees
│  │  │  ├─ admin.py
│  │  │  ├─ apps.py
│  │  │  ├─ migrations
│  │  │  │  ├─ 0001_initial.py
│  │  │  │  ├─ 0002_employee_document.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ models.py
│  │  │  ├─ serializers.py
│  │  │  ├─ tests.py
│  │  │  ├─ urls.py
│  │  │  ├─ views.py
│  │  │  └─ __init__.py
│  │  ├─ masterdata
│  │  │  ├─ admin.py
│  │  │  ├─ apps.py
│  │  │  ├─ migrations
│  │  │  │  ├─ 0001_initial.py
│  │  │  │  ├─ 0001_initial_squashed_0009_auditlog_new_data_auditlog_old_data.py
│  │  │  │  ├─ 0002_tipoactivo.py
│  │  │  │  ├─ 0003_marca.py
│  │  │  │  ├─ 0004_alter_marca_options_alter_marca_name.py
│  │  │  │  ├─ 0005_modelo_especificacionescomputo_and_more.py
│  │  │  │  ├─ 0006_remove_especificacionesred_modelo_and_more.py
│  │  │  │  ├─ 0007_remove_modelocomputo_marca_and_more.py
│  │  │  │  ├─ 0010_proveedor.py
│  │  │  │  ├─ 0011_activo.py
│  │  │  │  ├─ 0012_delete_activo.py
│  │  │  │  ├─ 0013_create_auditlog.py
│  │  │  │  ├─ 0014_alter_modeloactivo_alimentacion_and_more.py
│  │  │  │  ├─ 0015_alter_auditlog_activity_type.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ models.py
│  │  │  ├─ serializers.py
│  │  │  ├─ signals.py
│  │  │  ├─ tests.py
│  │  │  ├─ urls.py
│  │  │  ├─ views.py
│  │  │  └─ __init__.py
│  │  └─ users
│  │     ├─ admin.py
│  │     ├─ apps.py
│  │     ├─ management
│  │     │  ├─ commands
│  │     │  │  ├─ create_superadmin.py
│  │     │  │  ├─ setup_roles.py
│  │     │  │  └─ __init__.py
│  │     │  └─ __init__.py
│  │     ├─ migrations
│  │     │  ├─ 0001_initial.py
│  │     │  ├─ 0001_initial_squashed_0003_alter_customuser_departamento.py
│  │     │  ├─ 0002_alter_customuser_region.py
│  │     │  ├─ 0003_alter_customuser_departamento.py
│  │     │  ├─ 0004_update_existing_users_is_active.py
│  │     │  ├─ 0005_customuser_employee.py
│  │     │  └─ __init__.py
│  │     ├─ models.py
│  │     ├─ permissions.py
│  │     ├─ serializers.py
│  │     ├─ tests.py
│  │     ├─ urls.py
│  │     ├─ views.py
│  │     └─ __init__.py
│  ├─ asgi.py
│  ├─ manage.py
│  ├─ middleware.py
│  ├─ requirements.txt
│  ├─ settings.py
│  ├─ threadlocals.py
│  ├─ urls.py
│  ├─ wsgi.py
│  └─ __init__.py
├─ itam_frontend
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ README.md
│  ├─ src
│  │  ├─ api.js
│  │  ├─ App.js
│  │  ├─ App.test.js
│  │  ├─ axiosConfig.js
│  │  ├─ components
│  │  │  ├─ 30
│  │  │  ├─ ChangePasswordForm.js
│  │  │  ├─ EmployeeAutocomplete.js
│  │  │  ├─ EmployeeSearchModal.js
│  │  │  ├─ Home.js
│  │  │  ├─ Login.js
│  │  │  ├─ MasterDataAutocomplete.js
│  │  │  ├─ Modal.js
│  │  │  ├─ ModeloActivoForm.js
│  │  │  ├─ Navbar.js
│  │  │  ├─ Pagination.js
│  │  │  ├─ PrivateRoute.js
│  │  │  ├─ RoleManagement.js
│  │  │  ├─ Sidebar.js
│  │  │  ├─ UserCrud.js
│  │  │  ├─ UserDetail.js
│  │  │  └─ UserForm.js
│  │  ├─ config.js
│  │  ├─ context
│  │  │  └─ AuthContext.js
│  │  ├─ hooks
│  │  │  └─ usePageTitle.js
│  │  ├─ index.css
│  │  ├─ index.js
│  │  ├─ pages
│  │  │  ├─ AboutPage.js
│  │  │  ├─ APIDetailModal.js
│  │  │  ├─ APIDocumentationPage.js
│  │  │  ├─ assets
│  │  │  │  ├─ ActivoDetailModal.js
│  │  │  │  ├─ ActivoFormModal.js
│  │  │  │  ├─ ActivosPage.js
│  │  │  │  ├─ AssignmentFormModal.js
│  │  │  │  ├─ AssignmentModal.js
│  │  │  │  ├─ AssignmentPage.js
│  │  │  │  ├─ MaintenanceDetailModal.js
│  │  │  │  ├─ MaintenanceModal.js
│  │  │  │  ├─ MaintenancePage.js
│  │  │  │  └─ RetireActivoModal.js
│  │  │  ├─ ContactPage.js
│  │  │  ├─ employees
│  │  │  │  ├─ EmployeeDetailModal.js
│  │  │  │  ├─ EmployeeFormModal.js
│  │  │  │  └─ EmployeesPage.js
│  │  │  ├─ masterdata
│  │  │  │  ├─ AreaFormModal.js
│  │  │  │  ├─ AreasPage.js
│  │  │  │  ├─ AuditLogsPage.js
│  │  │  │  ├─ DepartmentFormModal.js
│  │  │  │  ├─ DepartmentsPage.js
│  │  │  │  ├─ FarmsPage.js
│  │  │  │  ├─ FincaFormModal.js
│  │  │  │  ├─ MarcaFormModal.js
│  │  │  │  ├─ MarcasPage.js
│  │  │  │  ├─ ModelosActivoPage.js
│  │  │  │  ├─ ProveedoresPage.js
│  │  │  │  ├─ ProveedorFormModal.js
│  │  │  │  ├─ RegionFormModal.js
│  │  │  │  ├─ RegionsPage.js
│  │  │  │  ├─ TipoActivoFormModal.js
│  │  │  │  └─ TiposActivosPage.js
│  │  │  ├─ ReportsPage.js
│  │  │  └─ UserProfile.js
│  │  ├─ reportWebVitals.js
│  │  └─ setupTests.js
│  └─ tailwind.config.js
├─ package-lock.json
├─ README.md
├─ setup_dev.py
└─ start_dev.py

```