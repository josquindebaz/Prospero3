from main.importerP1 import reader

def add(parent, propertyName, elt):
    parent[propertyName].append(elt)

def set(parent, propertyName, elt):
    parent[propertyName] = elt

def createFictionDictionnary(name):
    return {
        "type" : "FictionDictionnary",
        "name" : name,
        "elements" : []
    }

def createCollectionDictionnary(name):
    return {
        "type" : "CollectionDictionnary",
        "name" : name,
        "elements" : []
    }

def createCategoryDictionnary(name):
    return {
        "type" : "CategoryDictionnary",
        "name" : name,
        "elements" : []
    }

def createLexicalDictionnary(name, lang):
    return {
        "type" : "LexicalDictionnary",
        "name" : name,
        "lang" : lang,
        "elements" : []
    }

def createProject(name):
    return {
        "name" : name,
        "dicPath": None,
        "ficPath": None,
        "catPath": None,
        "colPath": None,
        "language" : None,
        "texts" : []
    }

def createDictPackage(name):
    pck = {
        "type" : "DictPackage",
        "name" : name,
        "elements" : []
    }
    return pck

def createDictElement(name):
    return reader.normalizeDictElementValue(name)

def createPResource(name):
    return name

def createEntity(type, name, dico):
    entity = {
        "type" : type,
        "name" : name,
        "elements" : []
    }
    dico["elements"].append(entity)
    return entity

def createFiction(name):
    entity = {
        "type" : "Fiction",
        "name" : name,
        "elements" : []
    }
    return entity

def createCollection(name):
    entity = {
        "type" : "Collection",
        "name" : name,
        "elements" : []
    }
    return entity

def createCategory(name, type):
    entity = {
        "type" : "Category",
        "catType" : type,
        "name" : name,
        "elements" : []
    }
    return entity

def createText(path, metaDatas, associatedData):
    return {
        "path" : path,
        "metaDatas" : metaDatas,
        "associatedData" : associatedData
    }

def createMetaData(name, type, value):
    return {
        "name" : name,
        "type" : type,
        "value" : value
    }
