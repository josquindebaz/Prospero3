from main.importerP1 import reader
from main.models import *
from main.helpers import files

def add(parent, propertyName, elt):
    getattr(parent, propertyName).add(elt)

def set(parent, propertyName, elt):
    setattr(parent, propertyName, elt)
    parent.save()

def createFictionDictionnary(name):
    obj = FictionDictionnary(name=name, type="FictionDict")
    obj.save()
    return obj

def createCollectionDictionnary(name):
    obj = CollectionDictionnary(name=name, type="CollectionDict")
    obj.save()
    return obj

def createCategoryDictionnary(name):
    obj = CategoryDictionnary(name=name, type="CategoryDict")
    obj.save()
    return obj

def createLexicalDictionnary(name, language):
    obj = LexicalDictionnary(name=name, language=language, type="SyntaxicDict")
    obj.save()
    return obj

def createProject(name, owner=None):
    obj = Project(name=name, owner=owner)
    obj.save()
    defaultCorpus = createPCorpus("main")
    obj.corpuses.add(defaultCorpus)
    return obj

def createDictPackage(name):
    obj = DictPackage(name=name)
    obj.save()
    return obj

def createDictElement(value):
    value = reader.normalizeDictElementValue(value)
    obj = DictElement(value=value)
    obj.save()
    return obj

def findFile(pathP1, rootFolder):
    dirSeq = pathP1.replace("\\", "/").split("/")
    if ":" in dirSeq[0]:
        dirSeq = dirSeq[1:]
    fileName = dirSeq[-1]
    del dirSeq[-1]
    while len(dirSeq) > 0:
        pathCorrect = True
        currentFolder = rootFolder
        for folder in dirSeq:
            currentFolder = currentFolder + folder + "/"
            if not files.exists(currentFolder):
                pathCorrect = False
                break
        if pathCorrect:
            filePath = currentFolder + fileName
            if files.exists(filePath):
                return {
                    "filePath" : filePath,
                    "relPath" : "/".join(dirSeq) + "/" + fileName
                }
        del dirSeq[0]
    return None

def createPUri(uri):
    obj = PUri(uri=uri)
    obj.save()
    return obj

def createPFile(filePath):
    obj = PFile(file=filePath)
    obj.save()
    return obj

def createPResource(uri, importer=None):
    if uri[1:3] == ":\\":
        obj = PFile(pathP1=uri)
        obj.save()
        if importer:
            if uri in importer.processedFile:
                fileInfos = importer.processedFile[uri]
            else:
                fileInfos = findFile(uri, importer.rootFolder)
                if fileInfos:
                    source = fileInfos["filePath"]
                    target = importer.projectDataFolder + fileInfos["relPath"]
                    fileInfos["target"] = target
                    files.moveFile(source, target)
                    importer.processedFile[uri] = fileInfos
            if fileInfos:
                obj.file = fileInfos["target"]
                obj.save()
    else:
        obj = PUri(uri=uri)
        obj.save()
    return obj

def createFiction(name):
    obj = Fiction(name=name)
    obj.save()
    return obj

def createCollection(name):
    obj = Collection(name=name)
    obj.save()
    return obj

def createCategory(name):
    obj = Category(name=name)
    obj.save()
    return obj

def createPText(text):
    obj = PText(text=text)
    obj.save()
    return obj

def createPCorpus(name):
    obj = PCorpus(name=name)
    obj.save()
    return obj

def createMetaData(name, type, value):
    obj = MetaData(name=name, type=type, value=value)
    obj.save()
    return obj

def createPUser(username, first_name, last_name):
    obj = PUser(username=username, first_name=first_name, last_name=last_name)
    obj.save()
    return obj

def createPGroup(username):
    obj = PGroup(username=username)
    obj.save()
    return obj

def createUserRight(user, right, project):
    obj = UserRight(user=user, right=right, project=project)
    obj.save()
    return obj