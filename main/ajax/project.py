from prospero import settings
from main.models import *
from django.template import loader

def renderTable(request, data, results):
    print(data)
    table = []
    results["table"] = table
    object = globals()[data["model"]].objects.get(id=data["id"])
    for item in getattr(object, data["property"]).all():
        table.append(item.serializeAsTable())

def renderObject(request, data, results):
    print(data)
    object = globals()[data["model"]].objects.get(id=data["id"])
    results["object"] = object.serialize()