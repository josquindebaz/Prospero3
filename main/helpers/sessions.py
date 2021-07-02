def getData(key, request, defaultData=None):
    try:
        data = request.session[key]
    except:
        if defaultData:
            data = defaultData
            setData(key, request, defaultData)
    return data

def setData(key, request, data):
    request.session[key] = data

def getProjectsData(request):
    return getData("projects", request, {
        "search" : "",
        "currentProjectId": "",
        "sort" : "title"
    })

def setProjectsData(request, data):
    setData("projects", request, data)
