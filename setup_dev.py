#!/usr/bin/env python3
"""
Script de instalación automática para el Sistema ITAM - Entorno de Desarrollo
Este script instala y configura todo lo necesario para ejecutar el sistema en desarrollo.
"""

import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path

def run_command(command, cwd=None, shell=False):
    """Ejecuta un comando y retorna el resultado"""
    try:
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

def check_requirements():
    """Verifica que los requisitos previos estén instalados"""
    print("🔍 Verificando requisitos previos...")

    # Verificar Python
    try:
        python_version = run_command("python --version")
        if python_version:
            print(f"✅ Python encontrado: {python_version}")
        else:
            python_version = run_command("python3 --version")
            if python_version:
                print(f"✅ Python encontrado: {python_version}")
            else:
                print("❌ Python no encontrado. Instala Python 3.8+ desde https://python.org")
                return False
    except:
        print("❌ Python no encontrado. Instala Python 3.8+ desde https://python.org")
        return False

    # Verificar Node.js
    try:
        node_version = run_command("node --version")
        if node_version:
            print(f"✅ Node.js encontrado: {node_version}")
        else:
            print("❌ Node.js no encontrado. Instala Node.js 16+ desde https://nodejs.org")
            return False
    except:
        print("❌ Node.js no encontrado. Instala Node.js 16+ desde https://nodejs.org")
        return False

    # Verificar npm
    try:
        npm_version = run_command("npm --version")
        if npm_version:
            print(f"✅ npm encontrado: {npm_version}")
        else:
            print("❌ npm no encontrado")
            return False
    except:
        print("❌ npm no encontrado")
        return False

    # Verificar MySQL (opcional, solo mostrar advertencia)
    try:
        mysql_version = run_command("mysql --version")
        if mysql_version:
            print(f"✅ MySQL encontrado: {mysql_version}")
        else:
            print("⚠️  MySQL no encontrado. Asegúrate de tener MySQL/XAMPP instalado y ejecutándose")
    except:
        print("⚠️  MySQL no encontrado. Asegúrate de tener MySQL/XAMPP instalado y ejecutándose")

    return True

def setup_backend():
    """Configura el backend de Django"""
    print("\n🔧 Configurando backend Django...")

    backend_dir = Path("itam_backend")
    if not backend_dir.exists():
        print("❌ Directorio itam_backend no encontrado")
        return False

    os.chdir(backend_dir)

    # Crear entorno virtual
    print("📦 Creando entorno virtual...")
    if platform.system() == "Windows":
        run_command("python -m venv venv")
        activate_cmd = "venv\\Scripts\\activate"
    else:
        run_command("python3 -m venv venv")
        activate_cmd = "source venv/bin/activate"

    # Activar entorno virtual e instalar dependencias
    print("📦 Instalando dependencias Python...")
    if platform.system() == "Windows":
        run_command("venv\\Scripts\\pip install -r requirements.txt")
    else:
        run_command("venv/bin/pip install -r requirements.txt")

    # Crear archivo .env si no existe
    env_file = Path(".env")
    if not env_file.exists():
        print("📝 Creando archivo de configuración .env...")
        env_content = """# Django settings
SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True

# Database settings (configura según tu instalación de MySQL)
DB_NAME=itam_db
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=127.0.0.1
DB_PORT=3306

# CORS settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
"""
        with open(".env", "w") as f:
            f.write(env_content)

    # Ejecutar migraciones
    print("🗄️  Aplicando migraciones de base de datos...")
    if platform.system() == "Windows":
        run_command("venv\\Scripts\\python manage.py migrate")
        run_command("venv\\Scripts\\python manage.py setup_roles")
        run_command("venv\\Scripts\\python manage.py create_superadmin")
    else:
        run_command("venv/bin/python manage.py migrate")
        run_command("venv/bin/python manage.py setup_roles")
        run_command("venv/bin/python manage.py create_superadmin")

    os.chdir("..")
    print("✅ Backend configurado correctamente")
    return True

def setup_frontend():
    """Configura el frontend de React"""
    print("\n⚛️  Configurando frontend React...")

    frontend_dir = Path("itam_frontend")
    if not frontend_dir.exists():
        print("❌ Directorio itam_frontend no encontrado")
        return False

    os.chdir(frontend_dir)

    # Instalar dependencias
    print("📦 Instalando dependencias Node.js...")
    run_command("npm install --legacy-peer-deps")

    # Crear archivo .env si no existe
    env_file = Path(".env")
    if not env_file.exists():
        print("📝 Creando archivo de configuración .env...")
        env_content = """REACT_APP_API_BASE_URL=http://localhost:8000/api
GENERATE_SOURCEMAP=false
"""
        with open(".env", "w") as f:
            f.write(env_content)

    os.chdir("..")
    print("✅ Frontend configurado correctamente")
    return True

def create_start_script():
    """Crea un script para iniciar la aplicación fácilmente"""
    print("\n📜 Creando script de inicio...")

    if platform.system() == "Windows":
        script_content = '''@echo off
echo ========================================
echo 🚀 Iniciando Sistema ITAM - Desarrollo
echo ========================================

echo 🔧 Iniciando backend Django...
start cmd /k "cd itam_backend && venv\\Scripts\\activate && python manage.py runserver"

timeout /t 3 /nobreak > nul

echo ⚛️  Iniciando frontend React...
start cmd /k "cd itam_frontend && npm start"

echo ========================================
echo ✅ Aplicación iniciada!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Admin: http://localhost:8000/admin/
echo ========================================
pause
'''
        with open("start_dev.bat", "w") as f:
            f.write(script_content)
        print("✅ Creado start_dev.bat")
    else:
        script_content = '''#!/bin/bash
echo "========================================"
echo "🚀 Iniciando Sistema ITAM - Desarrollo"
echo "========================================"

echo "🔧 Iniciando backend Django..."
cd itam_backend
source venv/bin/activate
python manage.py runserver &

echo "⚛️  Iniciando frontend React..."
cd ../itam_frontend
npm start &

echo "========================================"
echo "✅ Aplicación iniciada!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Admin: http://localhost:8000/admin/"
echo "========================================"
'''
        with open("start_dev.sh", "w") as f:
            f.write(script_content)
        os.chmod("start_dev.sh", 0o755)
        print("✅ Creado start_dev.sh")

def main():
    """Función principal"""
    print("🚀 Instalador Automático - Sistema ITAM")
    print("=" * 50)

    # Verificar requisitos
    if not check_requirements():
        print("\n❌ Requisitos no cumplidos. Revisa los errores arriba.")
        input("Presiona Enter para salir...")
        sys.exit(1)

    # Configurar backend
    if not setup_backend():
        print("\n❌ Error configurando backend.")
        input("Presiona Enter para salir...")
        sys.exit(1)

    # Configurar frontend
    if not setup_frontend():
        print("\n❌ Error configurando frontend.")
        input("Presiona Enter para salir...")
        sys.exit(1)

    # Crear script de inicio
    create_start_script()

    print("\n" + "=" * 50)
    print("🎉 ¡Instalación completada exitosamente!")
    print("=" * 50)
    print("\n📋 Próximos pasos:")
    print("1. Asegúrate de que MySQL esté ejecutándose")
    print("2. Crea la base de datos 'itam_db' si no existe")
    print("3. Ejecuta el script de inicio:")
    if platform.system() == "Windows":
        print("   - start_dev.bat")
    else:
        print("   - ./start_dev.sh")
    print("\n🔗 URLs de acceso:")
    print("• Aplicación: http://localhost:3000")
    print("• Admin: http://localhost:8000/admin/")
    print("• Usuario: admin / admin123")
    print("\n⚠️  IMPORTANTE: Cambia la contraseña del admin después del primer inicio")

    input("\nPresiona Enter para finalizar...")

if __name__ == "__main__":
    main()