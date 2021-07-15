from main.models import *
from main.helpers import rights

def getData(key, request, defaultData=None):
    try:
        data = request.session[key]
    except:
        if defaultData:
            data = defaultData
            setData(key, request, defaultData)
    return data

def setData(key, request, data):
    request.session[key] = data

def getProjectsData(request):
    data = getData("projects", request, {
        "search" : "",
        "currentProjectId": "",
        "sort" : "name"
    })
    currentProjectId = data["currentProjectId"]
    if currentProjectId:
        try:
            Project.objects.get(id=currentProjectId)
        except:
            data["currentProjectId"] = ""
            setProjectsData(request, data)
    return data

def setProjectsData(request, data):
    setData("projects", request, data)


def setPageDataInContext(pageData, context):
    context["pageData"] = pageData
    currentProjectId = pageData["currentProjectId"]
    project = None
    if currentProjectId:
        try:
            project = Project.objects.get(id=currentProjectId)
            context["project"] = project
        except:
            pass
    context["project"] = project
    if project:
        context["projectRights"] = UserRight.objects.filter(project=project)
        context["projectData"] = project.serializeDataDef()


def setUserDataInContext(context):
    context["userData"] = getUserData(context)

def getUserData(context):
    user = context["user"]
    userData = {
        "id": user.id,
    }
    project = context["project"]
    theRights = []
    if project:
        theRights = rights.getRights(user, project)
    userData["rights"] = theRights
    user.canWrite = "Write" in theRights or "Owner" in theRights
    user.isOwner = "Owner" in theRights
    return userData

def getCurrentUser(request):
    try:
        user = request.user.prosperouser
        if user:
            return user.getRealInstance()
    except:
        return ProsperoUser.objects.get(username="anonymous").getRealInstance()