from django.urls import path
from . import views

urlpatterns = [
    path('', views.login_view, name='login' ),
    path('registro/', views.registro_view, name='registro'),
    path('inicio/', views.inicio, name='index'),
    path('letras/', views.letras, name='letras'),
    path('silabas/', views.silabas, name='silabas'),
    path('palabras/', views.palabras, name='palabras'),
    path('guardar-progreso-palabras/', views.guardar_progreso_palabras, name='guardar_progreso_palabras'),
    path('logout/', views.logout_view, name='logout'),
    path('progreso/', views.progreso, name='progreso'),
]