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

def createText(request, data, results):
    print("createText", data)
    corpus = frontend.getBDObject(data["corpus"])
    text = None
    if "text" in data:
        text = data["text"]
        text = builder.createPText(text)
    else:
        filePath = settings.MEDIA_ROOT + data["filePath"]
        folder = files.gotFolder(filePath)
        try:
            ext = files.getFileExtension(filePath).lower()
            if ext == "txt":
                text = builder.createPText(files.readFile(filePath, detectEncoding=True))
            elif ext == "pdf":
                print("TODO pdf extraction")
                pdftotextAvailable = False
                try:
                    import pdftotext
                    pdftotextAvailable = True
                except:
                    pass
                if pdftotextAvailable:
                    with open(filePath, "rb") as f:
                        pdf = pdftotext.PDF(f)
                        txt = "\n\n".join(pdf)
                        text = builder.createPText(txt)
                else:
                    text = builder.createPText("pdf extraction impossible, pdftotext not available")
        except Exception as e:
            results["serverError"] = str(e)
        files.deleteFile(folder)
    if text:
        corpus.texts.add(text)
        results["text"] = text.serializeAsTableItem()
