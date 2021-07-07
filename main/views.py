from prospero import settings
from main.models import *
from django.http import HttpResponse, Http404
from django.template import loader
from main import ajax
from django.views.decorators.csrf import csrf_exempt
from main.helpers import cloud, files, sessions, queries
import json, ntpath, time
from django.shortcuts import redirect

def createContext(request):
    user = sessions.getCurrentUser()
    context = {
        'MEDIA_URL': settings.MEDIA_URL,
        'ROOT_URL': settings.ROOT_URL,
        'DEBUG' : settings.DEBUG,
        'MEDIA_TIMESTAMP' : settings.MEDIA_TIMESTAMP,
        'user' : user
    }
    return context

@csrf_exempt
def ajaxCall(request):
    if request.is_ajax() and request.method == 'POST':
        data = json.loads(request.body)
        serviceName = data['service']
        data = data['data']
        results = ajax.callService(serviceName, data, request)
        return HttpResponse(
            json.dumps(results),
            content_type='application/javascript'
        )
    else:
        raise Http404("no document found")

@csrf_exempt
def fileUpload(request):
    if request.is_ajax() and request.method == 'POST':
        results = {}
        fileFolder = cloud.getStampedCloudFolder("upload")
        relativeFileFolder = cloud.getMediaRelativePath(fileFolder)
        data = request.FILES['file']
        fileName = data.name
        filePath = fileFolder + fileName
        filePath = cloud.findAvailableAbsolutePath(filePath)
        with open(filePath, 'wb+') as destination:
            for chunk in data.chunks():
                destination.write(chunk)
        fileName = ntpath.basename(filePath)
        results['fileName'] = fileName
        results['filePath'] = relativeFileFolder + fileName
        results['fileUrl'] = "/media_site/"+relativeFileFolder + fileName
        results['status'] = "OK"
        return HttpResponse(
            json.dumps(results),
            content_type = 'application/javascript'
        )
    else:
        raise Http404("")

def index(request):
    response = redirect('/projects-mosaic')
    return response

def project(request, id):
    context = createContext(request)
    context["page"] = "project"
    project = Project.objects.get(id=id)
    context["project"] = project
    context["projectData"] = json.dumps(project.serializeIdentity())
    template = loader.get_template('main/prospero/project.html')
    return HttpResponse(template.render(context, request))

def projects_list(request):
    context = createContext(request)
    context["page"] = "projects-list"
    context["projects"] = Project.objects.all()
    context["project"] = Project.objects.first()
    template = loader.get_template('main/prospero/projects-list.html')
    return HttpResponse(template.render(context, request))

def projects_mosaic(request):
    context = createContext(request)
    context["page"] = "projects-mosaic"
    pageData = sessions.getProjectsData(request)
    pagination = {
        "frameSize": 30,
        "page": 0,
        "end": False
    }
    projects = queries.getProjects(pagination, pageData)
    context["session"] = pageData
    context["pageData"] = json.dumps(pageData)
    context["pagination"] = json.dumps(pagination)

    context["projects"] = projects
    sessions.setCurrentProjectInContext(pageData, context)
    template = loader.get_template('main/prospero/projects-mosaic.html')
    return HttpResponse(template.render(context, request))

def settingsView(request):
    context = createContext(request)
    context["page"] = "settings"
    pageData = sessions.getProjectsData(request)
    context["session"] = pageData
    currentProjectId = pageData["currentProjectId"]
    project = None
    if currentProjectId:
        try:
            project = Project.objects.get(id=currentProjectId)
        except:
            None
    context["project"] = project
    template = loader.get_template('main/prospero/settings.html')
    return HttpResponse(template.render(context, request))

def widgets(request):
    template = loader.get_template('main/prospero/widgets.html')
    context = {}
    return HttpResponse(template.render(context, request))
