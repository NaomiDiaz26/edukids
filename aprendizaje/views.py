from django.shortcuts import render, redirect
from .forms import LoginForm
from .forms import RegistroForm
from django.http import JsonResponse
import json
from .models import Usuario, Actividad, Progreso
from .decorators import login_requerido
from django.db import connection

# Create your views here.
def inicio(request):
    return render(request, 'index.html')

@login_requerido
def letras(request):
    return render(request, 'letras.html')

@login_requerido
def silabas(request):
    return render(request, 'silabas.html')

@login_requerido
def palabras(request):
    return render(request, 'palabras.html')

def guardar_progreso_palabras(request):

    usuario_id = request.session.get('usuario_id')

    if not usuario_id:
        return JsonResponse(
            {'error': 'Debe iniciar sesión'},
            status=401
        )

    datos = json.loads(request.body)

    palabra = datos.get('palabra')

    usuario = Usuario.objects.get(id=usuario_id)

    actividad = Actividad.objects.get(
        nombre_actividad='Palabras'
    )

    existe = Progreso.objects.filter(
        usuario=usuario,
        actividad=actividad,
        palabra=palabra
    ).exists()

    if not existe:

        Progreso.objects.create(
            usuario=usuario,
            actividad=actividad,
            palabra=palabra,
            resultado='Correcto'
        )

    return JsonResponse({
        'mensaje': 'Progreso guardado'
    })
    
def login_view(request):

    if request.method == 'POST':

        form = LoginForm(request.POST)

        if form.is_valid():

            correo = form.cleaned_data['correo']
            password = form.cleaned_data['password']

            try:

                usuario = Usuario.objects.get(
                    correo=correo,
                    password=password
                )

                request.session['usuario_id'] = usuario.id

                return redirect('index')

            except Usuario.DoesNotExist:

                return render(
                    request,
                    'login.html',
                    {
                        'form': form,
                        'error': 'Credenciales incorrectas'
                    }
                )

    else:

        form = LoginForm()

    return render(
        request,
        'login.html',
        {'form': form}
    )
    
def registro_view(request):

    if request.method == 'POST':

        form = RegistroForm(request.POST)

        if form.is_valid():

            form.save()

            return redirect('login')

    else:

        form = RegistroForm()

    return render(
        request,
        'registro.html',
        {'form': form}
    )

def logout_view(request):

    request.session.flush()

    return redirect('login')
    
@login_requerido
def progreso(request):

    usuario_id = request.session.get('usuario_id')

    TOTAL_PALABRAS = 28

    with connection.cursor() as cursor:

        cursor.execute("""
            SELECT COUNT(*)
            FROM vw_progreso_usuarios
            WHERE usuario_id = %s
            AND actividad = 'Palabras'
            AND resultado = 'Correcto'
        """, [usuario_id])

        palabras_correctas = cursor.fetchone()[0]

    porcentaje = min(
        round((palabras_correctas / TOTAL_PALABRAS) * 100),
        100
    )

    return render(
        request,
        'progreso.html',
        {
            'palabras_correctas': palabras_correctas,
            'total_palabras': TOTAL_PALABRAS,
            'porcentaje': porcentaje
        }
    )
