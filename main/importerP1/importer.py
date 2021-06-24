import ntpath, os
from main.helpers import files
from main.importerP1 import reader

# import all P1 files in folder (unzip on the fly root zips)
def importData(project, rootFolder, corpus, builder):
    importedObjects = []
    # unzip if necessary
    for file in files.getAllFiles(rootFolder):
        if files.getFileExtension(file) == "zip":
            #extractionFolderName = files.getFileName(file, withExtension=False)+"/"
            #extractionFolder = files.gotFolder(files.gotFolder(file)+extractionFolderName)
            extractionFolder = files.gotFolder(file)
            files.extratZIP(file, extractionFolder)
    # treat files
    for filePath in files.getAllFiles(rootFolder, True):
        fileName = ntpath.basename(filePath)
        extension = fileName.split(".")[-1].lower()
        if extension in ["dic", "col", "fic", "cat"]:
            print("walk " + extension, filePath)
            dico = walk(filePath, rootFolder, builder)
            importedObjects.append(dico)
            builder.add(project, "dictionnaries", dico)
        elif extension == "txt":
            print("walk txt", filePath)
            text = walk(filePath, rootFolder, builder)
            importedObjects.append(text)
            ctxPath = findCtxFile(filePath)
            if ctxPath:
                print("walk ctx", ctxPath)
                metaDatas, associatedDatas, requiredDatas, identCtxP1 = walk(ctxPath, rootFolder, builder)
                importedObjects.extend(metaDatas)
                importedObjects.extend(associatedDatas)
                for data in metaDatas:
                    builder.add(text, "metaDatas", data)
                for data in associatedDatas:
                    builder.add(text, "associatedDatas", data)
                for fieldName in requiredDatas:
                    builder.set(text, fieldName, requiredDatas[fieldName])
                builder.set(text, "identCtxP1", identCtxP1)
            if corpus == None:
                corpus = project.gotDefaultCorpus()
                importedObjects.append(corpus)
            corpus.texts.add(text)
    return importedObjects

def findCtxFile(txtFile):
    fileName = files.getFileName(txtFile, False)
    folder = files.gotFolder(txtFile)
    for file in files.findFilesWithExtension(folder, "ctx"):
        if files.getFileName(file, False).lower() == fileName.lower():
            return folder+file

p1CatTypeTranslation = {
    "ENTITE" : "ENTITY",
    "MARQUEUR" : "MARKER",
    "EPREUVE" : "VERB",
    "QUALITE" : "QUALITY",
}

def walk(filePath, rootFolder, builder):
    print("walk file", filePath)
    fileName = ntpath.basename(filePath)
    extension = fileName.split(".")[-1].lower()
    if extension == "dic":
        return walkSyntaxicalDict(filePath, rootFolder, builder)
    elif extension == "col":
        return walkSemanticDict(filePath, rootFolder, builder.createCollectionDictionnary, builder.createCollection, builder)
    elif extension == "fic":
        return walkSemanticDict(filePath, rootFolder, builder.createFictionDictionnary, builder.createFiction, builder)
    elif extension == "cat":
        return walkCategoryDict(filePath, rootFolder, builder)
    elif extension == "ctx":
        return walkMetaData(filePath, rootFolder, builder)
    elif extension == "prc":
        return walkProject(filePath, rootFolder, builder)
    elif extension == "txt":
        return walkText(filePath, rootFolder, builder)
    else:
        raise Exception("extension not supported")

def walkSyntaxicalDict(filePath, rootFolder, builder):
    fileName = ntpath.basename(filePath)
    tab = fileName.split("_")
    dico = builder.createLexicalDictionnary(tab[1].split(".")[0], tab[0])
    relPath = files.getRelativePath(files.gotFolder(filePath), rootFolder)
    builder.set(dico, "filePath", relPath)
    text = files.readFile(filePath, detectEncoding=True)
    for x in reader.splitLines(text):
        if x == "ENDFILE":
            break
        elt = builder.createDictElement(x)
        builder.add(dico, "elements", elt)
    return dico

def walkSemanticDict(filePath, rootFolder, createDictionnaryFunc, createEntityFunc, builder):
    fileName = ntpath.basename(filePath)
    dico = createDictionnaryFunc(fileName.split(".")[0])
    relPath = files.getRelativePath(files.gotFolder(filePath), rootFolder)
    builder.set(dico, "filePath", relPath)
    text = files.readFile(filePath, detectEncoding=True)
    lines = reader.splitLines(text)
    identP1 = lines.pop(0)
    builder.set(dico, "identP1", identP1)
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
                elt = elt[:-1] # remove last char : @ or * depending of dictionary type
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

def walkCategoryDict(filePath, rootFolder, builder):
    fileName = ntpath.basename(filePath)
    dico = builder.createCategoryDictionnary(fileName.split(".")[0])
    relPath = files.getRelativePath(files.gotFolder(filePath), rootFolder)
    builder.set(dico, "filePath", relPath)
    text = files.readFile(filePath, detectEncoding=True)
    lines = reader.splitLines(text)
    identP1 = lines.pop(0)
    builder.set(dico, "identP1", identP1)
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

def walkMetaData(filePath, rootFolder, builder):
    text = files.readFile(filePath, detectEncoding=True)
    lines = reader.splitLines(text, keepVoidLines=True)
    identCtxP1 = lines.pop(0)
    data = []
    value = lines.pop(0).strip()
    requiredDatas = {}
    if value: # required
        requiredDatas["title"] = value
    value = lines.pop(0).strip()
    if value: # required
        requiredDatas["author"] = value
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("narrator", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("recipient", "String", value))
    value = lines.pop(0).strip()
    if value: # required
        requiredDatas["date"] = value
    value = lines.pop(0).strip()
    if value: # required
        requiredDatas["source"] = value
        #data.append(builder.createMetaData("publicationName", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("publicationType", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("observation", "Text", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("authorStatus", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("issuePlace", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("freeField1", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("freeField2", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("calculation1", "Boolean", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("calculation2", "Boolean", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("hour", "Hour", value))
    associatedData = []
    while len(lines) > 0:
        line = lines.pop(0)
        if line.startswith("REF_EXT:"):
            associatedData.append(builder.createPResource(line[8:]))
    return data, associatedData, requiredDatas, identCtxP1

def walkText(filePath, rootFolder, builder):
    fileName = ntpath.basename(filePath)
    text = files.readFile(filePath, detectEncoding=True)
    text = builder.createPText(text)
    builder.set(text, "fileName", fileName)
    relPath = files.getRelativePath(files.gotFolder(filePath), rootFolder)
    builder.set(text, "filePath", relPath)
    return text

def walkProject(filePath, rootFolder, builder):
    fileName = ntpath.basename(filePath)
    project = builder.createProject(fileName.split(".")[0])
    text = files.readFile(filePath, detectEncoding=True)
    lines = reader.splitLines(text)
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
            text = walk(textPath, rootFolder, builder)
            # get ctx file and set augmentedDatas
            ctxPath = findCtxFile(textPath)
            if ctxPath:
                metaDatas, associatedDatas, requiredDatas, identCtxP1 = walk(ctxPath, rootFolder, builder)
                for data in metaDatas:
                    builder.add(text, "metaDatas", data)
                for data in associatedDatas:
                    builder.add(text, "associatedDatas", data)
                for fieldName in requiredDatas:
                    builder.set(text, fieldName, requiredDatas[fieldName])
                builder.set(text, "identCtxP1", identCtxP1)
            builder.add(defaultCorpus, "corpuses", text)
        else:
            break
    return project