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

def getPageData(request, context=None):
    data = getData("projects", request, {
        "search" : "",
        "currentProjectId": "",
        "sort" : "name"
    })
    if context:
        context["pageData"] = data
    return data
    """
    currentProjectId = data["currentProjectId"]
    if currentProjectId:
        try:
            Project.objects.get(id=currentProjectId)
        except:
            data["currentProjectId"] = ""
            setProjectsData(request, data)    
    return data
    """

def computeCurrentProject(projectData, request, context=None):
    currentProjectId = projectData["currentProjectId"]
    project = None
    if currentProjectId:
        try:
            project = Project.objects.get(id=currentProjectId)
        except:
            projectData["currentProjectId"] = ""
            setProjectsData(request, projectData)
    if context:
        context["project"] = project
    return project

def setProjectsData(request, data):
    setData("projects", request, data)


"""
def setPageDataInContext(pageData, context):
    #context["pageData"] = pageData
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
"""

def computeUserData(user, project, context=None):
    userData = {
        "id": user.id,
        "publicGroupId": rights.getPublicGroup().id,
        "anonymousUserId" : rights.getAnonymousUser().id
    }
    theRights = []
    if project:
        theRights = rights.getRights(user, project)
    userData["rights"] = theRights
    user.canWrite = "Write" in theRights or "Owner" in theRights
    user.isOwner = "Owner" in theRights
    if context:
        context["userData"] = userData
    return userData

"""
def setUserDataInContext(context):
    context["userData"] = getUserData(context)

def getUserData(context):
    user = context["user"]
    userData = {
        "id": user.id,
        "publicGroupId": rights.getPublicGroup().id,
        "anonymousUserId" : rights.getAnonymousUser().id
    }
    project = context["project"]
    theRights = []
    if project:
        theRights = rights.getRights(user, project)
    userData["rights"] = theRights
    user.canWrite = "Write" in theRights or "Owner" in theRights
    user.isOwner = "Owner" in theRights
    return userData
"""

def getCurrentUser(request):
    try:
        user = request.user.prosperouser
        if user:
            return user.getRealInstance()
    except:
        return rights.getAnonymousUser()