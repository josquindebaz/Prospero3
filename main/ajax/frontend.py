from prospero import settings
from main.models import *
from django.template import loader
from main.helpers import frontend, files
from main.helpers.deletor import deletor
from main.importerP1 import builder2BD as builder

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
    if not isinstance(data, list):
        data = [data]
    objects = []
    for d in data:
        objects.append(frontend.getBDObject(d))
    print("delete", objects)
    for obj in objects:
        deletor.delete(obj)
        """
        if type(obj) == PCorpus:
            for text in obj.texts.all():
                text.delete()
        obj.delete()
        """

def createText(request, data, results):
    print("createText", data)
    text = None
    if "text" in data:
        text = data["text"]
        text = builder.createPText(text)
    else:
        filePath = data["filePath"]
        folder = files.gotFolder(settings.MEDIA_ROOT + filePath)
        try:
            print("TODO pdf extraction")
            text = builder.createPText("TODO pdf extraction")
        except Exception as e:
            results["serverError"] = str(e)
        files.deleteFile(folder)
    if text:
        corpus = frontend.getBDObject(data["corpus"])
        corpus.texts.add(text)
        results["text"] = text.serializeAsTableItem()
