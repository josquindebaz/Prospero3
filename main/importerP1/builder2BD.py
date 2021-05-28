from main.importerP1 import reader
from main.models import *

def add(parent, propertyName, elt):
    parent[propertyName].append(elt)

def set(parent, propertyName, elt):
    parent[propertyName] = elt

def createFictionDictionnary(name):
    obj = FictionDictionnary(name=name)
    obj.save()
    return obj

def createCollectionDictionnary(name):
    obj = CollectionDictionnary(name=name)
    obj.save()
    return obj

def createCategoryDictionnary(name):
    obj = CategoryDictionnary(name=name)
    obj.save()
    return obj

def createLexicalDictionnary(name, language):
    obj = LexicalDictionnary(name=name, language=language)
    obj.save()
    return obj

def createProject(name):
    obj = Project(name=name)
    obj.save()
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

def createPResource(uri):
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

def createCategory(name, type):
    obj = Category(name=name)
    obj.save()
    return obj

def createPText(path, metaDatas, associatedDatas):
    obj = PText(text=path, metaDatas=metaDatas, associatedData=associatedData)
    obj.save()
    for metaData in metaDatas:
        obj.metaDatas.add(metaData)
    for associatedData in associatedDatas:
        obj.associatedDatas.add(associatedData)
    return obj

def createMetaData(name, type, value):
    obj = MetaData(name=name, type=type, value=value)
    obj.save()
    return obj