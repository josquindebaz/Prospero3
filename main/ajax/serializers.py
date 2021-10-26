from main.models import *
from main.helpers import frontend, queries
from main import views

def serializeObject(request, data, results):
    object = frontend.getBDObject(data)
    results["object"] = object.serialize()

def serializeAsTableItem(request, data, results):
    object = frontend.getBDObject(data)
    results["object"] = object.serializeAsTableItem()

def serializeTable(request, data, results):
    table = []
    results["table"] = table
    identity = data["identity"]
    filters = data["filters"]
    property = data["property"]
    object = frontend.getBDObject(identity)
    querySet = getattr(object, property)
    items = queries.getObjects(querySet, filters)
    if property == "dictionnaries":
        context = views.createContext(request)
        user = context["user"]
        conf = object.gotProjectConf(user)
        selected = conf.selectedDicos.all()
        for item in items:
            table.append(item.serializeAsTableItem(selected))
    else:
        for item in items:
            table.append(item.serializeAsTableItem())
    results["filters"] = filters

def serializeDico(request, data, results):
    elements = []
    results["elements"] = elements
    identity = data["identity"]
    filters = data["filters"]
    object = frontend.getBDObject(identity)
    depth = -1
    if (type(object) == FictionDictionnary or type(object) == CollectionDictionnary):
        depth = 1
    elif (type(object) == CategoryDictionnary):
        depth = 0
    querySet = getattr(object, "elements")
    items = queries.getObjects(querySet, filters)
    for item in items:
        item = item.getRealInstance()
        elements.append(item.serialize(depth=depth))
    results["filters"] = filters

def serializeUserData(request, data, results):
    users = []
    for user in PUser.objects.all():
        users.append(user.getRealInstance().serialize())
    results["users"] = users

def serializeAllUserData(request, data, results):
    users = []
    from main.helpers import rights
    for user in ProsperoUser.objects.exclude(id=rights.anonymousUser.id):
    #for user in ProsperoUser.objects.all():
        users.append(user.getRealInstance().serialize())
    results["users"] = users

def serializeProjectRights(request, data, results):
    project = frontend.getBDObject(data["project"])
    results["rights"] = project.serializeRights()