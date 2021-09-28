from main.models import *
from django.template import loader
from main.helpers import frontend, queries, sessions, rights
from main import views

def renderUserTable(request, data, results):
    table = []
    results["table"] = table
    filters = data["filters"]
    pagination = data["filters"]["pagination"]
    querySet = ProsperoUser.objects.all()
    # querySet = ProsperoUser.objects.exclude(id=rights.anonymousUser.id)
    items = queries.getUsers(querySet, filters, pagination)
    for item in items:
        table.append(item.getRealInstance().serializeAsTableItem())
    results["pagination"] = pagination

def renderProjectInfos(request, data, results):
    project = frontend.getBDObject(data["project"])
    context = views.createContext(request)
    pageData = sessions.getPageData(request, context)
    if data["setCurrentProject"]:
        pageData["currentProjectId"] = str(project.id)
        sessions.setProjectsData(request, pageData)
    project = sessions.computeCurrentProject(pageData, request, context)
    if project:
        context["projectRights"] = UserRight.objects.filter(project=project)
        context["projectData"] = project.serializeDataDef()
    user = context["user"]
    template = loader.get_template('main/prospero/project/project-infos.html')
    results["html"] = template.render(context, request)

    results["userData"] = sessions.computeUserData(user, project)
    #results["userData"] = sessions.getUserData(context)