from main.importerP1 import reader

def add(parent, propertyName, elt):
    parent[propertyName].append(elt)

def set(parent, propertyName, elt):
    parent[propertyName] = elt

def createFictionDictionnary(name):
    return {
        "model" : "FictionDictionnary",
        "name" : name,
        "elements" : []
    }

def createCollectionDictionnary(name):
    return {
        "model" : "CollectionDictionnary",
        "name" : name,
        "elements" : []
    }

def createCategoryDictionnary(name):
    return {
        "model" : "CategoryDictionnary",
        "name" : name,
        "elements" : []
    }

def createLexicalDictionnary(name, language):
    return {
        "model" : "LexicalDictionnary",
        "name" : name,
        "lang" : language,
        "elements" : []
    }

def createProject(name):
    obj = {
        "model" : "Project",
        "name" : name,
        "dicPath": None,
        "ficPath": None,
        "catPath": None,
        "colPath": None,
        "language" : None,
        "corpuses" : []
    }
    corpus = createPCorpus("main")
    obj["corpuses"].append(corpus)
    return obj

def createDictPackage(name):
    pck = {
        "model" : "DictPackage",
        "name" : name,
        "elements" : []
    }
    return pck

def createDictElement(value):
    return reader.normalizeDictElementValue(value)

def createPResource(uri):
    return uri

def createFiction(name):
    entity = {
        "model" : "Fiction",
        "name" : name,
        "elements" : []
    }
    return entity

def createCollection(name):
    entity = {
        "model" : "Collection",
        "name" : name,
        "elements" : []
    }
    return entity

def createCategory(name):
    entity = {
        "model" : "Category",
        "name" : name,
        "type" : None,
        "elements" : []
    }
    return entity

def createPText(text):
    return {
        "model": "PText",
        "text" : text,
        "metaDatas" : [],
        "associatedDatas" : []
    }

def createPCorpus(name):
    return {
        "model": "PCorpus",
        "name" : name,
        "texts" : []
    }

def createMetaData(name, type, value):
    return {
        "model" : "MetaData",
        "name" : name,
        "type" : type,
        "value" : value
    }
