# 1. Compilar el frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

# 2. Servir la aplicación con Nginx
FROM nginx:alpine
# Copia la configuración de Nginx (debes crear un archivo nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia los archivos estáticos compilados
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]