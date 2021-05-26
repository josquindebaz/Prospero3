import json

def dumpStructuredData(data, filePath):
    res = json.dumps(data, indent=4)
    file = open(filePath, "w")
    file.write(res)
    file.close()
