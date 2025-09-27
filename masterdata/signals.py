from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model
from .models import AuditLog, Region, Finca, Departamento, Area, TipoActivo, Marca, ModeloActivo
from itam_backend.threadlocals import get_current_user

User = get_user_model()

MODELS_TO_LOG = [Region, Finca, Departamento, Area, TipoActivo, Marca, ModeloActivo, User]

# @receiver(post_save, sender=Region)
# @receiver(post_save, sender=Finca)
# @receiver(post_save, sender=Departamento)
# @receiver(post_save, sender=Area)
# @receiver(post_save, sender=TipoActivo)
# @receiver(post_save, sender=Marca)
# @receiver(post_save, sender=ModeloActivo)
# @receiver(post_save, sender=User)
# Signals for save/delete are now handled in views
# def log_save(sender, instance, created, **kwargs):
#     user = get_current_user()
#     if user:
#         activity = 'CREATE' if created else 'UPDATE'
#         content_type = ContentType.objects.get_for_model(instance)
#         description = f"{activity} {sender.__name__}: {instance}"
#         AuditLog.objects.create(
#             activity_type=activity,
#             description=description,
#             user=user,
#             content_type=content_type,
#             object_id=instance.pk
#         )

# @receiver(post_delete, sender=Region)
# @receiver(post_delete, sender=Finca)
# @receiver(post_delete, sender=Departamento)
# @receiver(post_delete, sender=Area)
# @receiver(post_delete, sender=TipoActivo)
# @receiver(post_delete, sender=Marca)
# @receiver(post_delete, sender=ModeloActivo)
# @receiver(post_delete, sender=User)
# def log_delete(sender, instance, **kwargs):
#     user = get_current_user()
#     if user:
#         content_type = ContentType.objects.get_for_model(instance)
#         description = f"DELETE {sender.__name__}: {instance}"
#         AuditLog.objects.create(
#             activity_type='DELETE',
#             description=description,
#             user=user,
#             content_type=content_type,
#             object_id=instance.pk
#         )

@receiver(user_logged_in)
def log_login(sender, request, user, **kwargs):
    description = f"User {user.username} logged in"
    AuditLog.objects.create(
        activity_type='LOGIN',
        description=description,
        user=user
    )