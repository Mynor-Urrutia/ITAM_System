#!/usr/bin/env python3
"""
Script de despliegue automático para el Sistema ITAM - Entorno de Producción
Este script configura y despliega la aplicación en un servidor Linux para producción.
"""

import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path

def run_command(command, cwd=None, shell=False, sudo=False):
    """Ejecuta un comando y retorna el resultado"""
    try:
        if sudo and os.geteuid() != 0:
            command = ["sudo"] + (command if isinstance(command, list) else command.split())

        result = subprocess.run(
            command if shell else command.split(),
            cwd=cwd,
            shell=shell,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"❌ Error ejecutando: {' '.join(command) if isinstance(command, list) else command}")
        print(f"Error: {e.stderr}")
        return None

def check_linux():
    """Verifica que estemos en Linux"""
    if platform.system() != "Linux":
        print("❌ Este script es solo para Linux")
        return False
    return True

def check_requirements():
    """Verifica requisitos del sistema"""
    print("🔍 Verificando requisitos del sistema...")

    # Verificar que sea root o tenga sudo
    if os.geteuid() != 0:
        print("⚠️  Recomendado ejecutar como root o con sudo")
        print("   sudo python3 deploy_prod.py")

    # Verificar Python
    try:
        python_version = run_command("python3 --version")
        print(f"✅ Python: {python_version}")
    except:
        print("❌ Python3 no encontrado")
        return False

    # Verificar Node.js
    try:
        node_version = run_command("node --version")
        print(f"✅ Node.js: {node_version}")
    except:
        print("❌ Node.js no encontrado")
        return False

    # Verificar MySQL
    try:
        mysql_version = run_command("mysql --version")
        print(f"✅ MySQL: {mysql_version}")
    except:
        print("❌ MySQL no encontrado")
        return False

    # Verificar Nginx
    try:
        nginx_version = run_command("nginx -v")
        print(f"✅ Nginx: {nginx_version}")
    except:
        print("❌ Nginx no encontrado")
        return False

    return True

def setup_mysql():
    """Configura la base de datos MySQL"""
    print("\n🗄️  Configurando base de datos MySQL...")

    # Crear base de datos
    mysql_commands = """
CREATE DATABASE IF NOT EXISTS itam_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'itam_prod'@'localhost' IDENTIFIED BY 'Itam.Prod.2025!';
GRANT ALL PRIVILEGES ON itam_db.* TO 'itam_prod'@'localhost';
FLUSH PRIVILEGES;
"""

    # Ejecutar comandos MySQL
    process = subprocess.Popen(['mysql', '-u', 'root', '-p'],
                             stdin=subprocess.PIPE,
                             stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE,
                             text=True)

    stdout, stderr = process.communicate(input=mysql_commands)

    if process.returncode == 0:
        print("✅ Base de datos configurada")
        return True
    else:
        print(f"❌ Error configurando MySQL: {stderr}")
        return False

def setup_backend():
    """Configura el backend de Django para producción"""
    print("\n🔧 Configurando backend Django...")

    backend_dir = Path("itam_backend")
    if not backend_dir.exists():
        print("❌ Directorio itam_backend no encontrado")
        return False

    os.chdir(backend_dir)

    # Crear entorno virtual
    print("📦 Creando entorno virtual...")
    run_command("python3 -m venv venv")

    # Instalar dependencias
    print("📦 Instalando dependencias Python...")
    run_command("venv/bin/pip install -r requirements.txt")
    run_command("venv/bin/pip install gunicorn")

    # Crear archivo .env para producción
    print("📝 Creando configuración de producción...")
    env_content = """# Django settings - PRODUCCIÓN
SECRET_KEY=django-insecure-prod-key-change-this-immediately
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database settings
DB_NAME=itam_db
DB_USER=itam_prod
DB_PASSWORD=Itam.Prod.2025!
DB_HOST=localhost
DB_PORT=3306

# CORS settings
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,https://your-domain.com
"""
    with open(".env", "w") as f:
        f.write(env_content)

    # Ejecutar migraciones
    print("🗄️  Aplicando migraciones...")
    run_command("venv/bin/python manage.py migrate")
    run_command("venv/bin/python manage.py setup_roles")
    run_command("venv/bin/python manage.py create_superadmin")

    # Recolectar archivos estáticos
    print("📂 Recolectando archivos estáticos...")
    run_command("venv/bin/python manage.py collectstatic --noinput")

    os.chdir("..")
    print("✅ Backend configurado")
    return True

def setup_frontend():
    """Configura el frontend de React para producción"""
    print("\n⚛️  Configurando frontend React...")

    frontend_dir = Path("itam_frontend")
    if not frontend_dir.exists():
        print("❌ Directorio itam_frontend no encontrado")
        return False

    os.chdir(frontend_dir)

    # Instalar dependencias
    print("📦 Instalando dependencias Node.js...")
    run_command("npm install --legacy-peer-deps")

    # Crear archivo .env para producción
    env_content = """REACT_APP_API_BASE_URL=http://localhost/api
GENERATE_SOURCEMAP=false
"""
    with open(".env", "w") as f:
        f.write(env_content)

    # Construir aplicación
    print("🔨 Construyendo aplicación React...")
    run_command("npm run build")

    os.chdir("..")
    print("✅ Frontend configurado")
    return True

def setup_nginx():
    """Configura Nginx como proxy reverso"""
    print("\n🌐 Configurando Nginx...")

    nginx_config = """
server {
    listen 80;
    server_name localhost;

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
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Servir el frontend React
    location / {
        root /var/www/ITAM_System/itam_frontend/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
"""

    # Crear archivo de configuración
    config_path = "/etc/nginx/sites-available/itam_system"
    try:
        with open(config_path, "w") as f:
            f.write(nginx_config)
        print("✅ Configuración de Nginx creada")
    except PermissionError:
        print("❌ Error: Necesitas permisos de root para configurar Nginx")
        return False

    # Habilitar sitio
    sites_enabled = "/etc/nginx/sites-enabled/itam_system"
    if os.path.exists(sites_enabled):
        os.remove(sites_enabled)

    try:
        os.symlink(config_path, sites_enabled)
        print("✅ Sitio de Nginx habilitado")
    except OSError as e:
        print(f"❌ Error habilitando sitio: {e}")
        return False

    # Probar configuración
    result = run_command("nginx -t")
    if result is None:
        print("❌ Configuración de Nginx inválida")
        return False

    # Reiniciar Nginx
    run_command("systemctl restart nginx", sudo=True)
    run_command("systemctl enable nginx", sudo=True)

    print("✅ Nginx configurado y reiniciado")
    return True

def create_systemd_service():
    """Crea un servicio systemd para el backend"""
    print("\n🔄 Creando servicio systemd...")

    service_content = """[Unit]
Description=Sistema ITAM Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/ITAM_System/itam_backend
Environment="PATH=/var/www/ITAM_System/itam_backend/venv/bin"
ExecStart=/var/www/ITAM_System/itam_backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 itam_backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
"""

    service_path = "/etc/systemd/system/itam_backend.service"
    try:
        with open(service_path, "w") as f:
            f.write(service_content)
        print("✅ Servicio systemd creado")
    except PermissionError:
        print("❌ Error: Necesitas permisos de root para crear servicios")
        return False

    # Recargar systemd y habilitar servicio
    run_command("systemctl daemon-reload", sudo=True)
    run_command("systemctl start itam_backend", sudo=True)
    run_command("systemctl enable itam_backend", sudo=True)

    print("✅ Servicio backend iniciado y habilitado")
    return True

def setup_firewall():
    """Configura el firewall básico"""
    print("\n🔥 Configurando firewall...")

    try:
        # Permitir HTTP y HTTPS
        run_command("ufw allow 80", sudo=True)
        run_command("ufw allow 443", sudo=True)
        run_command("ufw --force enable", sudo=True)
        print("✅ Firewall configurado")
        return True
    except:
        print("⚠️  No se pudo configurar firewall (posiblemente no instalado)")
        return True  # No es crítico

def main():
    """Función principal"""
    print("🏭 Despliegue Automático - Sistema ITAM (Producción)")
    print("=" * 60)

    if not check_linux():
        sys.exit(1)

    if not check_requirements():
        print("\n❌ Requisitos no cumplidos.")
        sys.exit(1)

    # Configurar base de datos
    if not setup_mysql():
        print("\n❌ Error configurando base de datos.")
        sys.exit(1)

    # Configurar backend
    if not setup_backend():
        print("\n❌ Error configurando backend.")
        sys.exit(1)

    # Configurar frontend
    if not setup_frontend():
        print("\n❌ Error configurando frontend.")
        sys.exit(1)

    # Configurar Nginx
    if not setup_nginx():
        print("\n❌ Error configurando Nginx.")
        sys.exit(1)

    # Crear servicio systemd
    if not create_systemd_service():
        print("\n❌ Error creando servicio systemd.")
        sys.exit(1)

    # Configurar firewall
    setup_firewall()

    print("\n" + "=" * 60)
    print("🎉 ¡Despliegue completado exitosamente!")
    print("=" * 60)
    print("\n🔗 URLs de acceso:")
    print("• Aplicación: http://localhost")
    print("• Panel Admin: http://localhost/admin/")
    print("• API: http://localhost/api/")
    print("\n👤 Credenciales de administrador:")
    print("• Usuario: admin")
    print("• Contraseña: admin123")
    print("\n⚠️  IMPORTANTE:")
    print("• Cambia la SECRET_KEY en .env")
    print("• Configura un dominio real")
    print("• Configura HTTPS con Let's Encrypt")
    print("• Cambia las contraseñas de base de datos")
    print("• Configura backups automáticos")
    print("\n📊 Verificar estado:")
    print("sudo systemctl status itam_backend")
    print("sudo systemctl status nginx")

if __name__ == "__main__":
    main()