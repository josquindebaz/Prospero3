from django.contrib import admin

# Register your models here.
from django.apps import apps
models = apps.get_models("main")
for model in models:
    if model.__module__.startswith("main"):
        try:
            admin.site.register(model)
        except:
            pass