import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'prospero.settings'
import django
django.setup()
from prospero import settings
from main.models import *
import pprint

import ntpath
import json

"""
questions 25/05/2021 :
    la langue sur le projet ou sur un dico car le .dic définit la langue
    pour les .dic : jamais de packages, seulement une liste d'éléments ?
    on peut striper l'ensemble des éléments ?
    ... correspond à la racine d'un point de vue représentation ?
"""
"""
questions 26/05/2021 :     
    - faut-il garder les éléments à l'identique en base, car si on exporte vers Prospéro I, on est plus iso ...
        => on verra        
    - un exemple de projet dont il manque un dico sémantique => voir si le CR code pour une valeur nulle
        => ligne vide
"""
"""
    NB : les lignes vides
"""

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

def getFileLines(file, keepVoidLines=False):
    lines = []
    text = file.read()
    for x in text.split("\n"):
        x = x.strip()
        if x or keepVoidLines:
            lines.append(x)
    return lines

def importSyntaxicalDict(file):
    fileName = ntpath.basename(file.name)
    tab = fileName.split("_")
    dico = createDictionnary("SyntaxicDictionnary", tab[1].split(".")[0], None)
    pck = createDictPackage("", dico)
    for x in getFileLines(file):
        if x == "ENDFILE":
            break
        x = x.replace(" ' ", "'")
        createDictElement(x, pck)
    return dico

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

def importSemanticDict(file, createEntityFunc):
    fileName = ntpath.basename(file.name)
    dico = createDictionnary("FictionEntityDictionnary", fileName.split(".")[0])
    lines = getFileLines(file)
    lines.pop(0)
    state = "IDLE"
    currentStack = []
    current = dico
    while lines:
        if state == "IDLE":
            elt = lines.pop(0)
            if elt == "ENDFILE":
                break
            else:
                elt = lines.pop(0)  # avoid FICTION keyword
                currentStack.append(current)
                current = createEntityFunc(elt, current)
                state = "FICTION"
        elif state == "FICTION":
            elt = lines.pop(0)
            if elt == "ENDFICTION":
                state = "IDLE"
                current = currentStack.pop()                
            else:
                currentStack.append(current)
                current = createDictPackage(elt, current)
                state = "PCK"
        elif state == "PCK":
            elt = lines.pop(0)
            if elt == "END":
                state = "FICTION"
                current = currentStack.pop()
            else:
                createDictElement(elt, current)
    return dico

def importCategoryDict(file):
    fileName = ntpath.basename(file.name)
    dico = createDictionnary("CategoryDictionnary", fileName.split(".")[0])
    lines = getFileLines(file)
    lines.pop(0)
    state = "IDLE"
    currentStack = []
    current = dico
    while lines:
        if state == "IDLE":
            elt = lines.pop(0)
            if elt == "ENDFILE":
                break
            else:
                currentStack.append(current)
                catType = elt.replace("*", "")
                elt = lines.pop(0)
                current = createCategoryEntity(elt, catType, current)
                state = "CATEGORY"
        elif state == "CATEGORY":
            elt = lines.pop(0)
            if elt == "END":
                state = "IDLE"
                lines.pop(0) # avoid ENDCAT
                current = currentStack.pop()
            else:
                createDictElement(elt, current)
    return dico

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

def importMetaData(file):
    lines = getFileLines(file, keepVoidLines=True)
    lines.pop(0)
    data = []
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("titre", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("auteur", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("narrateur", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("destinataire", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("date", "Date", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("nomPublication", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("typePublication", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("observation", "Text", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("statutAuteur", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("lieuEmission", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("champLibre1", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("champLibre2", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("calcul1", "Boolean", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("calcul2", "Boolean", value))
    value = lines.pop(0).strip()
    if value:
        data.append(createMetaData("heureMin", "Hour", value))
    return data, lines

def importProject(file):
    fileName = ntpath.basename(file.name)
    project = createProject(fileName.split(".")[0])
    lines = getFileLines(file)
    lines.pop(0)
    project["dicPath"] = lines.pop(0)
    project["ficPath"] = lines.pop(0)
    project["catPath"] = lines.pop(0)
    project["colPath"] = lines.pop(0)
    project["language"] = lines.pop(0)
    while True:
        if len(lines) > 0:
            textPath = lines.pop(0)
            if textPath == "ENDFILE":
                break
            textPath = normalizePath(textPath)
            path = os.path.dirname(textPath)+"/"
            fileName = ntpath.basename(textPath)
            tab = fileName.split(".")
            tab[len(tab)-1] = "CTX"
            fileName = ".".join(tab)
            ctxFile = open(path + fileName)
            data, lines = importMetaData(ctxFile)


            associatedData = []
            while len(lines) > 0:
                line = lines.pop(0)
                if line.startswith("REF_EXT:"):
                    associatedData.append(line[8:])
            text = createText(textPath, data, associatedData)
            project["texts"].append(text)
        else:
            break


    return project

def normalizePath(path):
    path = path.replace("\\", "/")
    if path.startswith(repoFolderEquivalent):
        path = repoFolder + path[len(repoFolderEquivalent):]
    return path

def dumpStructuredData(data, fileName):
    res = json.dumps(data, indent=4)
    file = open(repoFolder + fileName, "w")
    file.write(res)
    file.close()

repoFolder = "data2Import/"
repoFolderEquivalent = "C:/corpus/"

#data = importMetaData(open(repoFolder+"TC/taxe_carbone_web.CTX"))

data = importSyntaxicalDict(open(repoFolder+"TC/1-dico/fr_epreu.dic"))
dumpStructuredData(data, "dic.txt")

data = importSemanticDict(open(repoFolder+"TC/1-dico/GdS.fic"), createFicitveEntity)
dumpStructuredData(data, "fic.txt")

data = importSemanticDict(open(repoFolder+"TC/1-dico/GdS.col"), createConceptEntity)
dumpStructuredData(data, "col.txt")

data = importCategoryDict(open(repoFolder+"TC/1-dico/GdS.cat"))
dumpStructuredData(data, "cat.txt")

data = importProject(open(repoFolder+"TC/tc-presse.prc"))
dumpStructuredData(data, "prc.txt")
