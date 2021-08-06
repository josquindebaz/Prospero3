from prospero import settings
from main.models import *
from main.importerP1 import builder2BD as builder
from main.importerP1 import importer
from main.helpers import frontend, files, cloud
from datetime import datetime

def importData(request, data, results):
    folder = files.gotFolder(settings.MEDIA_ROOT + data["files"][0]["filePath"])
    try:
        project = frontend.getBDObject(data["project"])
        corpus = frontend.getBDObject(data["corpus"]) if data["corpus"] != None else None
        createdObjects = importer.importData(project, folder, corpus, builder)
        createdDatas = {
            "LexicalDictionaries" : 0,
            "CategoryDictionaries": 0,
            "CollectionDictionaries": 0,
            "FictionDictionaries": 0,
            "Texts": 0,
        }
        if len(createdObjects) > 0:
            project.declareAsModified()
        for obj in createdObjects:
            objType = type(obj)
            if objType == LexicalDictionnary:
                createdDatas["LexicalDictionaries"] = createdDatas["LexicalDictionaries"] + 1
            elif objType == CategoryDictionnary:
                createdDatas["CategoryDictionaries"] = createdDatas["CategoryDictionaries"] + 1
            elif objType == CollectionDictionnary:
                createdDatas["CollectionDictionaries"] = createdDatas["CollectionDictionaries"] + 1
            elif objType == FictionDictionnary:
                createdDatas["FictionDictionaries"] = createdDatas["FictionDictionaries"] + 1
            elif objType == PText:
                createdDatas["Texts"] = createdDatas["Texts"] + 1
        results["createdDatas"] = createdDatas
    except Exception as e:
        errorTxt = str(e)
        if e.file:
            errorTxt = "for file "+e.file+" : "+errorTxt
        results["serverError"] = errorTxt
    files.deleteFile(folder)

def exportData(request, data, results):
    print(data)
    project = frontend.getBDObject(data["project"])
    exportContext = data["context"]
    exportType = data["type"]
    exportChoice = data["choice"] # entireProject | onlySelectedDictionaries | onlyCorpusTexts | onlySelectedTexts
    objects = []
    if exportChoice == "entireProject":
        objects.append(project)
    else:
        for identity in exportContext[exportChoice]:
            objects.append(frontend.getBDObject(identity))
    print("EXPORT")
    print(objects)
    fileFolder = cloud.getStampedCloudFolder("export")
    relativeUrlFolder = cloud.getMediaRelativeUrl(fileFolder)
    if exportType == "P1":
        from main.exporterP1 import exporter2P1 as exporter
        zipFileName = exporter.export(fileFolder, objects, project)
        results["filePath"] = relativeUrlFolder + zipFileName
    else:
        from main.exporterP1 import jsonSerializer as exporter
        result = []
        for obj in objects:
            result.append(exporter.serialize(obj))
        if len(result) == 1:
            result = result[0]
        result = json.dumps(result, indent=4)
        fileName = "JsonExport-"+datetime.now().strftime('%d-%m-%Y')+".json"
        filePath = fileFolder + fileName
        files.writeFile(filePath, result)
        results["filePath"] = relativeUrlFolder + fileName