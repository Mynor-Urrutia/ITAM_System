# C:\Proyectos\ITAM_System\itam_backend\users\serializers.py
from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # Asegúrate de incluir todos los campos que quieres exponer a través de la API
        # Incluye 'first_name' y 'last_name' si los usas.
        fields = [
            'id',
            'username',
            'email',
            'first_name', # Asegúrate de incluirlos si los vas a usar
            'last_name',  # Asegúrate de incluirlos si los vas a usar
            'puesto',
            'departamento',
            'region',
            'status'
        ]
        read_only_fields = ['id'] # El ID es de solo lectura

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        # Para el registro, solo necesitamos los campos para crear un usuario básico.
        # Los campos opcionales como puesto, departamento, etc., pueden ser añadidos después
        # o en un formulario de edición.
        fields = [
            'username',
            'email',
            'password',
            'first_name', # Opcional, pero bueno incluirlo si el frontend lo va a enviar
            'last_name',  # Opcional, pero bueno incluirlo si el frontend lo va a enviar
            # 'puesto', # Puedes agregarlos aquí si quieres que sean parte del registro inicial
            # 'departamento',
            # 'region',
            # 'status', # El status tiene un valor por defecto en el modelo, no es necesario aquí
        ]

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''), # Usar .get para campos opcionales
            last_name=validated_data.get('last_name', ''),   # Usar .get para campos opcionales
            # Puedes pasar los nuevos campos aquí si los incluyes en fields arriba
            # puesto=validated_data.get('puesto'),
            # departamento=validated_data.get('departamento'),
            # region=validated_data.get('region'),
            # status=validated_data.get('status', 'Activo'), # Si lo incluyes, asegúrate del default
        )
        return user
    
class ChangePasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    # Opcional: Si quieres confirmar la contraseña, añade un campo de confirmación
    # confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        # Opcional: Validación para que new_password y confirm_password coincidan
        # if data['new_password'] != data.get('confirm_password'):
        #     raise serializers.ValidationError({"confirm_password": "Las contraseñas no coinciden."})
        return data