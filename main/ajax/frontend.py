from prospero import settings
from main.models import *
from django.template import loader
from main.helpers import frontend, files, queries, sessions, forms, cloud, users
from main.helpers.deletor import deletor
from main.importerP1 import builder2BD as builder
from django.http import HttpResponse
from main import views

def searchInProjects(request, data, results):
    filters = data["viewData"]
    pagination = data["pagination"]
    sessions.setProjectsData(request, filters)
    projects = queries.getProjects(pagination, filters)
    context = views.createContext(request)
    context["projects"] = projects
    template = loader.get_template('main/prospero/projects-mosaic/projects.html')
    results["html"] = template.render(context, request)
    results["pagination"] = pagination

def renderTable(request, data, results):
    table = []
    results["table"] = table
    identity = data["identity"]
    filters = data["filters"]
    property = data["property"]
    object = frontend.getBDObject(identity)
    print("renderTable on", object)
    querySet = getattr(object, property)
    items = queries.getObjects(querySet, filters)
    for item in items:
        table.append(item.serializeAsTableItem())
    results["filters"] = filters

def renderUserTable(request, data, results):
    table = []
    results["table"] = table
    filters = data["filters"]
    pagination = data["filters"]["pagination"]
    querySet = ProsperoUser.objects.all()
    items = queries.getUsers(querySet, filters, pagination)
    for item in items:
        table.append(item.getRealInstance().serializeAsTableItem())
    results["pagination"] = pagination

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

def createUser(request, data, results):
    form = forms.Form(data["fields"])
    username = form.getValue("username")
    thumbnail = form.getValue("thumbnail")
    firstName = form.getValue("first_name")
    lastName = form.getValue("last_name")
    password = form.getValue("password")
    password2 = form.getValue("password2")
    try:
        ProsperoUser.objects.get(username=username)
        form.setError("username", "User or group already exists with this name")
        results["serverError"] = form.getErrors()
    except:
        form.checkRequired("username", "Field required")
        form.checkRequired("thumbnail", "Field required")
        form.checkRequired("first_name", "Field required")
        form.checkRequired("last_name", "Field required")
        form.checkRequired("password", "Field required")
        form.checkRequired("password2", "Field required")
        if not form.hasErrors():
            if len(password) < 8 or len(password) > 20:
                form.setError("password", "Your password must be 8-20 characters long")
            elif password != password2:
                form.setError("password2", "Does not match password field")
            else:
                user = builder.createPUser(
                    username,
                    firstName,
                    lastName
                )
                user.setThumbnailUrl(thumbnail)
                users.setPassword(user, password)
                results["user"] = user.serializeIdentity()

def modifyUser(request, data, results):
    form = forms.Form(data["fields"])
    user = frontend.getBDObject(data["identity"])
    username = form.getValue("username")
    thumbnail = form.getValue("thumbnail")
    firstName = form.getValue("first_name")
    lastName = form.getValue("last_name")
    password = form.getValue("password")
    password2 = form.getValue("password2")
    if username != user.username:
        try:
            ProsperoUser.objects.get(username=username)
            form.setError("username", "User or group already exists with this name")
            results["serverError"] = form.getErrors()
            return
        except:
            pass
    form.checkRequired("username", "Field required")
    form.checkRequired("thumbnail", "Field required")
    form.checkRequired("first_name", "Field required")
    form.checkRequired("last_name", "Field required")
    if form.hasErrors():
        results["serverError"] = form.getErrors()
        return
    if password and password2:
        if len(password) < 8 or len(password) > 20:
            form.setError("password", "Your password must be 8-20 characters long")
            return
        elif password != password2:
            form.setError("password2", "Does not match password field")
            return
        else:
            users.setPassword(user, password)
    if thumbnail != user.getThumbnailUrl():
        user.setThumbnailUrl(thumbnail)
    user.username = username
    user.first_name = firstName
    user.last_name = lastName
    user.save()

def createGroup(request, data, results):
    form = forms.Form(data["fields"])
    username = form.getValue("username")
    thumbnail = form.getValue("thumbnail")
    users = form.getValue("users")
    try:
        ProsperoUser.objects.get(username=username)
        form.setError("username", "User or group already exists with this name")
        results["serverError"] = form.getErrors()
    except:
        form.checkRequired("username", "Field required")
        form.checkRequired("thumbnail", "Field required")
        if not form.hasErrors():
            group = builder.createPGroup(
                username
            )
            group.setThumbnailUrl(thumbnail)
            for userId in users:
                user = PUser.objects.get(id=userId)
                group.users.add(user)
            results["group"] = group.serializeIdentity()

def modifyGroup(request, data, results):
    form = forms.Form(data["fields"])
    group = frontend.getBDObject(data["identity"])
    username = form.getValue("username")
    thumbnail = form.getValue("thumbnail")
    users = form.getValue("users")
    if username != group.username:
        try:
            ProsperoUser.objects.get(username=username)
            form.setError("username", "User or group already exists with this name")
            results["serverError"] = form.getErrors()
            return
        except:
            pass
    form.checkRequired("username", "Field required")
    form.checkRequired("thumbnail", "Field required")
    if form.hasErrors():
        results["serverError"] = form.getErrors()
        return
    if thumbnail != group.getThumbnailUrl():
        group.setThumbnailUrl(thumbnail)
    group.username = username
    group.save()
    group.users.clear()
    for userId in users:
        user = PUser.objects.get(id=userId)
        group.users.add(user)

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

def setCurrentProject(request, data, results):
    projectsData = sessions.getProjectsData(request)
    currentProjectId = data["id"]
    projectsData["currentProjectId"] = currentProjectId
    sessions.setProjectsData(request, projectsData)

def renderProjectInfos(request, data, results):
    project = frontend.getBDObject(data)
    context = views.createContext(request)
    context["project"] = project
    template = loader.get_template('main/prospero/project/project-infos.html')
    results["html"] = template.render(context, request)

def getUserData(request, data, results):
    users = []
    for user in PUser.objects.all():
        users.append(user.getRealInstance().serialize())
    results["users"] = users

def getFake(request, data, results):
    group = PGroup.objects.all()[0]
    results["object"] = group.serialize()
