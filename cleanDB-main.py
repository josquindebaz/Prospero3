import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'prospero.settings'
import django
django.setup()
from prospero import settings
from main.models import *
from main.importerP1 import builder2BD as builder
from django.contrib import admin

# Register your models here.
from django.apps import apps
models = apps.get_models("main")
for model in models:
    if model.__module__ == "main.models":
        print(model, model.objects.count())
        for x in model.objects.all():
            x.delete()