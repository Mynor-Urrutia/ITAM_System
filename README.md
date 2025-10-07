# Sistema ITAM

Un sistema completo de Gestión de Activos de TI construido con Django (backend) y React (frontend). Este sistema proporciona capacidades completas de seguimiento de activos, gestión de usuarios, programación de mantenimiento e informes para la gestión de infraestructura de TI.

## 🚀 Inicio Rápido

Para desarrolladores experimentados, aquí está la configuración condensada:

```bash
git clone https://github.com/Mynor-Urrutia/ITAM_System.git
cd ITAM_System

# Configuración del backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py setup_roles
python manage.py create_superadmin
python manage.py runserver

# Configuración del frontend (nueva terminal)
cd itam_frontend
npm install
npm start
```

## 📋 Prerrequisitos

### Requisitos del Sistema
- **Python**: 3.8 o superior (Python 3.13 recomendado)
- **Node.js**: 16 o superior (Node.js 18+ recomendado)
- **npm**: 7 o superior (viene con Node.js)
- **Git**: Versión más reciente
- **MySQL Server**: 8.0 o superior (MariaDB 10.5+ compatible)

### Herramientas de Desarrollo
- **Editor de Código**: VS Code, PyCharm, o similar
- **Terminal**: Command prompt, PowerShell, o bash
- **Navegador**: Chrome, Firefox, o Edge (versiones más recientes)

## 🛠️ Instrucciones Detalladas de Configuración

### Paso 1: Clonar y Preparar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/Mynor-Urrutia/ITAM_System.git
cd ITAM_System

# Verificar versión de Python
python --version  # Debe ser 3.8+

# Verificar versión de Node.js
node --version    # Debe ser 16+
npm --version     # Debe ser 7+
```

### Paso 2: Configuración de Base de Datos (MySQL)

#### Opción A: Usando XAMPP (Recomendado para Windows)
1. Descargar e instalar XAMPP desde https://www.apachefriends.org/
2. Iniciar Panel de Control de XAMPP
3. Iniciar módulo MySQL
4. Abrir phpMyAdmin (http://localhost/phpmyadmin)
5. Crear una nueva base de datos llamada `itam_db`
6. Crear un usuario con los siguientes privilegios:
   - Usuario: `root`
   - Contraseña: `Your Password` (o su contraseña preferida)
   - Host: `localhost`
   - Otorgar todos los privilegios en `itam_db`

#### Opción B: Usando MySQL Workbench
1. Descargar MySQL Workbench desde https://dev.mysql.com/downloads/workbench/
2. Conectarse a su servidor MySQL
3. Crear un nuevo esquema llamado `itam_db`
4. Crear una cuenta de usuario con permisos apropiados

#### Opción C: Línea de Comandos
```bash
# Iniciar sesión en MySQL
mysql -u root -p

# Crear base de datos y usuario
CREATE DATABASE itam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'Your Password';
GRANT ALL PRIVILEGES ON itam_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Paso 3: Configuración del Backend

#### Crear Entorno Virtual
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows:
venv\Scripts\activate
# En macOS/Linux:
source venv/bin/activate

# Verificar activación (debería ver (venv) en su prompt)
```

#### Instalar Dependencias
```bash
# Instalar paquetes Python
pip install -r requirements.txt

# Verificar instalación
pip list | grep -E "(Django|djangorestframework|mysqlclient)"
```

#### Configuración de Base de Datos
La base de datos está preconfigurada en `itam_backend/settings.py`. Si necesita modificar la configuración de la base de datos:

```python
# itam_backend/settings.py - sección DATABASES
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'itam_db',           # Nombre de la base de datos
        'USER': 'root',              # Usuario de la base de datos
        'PASSWORD': 'Your Password',    # Contraseña de la base de datos
        'HOST': '127.0.0.1',         # Host de la base de datos
        'PORT': '3306',              # Puerto de la base de datos
    }
}
```

#### Aplicar Migraciones
```bash
# Aplicar migraciones de base de datos
python manage.py migrate

# Verificar migraciones aplicadas
python manage.py showmigrations
```

#### Crear Superusuario y Datos Iniciales
```bash
# Crear superusuario (interactivo)
python manage.py createsuperuser

# Configurar roles y permisos
python manage.py setup_roles

# Crear usuario superadmin inicial (alternativa)
python manage.py create_superadmin
```

### Paso 4: Configuración del Frontend

```bash
# Navegar al directorio del frontend
cd itam_frontend

# Instalar dependencias
npm install

# Verificar instalación
npm list --depth=0
```

### Paso 5: Configuración del Entorno

#### Variables de Entorno del Backend
Crear un archivo `.env` en la raíz del proyecto (opcional pero recomendado para producción):

```bash
# Archivo .env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=mysql://root:Your Password@127.0.0.1:3306/itam_db
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### Variables de Entorno del Frontend
Crear un archivo `.env` en el directorio `itam_frontend/`:

```bash
# itam_frontend/.env
REACT_APP_API_BASE_URL=http://localhost:8000/api
GENERATE_SOURCEMAP=false
```

### Paso 6: Ejecutar la Aplicación

#### Modo Desarrollo (Recomendado)
```bash
# Terminal 1: Backend
cd ITAM_System
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver

# Terminal 2: Frontend
cd ITAM_System/itam_frontend
npm start
```

#### Modo Producción (Opcional)
```bash
# Backend
python manage.py collectstatic --noinput
python manage.py runserver 0.0.0.0:8000

# Frontend
cd itam_frontend
npm run build
npx serve -s build -l 3000
```

## 🏗️ Estructura del Proyecto

```
ITAM_System/
├── itam_backend/              # Backend Django
│   ├── settings.py           # Configuraciones Django
│   ├── urls.py              # Configuración de URLs
│   └── wsgi.py              # Aplicación WSGI
├── itam_frontend/            # Frontend React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Componentes de página
│   │   ├── context/        # Contexto React
│   │   └── api.js          # Configuración de API
│   └── package.json         # Dependencias Node
├── assets/                   # Aplicación de gestión de activos
├── employees/               # Aplicación de gestión de empleados
├── masterdata/              # Aplicación de gestión de datos maestros
├── users/                   # Aplicación de gestión de usuarios
├── manage.py                # Script de gestión Django
├── requirements.txt         # Dependencias Python
└── README.md               # Este archivo
```

## 🔧 Comandos de Gestión Disponibles

```bash
# Operaciones de base de datos
python manage.py makemigrations    # Crear migraciones
python manage.py migrate          # Aplicar migraciones
python manage.py showmigrations   # Mostrar estado de migraciones

# Gestión de usuarios
python manage.py createsuperuser  # Crear usuario admin
python manage.py create_superadmin # Crear superadmin predefinido
python manage.py setup_roles      # Inicializar roles de usuario

# Gestión de activos
python manage.py update_activo_assignments  # Actualizar asignaciones de activos
python manage.py update_activo_maintenance  # Actualizar programaciones de mantenimiento

# Desarrollo
python manage.py shell            # Shell Django
python manage.py dbshell          # Shell de base de datos
```

## 🌐 Puntos de Acceso

Una vez ejecutándose, acceder a la aplicación en:

- **Frontend**: http://localhost:3000
- **API del Backend**: http://localhost:8000/api/
- **Panel de Administración**: http://localhost:8000/admin/
- **Documentación de API**: http://localhost:8000/api/ (API navegable DRF)

## 🐛 Solución de Problemas

### Problemas Comunes

#### 1. Errores de Conexión a Base de Datos
```bash
# Verificar estado del servicio MySQL
# Windows: services.msc → MySQL
# Linux: sudo systemctl status mysql

# Probar conexión a base de datos
python manage.py dbshell
```

#### 2. Conflictos de Puertos
```bash
# Verificar qué está usando los puertos 8000 y 3000
# Windows:
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Linux/Mac:
lsof -i :8000
lsof -i :3000
```

#### 3. Errores de Permisos
```bash
# Corregir permisos de archivos
chmod +x manage.py
chmod -R 755 .

# En Windows, ejecutar terminal como Administrador
```

#### 4. Problemas de Node.js/npm
```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

#### 5. Problemas de Entorno Virtual Python
```bash
# Recrear entorno virtual
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Mensajes de Error y Soluciones

#### "mysqlclient not found"
```bash
# Instalar encabezados de desarrollo MySQL
# Ubuntu/Debian:
sudo apt-get install python3-dev default-libmysqlclient-dev build-essential

# macOS:
brew install mysql

# Windows:
pip install mysqlclient
```

#### "Port already in use"
```bash
# Matar proceso usando el puerto
# Linux/Mac:
sudo lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

#### Errores de "Module not found"
```bash
# Reinstalar requirements
pip uninstall -r requirements.txt -y
pip install -r requirements.txt

# Para frontend
cd itam_frontend
rm -rf node_modules
npm install
```

## 🚀 Lista de Verificación de Despliegue

- [ ] Repositorio clonado
- [ ] Entorno virtual Python creado y activado
- [ ] Dependencias instaladas (`pip install -r requirements.txt`)
- [ ] Base de datos MySQL creada y configurada
- [ ] Migraciones aplicadas (`python manage.py migrate`)
- [ ] Superusuario creado (`python manage.py createsuperuser`)
- [ ] Roles inicializados (`python manage.py setup_roles`)
- [ ] Dependencias del frontend instaladas (`npm install`)
- [ ] Servidor backend ejecutándose (`python manage.py runserver`)
- [ ] Servidor frontend ejecutándose (`npm start`)
- [ ] Aplicación accesible en http://localhost:3000

## 📞 Soporte

Para soporte técnico, contactar:
- **Correo**: soporte@naturaceites.com
- **Teléfono**: +502 2328-5200
- **Departamento**: Área de Soporte

## 📝 Notas de Desarrollo

- El sistema utiliza autenticación JWT para seguridad de API
- CORS está configurado para comunicación frontend-backend
- La base de datos utiliza codificación UTF-8 para caracteres internacionales
- Los archivos estáticos son servidos por Django en desarrollo
- El frontend utiliza React Router para navegación

## 🔄 Actualizando la Aplicación

```bash
# Obtener últimos cambios
git pull origin main

# Actualizar dependencias
pip install -r requirements.txt
cd itam_frontend && npm install

# Aplicar nuevas migraciones
python manage.py migrate

# Reiniciar servidores
```

## 📊 Resumen de Características

- **Gestión de Usuarios**: Control de acceso basado en roles con autenticación JWT
- **Gestión de Activos**: Seguimiento completo del ciclo de vida de activos de TI
- **Programación de Mantenimiento**: Recordatorios y seguimiento automatizados de mantenimiento
- **Datos Maestros**: Gestión centralizada de regiones, departamentos, marcas, etc.
- **Registro de Auditoría**: Registro de auditoría completo de todas las actividades del sistema
- **Reportes**: Reportes y análisis completos
- **API REST**: API REST completa con documentación OpenAPI

---

**Sistema ITAM v1.0.0** - Desarrollado por Mynor Urrutia
