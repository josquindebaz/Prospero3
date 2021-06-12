from main.ajax.project import *

def callService(name, data, request):
    print("> call service", name)
    results = {}
    globals()[name](request, data, results)
    return results