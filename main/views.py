from django.http import HttpResponse
from django.template import loader
from main import ajax
from django.views.decorators.csrf import csrf_exempt
import json

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

def index(request):
    template = loader.get_template('main/prospero/index.html')
    context = {}
    return HttpResponse(template.render(context, request))

def widgets(request):
    template = loader.get_template('main/prospero/widgets.html')
    context = {}
    return HttpResponse(template.render(context, request))
