from django.core.management.base import BaseCommand
from assets.models import Assignment, Activo
from users.models import CustomUser

class Command(BaseCommand):
    help = 'Update Activo assigned_to field based on active assignments'

    def handle(self, *args, **options):
        # Clear all assigned_to fields first
        Activo.objects.update(assigned_to=None)

        # Get all active assignments
        active_assignments = Assignment.objects.filter(returned_date__isnull=True).select_related('activo', 'employee')

        updated_count = 0
        for assignment in active_assignments:
            if assignment.employee:
                # Find the user account for this employee
                try:
                    user = CustomUser.objects.get(employee=assignment.employee)
                    assignment.activo.assigned_to = user
                    assignment.activo.save(update_fields=['assigned_to'])
                    updated_count += 1
                    self.stdout.write(f'Updated {assignment.activo.hostname} -> {user.username}')
                except CustomUser.DoesNotExist:
                    self.stdout.write(f'No user account found for employee {assignment.employee.first_name} {assignment.employee.last_name}')
                except Exception as e:
                    self.stdout.write(f'Error updating {assignment.activo.hostname}: {e}')

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated_count} activos with active assignments'))