"""
Middleware personalizado para el sistema ITAM.

Este middleware intercepta todas las peticiones HTTP y almacena el usuario actual
en el almacenamiento thread-local, permitiendo acceder al usuario desde cualquier
parte del código durante el procesamiento de la misma petición.
"""

from threadlocals import set_current_user

class CurrentUserMiddleware:
    """
    Middleware que almacena el usuario actual en thread-local storage.

    Esto es necesario porque Django maneja múltiples usuarios simultáneamente
    y necesitamos saber qué usuario está realizando cada acción.
    """

    def __init__(self, get_response):
        """Inicializa el middleware con la función de respuesta."""
        self.get_response = get_response

    def __call__(self, request):
        """Procesa cada petición HTTP."""
        # Almacena el usuario actual (o None si no está autenticado)
        set_current_user(request.user if request.user.is_authenticated else None)

        # Continúa con el procesamiento normal de la petición
        response = self.get_response(request)
        return response