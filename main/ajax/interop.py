from prospero import settings
from main.models import *
from django.template import loader
from main.importerP1 import builder2BD as builder
from main.importerP1 import importer
from main.helpers import frontend, files

def importData(request, data, results):
    print(data)
    folder = files.gotFolder(settings.MEDIA_ROOT + data["filePath"])

    try:
        project = frontend.getBDObject(data["project"])
        corpus = frontend.getBDObject(data["corpus"])
        createdObjects = importer.importData(project, folder, corpus, builder)
        createdDatas = {
            "LexicalDictionaries" : 0,
            "CategoryDictionaries": 0,
            "CollectionDictionaries": 0,
            "FictionDictionaries": 0,
            "Texts": 0,
        }
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
        results["serverError"] = str(e)
    files.deleteFile(folder)

def exportData(request, data, results):
    print(data)