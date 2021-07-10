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
    items = queries.getUsers(querySet, filters, pagination)
    for item in items:
        table.append(item.getRealInstance().serializeAsTableItem())
    results["pagination"] = pagination

def renderProjectInfos(request, data, results):
    project = frontend.getBDObject(data["project"])
    context = views.createContext(request)
    projectsData = sessions.getProjectsData(request)
    if data["setCurrentProject"]:
        projectsData["currentProjectId"] = data["project"]["id"]
        sessions.setProjectsData(request, projectsData)
    sessions.setPageDataInContext(projectsData, context)
    context["project"] = project
    user = context["user"]
    template = loader.get_template('main/prospero/project/project-infos.html')
    results["html"] = template.render(context, request)
    results["userData"] = sessions.getUserData(context)