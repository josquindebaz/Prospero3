from main.ajax.frontend import *
from main.ajax.interop import *
from main.ajax.tagsManager import *

def callService(name, data, request):
    print("> call service", name)
    results = {}
    globals()[name](request, data, results)
    return results