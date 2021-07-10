from django.contrib import auth
from main.helpers import forms

def connect(request, data, results):
    form = forms.Form(data["fields"])
    logout = form.getValue("logout")
    username = form.getValue("username")
    password = form.getValue("password")
    if logout:
        auth.logout(request)
    else:
        form.checkRequired("username", "Field required")
        form.checkRequired("password", "Field required")
        if not form.hasErrors():
            user = auth.authenticate(username=username, password=password)
            if user != None and user.is_active:
                # Correct password, and the user is marked "active"
                auth.login(request, user)
            else:
                form.setError("password", "Incorrect values")
                results["serverError"] = form.getErrors()