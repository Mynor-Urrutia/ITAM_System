from rest_framework.routers import DefaultRouter
from .views import ActivoViewSet

router = DefaultRouter()
router.register(r'activos', ActivoViewSet)

urlpatterns = router.urls