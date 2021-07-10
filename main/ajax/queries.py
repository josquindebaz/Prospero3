from django.template import loader
from main.helpers import queries, sessions
from main import views

def searchInProjects(request, data, results):
    context = views.createContext(request)
    renderType = data["renderType"]
    filters = data["viewData"]
    pagination = data["pagination"]
    sessions.setProjectsData(request, filters)
    user = context["user"]
    projects = queries.getProjects(pagination, filters, user)
    context["projects"] = projects
    if renderType == "mosaic":
        template = loader.get_template('main/prospero/projects-mosaic/projects.html')
    else:
        template = loader.get_template('main/prospero/projects-list/projects.html')
    results["html"] = template.render(context, request)
    results["pagination"] = pagination
