#!/usr/bin/env python3
"""
Script para iniciar la aplicación ITAM en modo desarrollo
Inicia tanto el backend como el frontend automáticamente
"""

import os
import sys
import subprocess
import platform
import time
from pathlib import Path

def run_command(command, cwd=None, shell=False, background=False):
    """Ejecuta un comando"""
    try:
        if background:
            process = subprocess.Popen(
                command if shell else command.split(),
                cwd=cwd,
                shell=shell
            )
            return process
        else:
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
        print(f"❌ Error: {e.stderr}")
        return None

def check_setup():
    """Verifica que la instalación esté completa"""
    print("🔍 Verificando instalación...")

    # Verificar directorios
    if not Path("itam_backend").exists():
        print("❌ Directorio itam_backend no encontrado")
        return False

    if not Path("itam_frontend").exists():
        print("❌ Directorio itam_frontend no encontrado")
        return False

    # Verificar entorno virtual
    if platform.system() == "Windows":
        venv_python = Path("itam_backend/venv/Scripts/python.exe")
    else:
        venv_python = Path("itam_backend/venv/bin/python")

    if not venv_python.exists():
        print("❌ Entorno virtual no encontrado. Ejecuta setup_dev.py primero")
        return False

    # Verificar node_modules
    if not Path("itam_frontend/node_modules").exists():
        print("❌ Dependencias del frontend no instaladas. Ejecuta setup_dev.py primero")
        return False

    return True

def start_backend():
    """Inicia el backend de Django"""
    print("🔧 Iniciando backend Django...")

    backend_dir = Path("itam_backend")

    if platform.system() == "Windows":
        cmd = ["venv\\Scripts\\python", "manage.py", "runserver"]
    else:
        cmd = ["venv/bin/python", "manage.py", "runserver"]

    process = run_command(cmd, cwd=backend_dir, background=True)
    if process:
        print("✅ Backend iniciado en http://localhost:8000")
        return process
    else:
        print("❌ Error iniciando backend")
        return None

def start_frontend():
    """Inicia el frontend de React"""
    print("⚛️  Iniciando frontend React...")

    frontend_dir = Path("itam_frontend")
    process = run_command(["npm", "start"], cwd=frontend_dir, background=True)

    if process:
        print("✅ Frontend iniciado en http://localhost:3000")
        return process
    else:
        print("❌ Error iniciando frontend")
        return None

def wait_for_servers():
    """Espera a que los servidores estén listos"""
    print("\n⏳ Esperando que los servidores inicien...")
    time.sleep(5)

    # Aquí podrías agregar verificaciones más sofisticadas
    # como hacer ping a los endpoints

def show_info():
    """Muestra información de acceso"""
    print("\n" + "=" * 50)
    print("🎉 ¡Sistema ITAM iniciado exitosamente!")
    print("=" * 50)
    print("\n🔗 URLs de acceso:")
    print("• Aplicación principal: http://localhost:3000")
    print("• Panel de administración: http://localhost:8000/admin/")
    print("• API del backend: http://localhost:8000/api/")
    print("\n👤 Credenciales de administrador:")
    print("• Usuario: admin")
    print("• Contraseña: admin123")
    print("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio")
    print("\n🛑 Para detener: Presiona Ctrl+C")
    print("=" * 50)

def main():
    """Función principal"""
    print("🚀 Iniciando Sistema ITAM - Modo Desarrollo")
    print("=" * 50)

    # Verificar instalación
    if not check_setup():
        print("\n❌ Instalación incompleta. Ejecuta 'python setup_dev.py' primero")
        input("Presiona Enter para salir...")
        sys.exit(1)

    # Iniciar backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ No se pudo iniciar el backend")
        sys.exit(1)

    # Pequeña pausa
    time.sleep(2)

    # Iniciar frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ No se pudo iniciar el frontend")
        backend_process.terminate()
        sys.exit(1)

    # Esperar y mostrar info
    wait_for_servers()
    show_info()

    try:
        # Mantener los procesos ejecutándose
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Deteniendo servidores...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Servidores detenidos")
        sys.exit(0)

if __name__ == "__main__":
    main()