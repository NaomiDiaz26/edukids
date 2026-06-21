from django import forms
from .models import Usuario

class RegistroForm(forms.ModelForm):

    password = forms.CharField(
        widget=forms.PasswordInput
    )

    class Meta:
        model = Usuario
        fields = [
            'nombre',
            'correo',
            'password'
        ]

class LoginForm(forms.Form):
    correo = forms.EmailField()
    password = forms.CharField(
        widget=forms.PasswordInput
    )