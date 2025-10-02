from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Create a superadmin user'

    def handle(self, *args, **options):
        User = get_user_model()
        username = 'superadmin'
        email = 'superadmin@itam.com'
        password = 'super123'

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'Superadmin user "{username}" already exists.'))
            return

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_staff=True,
            is_superuser=True
        )
        self.stdout.write(self.style.SUCCESS(f'Successfully created superadmin user "{username}".'))