# itam_backend/masterdata/urls.py

from rest_framework.routers import DefaultRouter
from .views import RegionViewSet, FincaViewSet

router = DefaultRouter()
router.register(r'regions', RegionViewSet)
router.register(r'fincas', FincaViewSet) # Los endpoints serán /api/masterdata/fincas/

urlpatterns = router.urls