from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Usuario)
admin.site.register(Actividad)
admin.site.register(Progreso)
admin.site.register(HistorialActividad)