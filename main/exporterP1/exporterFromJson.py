import json

def export(data, filePath):
    res = json.dumps(data, indent=4)
    file = open(filePath, "w")
    file.write(res)
    file.close()
