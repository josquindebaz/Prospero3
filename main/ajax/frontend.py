from prospero import settings
from main.models import *
from django.template import loader
from main.helpers import frontend, files, queries
from main.helpers.deletor import deletor
from main.importerP1 import builder2BD as builder
from django.http import HttpResponse
from main import views

def renderTable(request, data, results):
    table = []
    results["table"] = table
    identity = data["identity"]
    filters = data["filters"]
    object = frontend.getBDObject(identity)
    print("renderTable on", object)
    querySet = getattr(object, identity["property"])
    items = queries.getObjects(querySet, filters)
    for item in items:
        table.append(item.serializeAsTableItem())
    results["filters"] = filters

def changeData(request, data, results):
    object = frontend.getBDObject(data["identity"])
    if data["kind"] == "metadata":
        setattr(object, "value", data["value"])
    else:
        setattr(object, data["name"], data["value"])
    object.save()
    print("changeData", object)

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

def createCorpus(request, data, results):
    project = frontend.getBDObject(data["project"])
    fields = data["fields"]
    nameField = fields["name"]
    name = nameField["value"]
    errors = {}
    if project.corpuses.filter(name=name).count() > 0:
        nameField["error"] = "Corpus exists with this name"
        errors["name"] = nameField
    if errors:
        results["serverError"] = {
            "fields" : errors
        }
    else:
        corpus = builder.createPCorpus(name)
        project.corpuses.add(corpus)
        results["corpus"] = corpus.serializeAsTableItem()

def createProject(request, data, results):
    context = views.createContext(request)
    fields = data["fields"]
    nameField = fields["name"]
    name = nameField["value"]
    errors = {}
    if Project.objects.filter(name=name).count() > 0:
        nameField["error"] = "Project exists with this name"
        errors["name"] = nameField
    if errors:
        results["serverError"] = {
            "fields" : errors
        }
    else:
        owner = context["user"]
        project = builder.createProject(name, owner)
        results["url"] = "/project/"+str(project.id)

def createMetadata(request, data, results):
    corpus = frontend.getBDObject(data["corpus"])
    fields = data["fields"]
    nameField = fields["name"]
    name = nameField["value"]
    dataType = fields["type"]["value"]
    errors = {}
    if corpus.hasData(name):
        nameField["error"] = "Data already exists with this name"
        errors["name"] = nameField
    if errors:
        results["serverError"] = {
            "fields" : errors
        }
    else:
        data = builder.createMetaData(name, dataType, "")
        corpus.metaDatas.add(data)
        results["metadata"] = data.serialize()

def changeMetadataPosition(request, data, results):
    item = frontend.getBDObject(data["item"]["identity"])
    parent = item.parent()
    if data["next"]:
        next = frontend.getBDObject(data["next"]["identity"])
        l = list(parent.metaDatas.all())
        l.remove(item)
        index = l.index(next)
        l.insert(index, item)
        parent.metaDatas.clear()
        parent.metaDatas.add(*l)
    else:
        parent.metaDatas.remove(item)
        parent.metaDatas.add(item)

def renderProjectInfos(request, data, results):
    project = frontend.getBDObject(data)
    context = views.createContext(request)
    context["project"] = project
    template = loader.get_template('main/prospero/project/project-infos.html')
    results["html"] = template.render(context, request)


