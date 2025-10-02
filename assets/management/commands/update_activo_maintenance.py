from django.core.management.base import BaseCommand
from assets.models import Activo, Maintenance

class Command(BaseCommand):
    help = 'Update Activo maintenance fields with the latest maintenance data'

    def handle(self, *args, **options):
        count = 0
        for activo in Activo.objects.all():
            latest = activo.maintenances.order_by('-created_at').first()
            if latest:
                activo.ultimo_mantenimiento = latest.maintenance_date
                activo.proximo_mantenimiento = latest.next_maintenance_date
                activo.tecnico_mantenimiento = latest.technician
                activo.ultimo_mantenimiento_hallazgos = latest.findings
                activo.save(update_fields=['ultimo_mantenimiento', 'proximo_mantenimiento', 'tecnico_mantenimiento', 'ultimo_mantenimiento_hallazgos'])
                count += 1
                self.stdout.write(f'Updated Activo {activo.id}')
        self.stdout.write(f'Total updated: {count}')