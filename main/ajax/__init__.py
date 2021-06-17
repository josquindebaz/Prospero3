from main.ajax.frontend import *
from main.ajax.interop import *

def callService(name, data, request):
    print("> call service", name)
    results = {}
    globals()[name](request, data, results)
    return results