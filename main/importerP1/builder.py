
def createDictionnary(type, name, lang=None):
    return {
        "type" : type,
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

def createDictPackage(name, parent):
    pck = {
        "type" : "DictPackage",
        "name" : name,
        "elements" : []
    }
    parent["elements"].append(pck)
    return pck

def createDictElement(name, pck):
    pck["elements"].append(name)

def createEntity(type, name, dico):
    entity = {
        "type" : type,
        "name" : name,
        "elements" : []
    }
    dico["elements"].append(entity)
    return entity

def createFicitveEntity(name, dico):
    entity = {
        "type" : "FictiveEntity",
        "name" : name,
        "elements" : []
    }
    dico["elements"].append(entity)
    return entity

def createConceptEntity(name, dico):
    entity = {
        "type" : "ConceptEntity",
        "name" : name,
        "elements" : []
    }
    dico["elements"].append(entity)
    return entity

def createCategoryEntity(name, type, dico):
    entity = {
        "type" : "CategoryEntity",
        "catType" : type,
        "name" : name,
        "elements" : []
    }
    dico["elements"].append(entity)
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
