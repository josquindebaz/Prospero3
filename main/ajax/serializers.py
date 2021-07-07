from main.models import *
from main.helpers import frontend, queries

def serializeObject(request, data, results):
    object = frontend.getBDObject(data)
    results["object"] = object.serialize()

def serializeTable(request, data, results):
    table = []
    results["table"] = table
    identity = data["identity"]
    filters = data["filters"]
    property = data["property"]
    object = frontend.getBDObject(identity)
    querySet = getattr(object, property)
    items = queries.getObjects(querySet, filters)
    for item in items:
        table.append(item.serializeAsTableItem())
    results["filters"] = filters

def serializeUserData(request, data, results):
    users = []
    for user in PUser.objects.all():
        users.append(user.getRealInstance().serialize())
    results["users"] = users

def serializeAllUserData(request, data, results):
    users = []
    for user in ProsperoUser.objects.all():
        users.append(user.getRealInstance().serialize())
    results["users"] = users

def serializeProjectRights(request, data, results):
    project = frontend.getBDObject(data["project"])
    results["rights"] = project.serializeRights()