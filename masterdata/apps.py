from django.apps import AppConfig


class MasterdataConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'masterdata'

    def ready(self):
        import masterdata.signals  # noqa
