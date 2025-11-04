class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Ejemplo: almacenar usuario actual en request
        request.current_user = request.user
        response = self.get_response(request)
        return response
