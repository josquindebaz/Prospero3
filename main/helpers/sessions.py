from main.models import *

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
        "sort" : "title"
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


def setCurrentProjectInContext(pageData, context):
    currentProjectId = pageData["currentProjectId"]
    if currentProjectId:
        try:
            project = Project.objects.get(id=currentProjectId)
            context["project"] = project
            context["projectRights"] = UserRight.objects.filter(project=project)
        except:
            context["project"] = None

def getCurrentUser():
    try:
        return PUser.objects.filter(username="josquin@gmail.com")[0]
    except:
        return None