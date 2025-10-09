from django.core.management.base import BaseCommand
from apps.assets.models import Activo, Maintenance


class Command(BaseCommand):
    help = 'Update Activo maintenance fields with latest maintenance data'

    def handle(self, *args, **options):
        self.stdout.write('Updating Activo maintenance fields...')

        updated_count = 0
        for activo in Activo.objects.all():
            # Get the latest maintenance for this activo
            latest_maintenance = Maintenance.objects.filter(activo=activo).order_by('-created_at').first()

            if latest_maintenance:
                # Update the Activo fields
                activo.ultimo_mantenimiento = latest_maintenance.maintenance_date
                activo.proximo_mantenimiento = latest_maintenance.next_maintenance_date
                activo.tecnico_mantenimiento = latest_maintenance.technician
                activo.ultimo_mantenimiento_hallazgos = latest_maintenance.findings

                activo.save(update_fields=[
                    'ultimo_mantenimiento',
                    'proximo_mantenimiento',
                    'tecnico_mantenimiento',
                    'ultimo_mantenimiento_hallazgos'
                ])

                updated_count += 1
                self.stdout.write(f'Updated {activo.hostname} with maintenance from {latest_maintenance.maintenance_date}')
            else:
                self.stdout.write(f'No maintenance records for {activo.hostname}')

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated_count} Activo records'))