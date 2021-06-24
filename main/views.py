from prospero import settings
from main.models import *
from django.http import HttpResponse
from django.template import loader
from main import ajax
from django.views.decorators.csrf import csrf_exempt
from main.helpers import cloud, files
import json, ntpath, time

def createContext(request):
    context = {
        'MEDIA_URL': settings.MEDIA_URL,
        'ROOT_URL': settings.ROOT_URL,
        'DEBUG' : settings.DEBUG
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
        #timestamp = str(time.time())
        #relativeFileFolder = 'upload/'+timestamp+'/'
        #fileFolder = settings.MEDIA_ROOT + relativeFileFolder
        #files.gotFolder(fileFolder)
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
        results['status'] = "OK"
        return HttpResponse(
            json.dumps(results),
            content_type = 'application/javascript'
        )
    else:
        raise Http404("")

def project(request):
    template = loader.get_template('main/prospero/project.html')
    context = createContext(request)
    project = Project.objects.all()[0]
    context["project"] = json.dumps(project.serializeIdentity())
    return HttpResponse(template.render(context, request))

def projects_list(request):
    template = loader.get_template('main/prospero/projects_list.html')
    context = createContext(request)
    projects = []
    for p in Project.objects.all():
        projects.append(json.dumps(p.serializeIdentity()))
    context["projects"] = projects
    return HttpResponse(template.render(context, request))

def projects_mosaic(request):
    template = loader.get_template('main/prospero/projects_mosaic.html')
    context = createContext(request)
    projects = []
    for p in Project.objects.all():
        projects.append(json.dumps(p.serializeIdentity()))
    context["projects"] = projects
    return HttpResponse(template.render(context, request))

def widgets(request):
    template = loader.get_template('main/prospero/widgets.html')
    context = {}
    return HttpResponse(template.render(context, request))
