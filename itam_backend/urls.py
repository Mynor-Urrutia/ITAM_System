# C:\Proyectos\ITAM_System\itam_backend\itam_backend\urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
#from django.conf.urls.static import static
from django.http import HttpResponse
from django.views.static import serve
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView, # Opcional: para verificar tokens
)
# Importa la vista base TokenObtainPairView
from rest_framework_simplejwt.views import TokenObtainPairView
# Importa tu serializer personalizado
from apps.users.serializers import CustomTokenObtainPairSerializer


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    path('api/login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/login/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/', include('apps.users.urls')), # Esto incluirá todas las rutas definidas en users/urls.py
    # --- ¡NUEVA LÍNEA PARA INCLUIR LAS URLS DE MASTERDATA! ---
    path('api/masterdata/', include('apps.masterdata.urls')),
    # --- ¡NUEVA LÍNEA PARA INCLUIR LAS URLS DE ASSETS! ---
    path('api/assets/', include('apps.assets.urls')),
    # --- ¡NUEVA LÍNEA PARA INCLUIR LAS URLS DE EMPLOYEES! ---
    path('api/employees/', include('apps.employees.urls')),
    # --------------------------------------------------------
]
