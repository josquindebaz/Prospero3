from django.template import loader
from main.helpers import queries, sessions
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
