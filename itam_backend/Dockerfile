# 1. Etapa de compilación del Frontend (Multi-stage build)
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
# Copia solo los archivos necesarios para la instalación de dependencias
COPY itam_frontend/package*.json ./
# Instala las dependencias de Node
RUN npm install
# Copia el resto del código y compila
COPY itam_frontend/ .
# El comando de compilación de React crea la carpeta 'build' o 'dist'
RUN npm run build
# Renombra la carpeta de compilación para que Django la sirva
# Esto supone que React compila a 'build' y la copiamos a un lugar que Django pueda servir estáticamente (opcional)
# Si Django sirve los estáticos, puedes saltar este paso y servir el build de React usando Nginx más adelante.
# Para la estrategia unificada con Django:
# RUN mv build /app/backend/static_files/frontend_build

# 2. Etapa de compilación del Backend (Python)
FROM python:3.11-slim
# Establece variables de entorno para que Python no use buffering
ENV PYTHONUNBUFFERED 1
WORKDIR /app/backend

# Copia los requirements e instala
COPY itam_backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código de Django
COPY itam_backend/ /app/backend/

# Copia el frontend compilado (del paso 1) para que Django lo sirva
# Ajusta la ruta si usas un nombre diferente en el paso de frontend-builder
COPY --from=frontend-builder /app/frontend/build /app/backend/static_root/frontend_build

# Exponer el puerto (Django/Gunicorn por defecto 8000)
EXPOSE 8000

# Comando para correr la aplicación con Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "itam_backend.wsgi:application"]