from prospero import settings
from main.models import *
from django.template import loader
from main.helpers import frontend

def renderTable(request, data, results):
    table = []
    results["table"] = table
    object = frontend.getBDObject(data)
    for item in getattr(object, data["property"]).all():
        table.append(item.serializeAsTableItem())

def renderObject(request, data, results):
    object = frontend.getBDObject(data)
    results["object"] = object.serialize()

def deleteObject(request, data, results):
    object = frontend.getBDObject(data)
    print("delete", object)
    """
    if type(object) == PCorpus:
        for text in object.texts.all():
            text.delete()
    object.delete()
    """