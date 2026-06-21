from django.db import models

# Create your models here.
class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    correo = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre


class Actividad(models.Model):
    nombre_actividad = models.CharField(max_length=100)
    descripcion = models.TextField()

    def __str__(self):
        return self.nombre_actividad


class Progreso(models.Model):

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE
    )

    actividad = models.ForeignKey(
        Actividad,
        on_delete=models.CASCADE
    )

    palabra = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    resultado = models.CharField(max_length=20)

    fecha_realizacion = models.DateTimeField(
        auto_now_add=True
    )
    
class HistorialActividad(models.Model):
    progreso = models.ForeignKey(
        Progreso,
        on_delete=models.CASCADE
    )

    fecha_registro = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Historial {self.progreso.id}"
