import ntpath, os
from main.helpers import files
from main.importerP1 import reader

# import all P1 files in folder (unzip on the fly root zips)
def importData(project, folder, builder):
    defaultCorpus = project.getDefaultCorpus()
    importedObjects = []
    # unzip if necessary
    for file in files.getAllFiles(folder):
        if files.getFileExtension(file) == "zip":
            extractionFolderName = files.getFileName(file, withExtension=False)+"/"
            extractionFolder = files.gotFolder(files.gotFolder(file)+extractionFolderName)
            files.extratZIP(file, extractionFolder)
    # treat files
    for filePath in files.getAllFiles(folder, True):
        fileName = ntpath.basename(filePath)
        extension = fileName.split(".")[-1].lower()
        if extension in ["dic", "col", "fic", "cat"]:
            print("walk " + extension, filePath)
            file = open(filePath, 'r')
            dico = walk(file, builder)
            importedObjects.append(dico)
            builder.add(project, "dictionnaries", dico)
        elif extension == "txt":
            print("walk txt", filePath)
            file = open(filePath, 'r')
            text = walk(file, builder)
            importedObjects.append(text)
            ctxPath = findCtxFile(filePath)
            if ctxPath:
                print("walk ctx", ctxPath)
                ctxFile = open(ctxPath, "r")
                metaDatas, associatedDatas = walk(ctxFile, builder)
                importedObjects.extend(metaDatas)
                importedObjects.extend(associatedDatas)
                for data in metaDatas:
                    builder.add(text, "metaDatas", data)
                for data in associatedDatas:
                    builder.add(text, "associatedDatas", data)
            defaultCorpus.texts.add(text)
    return importedObjects

def findCtxFile(txtFile):
    fileName = files.getFileName(txtFile, False)
    folder = files.gotFolder(txtFile)
    for file in files.findFilesWithExtension(folder, "ctx"):
        if files.getFileName(file, False) == fileName:
            return folder+file

p1CatTypeTranslation = {
    "ENTITE" : "ENTITY",
    "MARQUEUR" : "MARKER",
    "EPREUVE" : "VERB",
    "QUALITE" : "QUALITY",
}

def walk(file, builder):
    print("walk file", file.name)
    fileName = ntpath.basename(file.name)
    extension = fileName.split(".")[-1].lower()
    if extension == "dic":
        return walkSyntaxicalDict(file, builder)
    elif extension == "col":
        return walkSemanticDict(file, builder.createCollectionDictionnary, builder.createCollection, builder)
    elif extension == "fic":
        return walkSemanticDict(file, builder.createFictionDictionnary, builder.createFiction, builder)
    elif extension == "cat":
        return walkCategoryDict(file, builder)
    elif extension == "ctx":
        return walkMetaData(file, builder)
    elif extension == "prc":
        return walkProject(file, builder)
    elif extension == "txt":
        return walkText(file, builder)
    else:
        raise Exception("extension not supported")

def walkSyntaxicalDict(file, builder):
    fileName = ntpath.basename(file.name)
    tab = fileName.split("_")
    dico = builder.createLexicalDictionnary(tab[1].split(".")[0], tab[0])
    for x in reader.getFileLines(file):
        if x == "ENDFILE":
            break
        elt = builder.createDictElement(x)
        builder.add(dico, "elements", elt)
    return dico

def walkSemanticDict(file, createDictionnaryFunc, createEntityFunc, builder):
    fileName = ntpath.basename(file.name)
    dico = createDictionnaryFunc(fileName.split(".")[0])
    lines = reader.getFileLines(file)
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
                entity = createEntityFunc(elt)
                builder.add(current, "elements", entity)
                current = entity
                state = "FICTION"
        elif state == "FICTION":
            elt = lines.pop(0)
            if elt == "ENDFICTION":
                state = "IDLE"
                current = currentStack.pop()
            else:
                currentStack.append(current)
                pck = builder.createDictPackage(elt)
                builder.add(current, "elements", pck)
                current = pck
                state = "PCK"
        elif state == "PCK":
            elt = lines.pop(0)
            if elt == "END":
                state = "FICTION"
                current = currentStack.pop()
            else:
                elt = builder.createDictElement(elt)
                builder.add(current, "elements", elt)
    return dico

def walkCategoryDict(file, builder):
    fileName = ntpath.basename(file.name)
    dico = builder.createCategoryDictionnary(fileName.split(".")[0])
    lines = reader.getFileLines(file)
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
                if catType in p1CatTypeTranslation:
                    catType = p1CatTypeTranslation[catType]
                elt = lines.pop(0)
                category = builder.createCategory(elt)
                builder.set(category, "type", catType)
                builder.add(current, "elements", category)
                current = category
                state = "CATEGORY"
        elif state == "CATEGORY":
            elt = lines.pop(0)
            if elt == "END":
                state = "IDLE"
                lines.pop(0) # avoid ENDCAT
                current = currentStack.pop()
            else:
                elt = builder.createDictElement(elt)
                builder.add(current, "elements", elt)
    return dico

def walkMetaData(file, builder):
    lines = reader.getFileLines(file, keepVoidLines=True)
    lines.pop(0)
    data = []
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("titre", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("auteur", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("narrateur", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("destinataire", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("date", "Date", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("nomPublication", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("typePublication", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("observation", "Text", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("statutAuteur", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("lieuEmission", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("champLibre1", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("champLibre2", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("calcul1", "Boolean", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("calcul2", "Boolean", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("heureMin", "Hour", value))
    associatedData = []
    while len(lines) > 0:
        line = lines.pop(0)
        if line.startswith("REF_EXT:"):
            associatedData.append(builder.createPResource(line[8:]))
    return data, associatedData

def walkText(file, builder):
    return builder.createPText(file.read())

def walkProject(file, builder):
    fileName = ntpath.basename(file.name)
    project = builder.createProject(fileName.split(".")[0])
    lines = reader.getFileLines(file)
    lines.pop(0)
    builder.set(project, "dicPath", lines.pop(0))
    builder.set(project, "ficPath", lines.pop(0))
    builder.set(project, "catPath", lines.pop(0))
    builder.set(project, "colPath", lines.pop(0))
    builder.set(project, "language", lines.pop(0))
    defaultCorpus = builder.get(project, "corpuses")[0]
    while True:
        if len(lines) > 0:
            textPath = lines.pop(0)
            if textPath == "ENDFILE":
                break
            # create PText
            textFile = open(textPath, "r")
            text = walk(textFile, builder)
            # get ctx file and set augmentedDatas
            ctxPath = findCtxFile(textPath)
            if ctxPath:
                ctxFile = open(ctxPath, "r")
                metaDatas, associatedDatas = walk(ctxFile, builder)
                for data in metaDatas:
                    builder.add(text, "metaDatas", data)
                for data in associatedDatas:
                    builder.add(text, "associatedDatas", data)
            builder.add(defaultCorpus, "corpuses", text)
        else:
            break
    return project