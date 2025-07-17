# C:\Proyectos\ITAM_System\itam_backend\users\urls.py
from django.urls import path
# Asegúrate de importar la nueva vista
from .views import RegisterView, LoginView, UserListCreateView, UserDetailView, ChangeUserPasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    # Nueva ruta para cambiar contraseña
    path('users/<int:pk>/change-password/', ChangeUserPasswordView.as_view(), name='user-change-password'),
]