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
    user = sessions.getCurrentUser(request)
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
        files = []
        for key in request.FILES:
            data = request.FILES[key]
            fileName = data.name
            filePath = fileFolder + fileName
            filePath = cloud.findAvailableAbsolutePath(filePath)
            with open(filePath, 'wb+') as destination:
                for chunk in data.chunks():
                    destination.write(chunk)
            fileName = ntpath.basename(filePath)
            result = {}
            result['fileName'] = fileName
            result['filePath'] = relativeFileFolder + fileName
            result['fileUrl'] = "/media_site/"+relativeFileFolder + fileName
            files.append(result)
        results["files"] = files
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
    pageData = sessions.getPageData(request, context)
    if str(pageData["currentProjectId"]) != str(id):
        pageData["currentProjectId"] = str(id)
        sessions.setProjectsData(request, pageData)
    project = sessions.computeCurrentProject(pageData, request, context)
    #context["projectData"] = project.serializeDataDef()
    context["projectData"] = project.serializeIdentity()
    user = context["user"]
    sessions.computeUserData(user, project, context)
    project.declareAsOpened()
    template = loader.get_template('main/prospero/project.html')
    return HttpResponse(template.render(context, request))

def projects_list(request):
    context = createContext(request)
    context["page"] = "projects-list"
    pageData = sessions.getPageData(request, context)
    project = sessions.computeCurrentProject(pageData, request, context)
    if project:
        context["projectRights"] = UserRight.objects.filter(project=project)
        context["projectData"] = project.serializeDataDef()
    pagination = {
        "frameSize": 30,
        "page": 0,
        "end": False
    }
    context["pagination"] = pagination
    user = context["user"]
    context["projects"] = queries.getProjects(pagination, pageData, user)
    sessions.computeUserData(user, project, context)
    template = loader.get_template('main/prospero/projects-list.html')
    return HttpResponse(template.render(context, request))

def projects_mosaic(request):
    context = createContext(request)
    context["page"] = "projects-mosaic"
    pageData = sessions.getPageData(request, context)
    project = sessions.computeCurrentProject(pageData, request, context)
    if project:
        context["projectRights"] = UserRight.objects.filter(project=project)
        context["projectData"] = project.serializeDataDef()
    pagination = {
        "frameSize": 30,
        "page": 0,
        "end": False
    }
    context["pagination"] = pagination
    user = context["user"]
    context["projects"] = queries.getProjects(pagination, pageData, user)
    sessions.computeUserData(user, project, context)
    template = loader.get_template('main/prospero/projects-mosaic.html')
    return HttpResponse(template.render(context, request))

def settingsView(request):
    context = createContext(request)
    context["page"] = "settings"
    pageData = sessions.getPageData(request, context)
    project = sessions.computeCurrentProject(pageData, request, context)
    #if project:
    #    context["projectData"] = project.serializeDataDef()
    user = context["user"]
    if not user.isAdministrator:
        raise Http404("access denied")
    sessions.computeUserData(user, project, context)
    #context["session"] = pageData
    template = loader.get_template('main/prospero/settings.html')
    return HttpResponse(template.render(context, request))

def widgets(request):
    template = loader.get_template('main/prospero/widgets.html')
    context = {}
    return HttpResponse(template.render(context, request))
