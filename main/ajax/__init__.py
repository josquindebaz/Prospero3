from main.ajax.crud import *
from main.ajax.renders import *
from main.ajax.serializers import *
from main.ajax.queries import *
from main.ajax.interop import *
from main.ajax.tagsManager import *

def callService(name, data, request):
    print("> call service", name)
    results = {}
    globals()[name](request, data, results)
    return results