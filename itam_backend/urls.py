# C:\Proyectos\ITAM_System\itam_backend\itam_backend\urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView, # Opcional: para verificar tokens
)
# Importa la vista base TokenObtainPairView
from rest_framework_simplejwt.views import TokenObtainPairView
# Importa tu serializer personalizado
from users.serializers import CustomTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    # URLs de autenticación JWT
    # === ¡CAMBIA ESTO! Usa tu serializer personalizado aquí ===
    path('api/login/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    # =======================================================
    path('api/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/login/verify/', TokenVerifyView.as_view(), name='token_verify'), # Opcional

    # === ¡CRÍTICO! Incluye las URLs de tu aplicación 'users' ===
    path('api/', include('users.urls')), # Esto incluirá todas las rutas definidas en users/urls.py
]