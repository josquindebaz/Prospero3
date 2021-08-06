import ntpath, os
from main.helpers import files, cloud
from main.importerP1 import reader

p1CatTypeTranslation = {
    "ENTITE" : "ENTITY",
    "MARQUEUR" : "MARKER",
    "EPREUVE" : "VERB",
    "QUALITE" : "QUALITY",
}

class Importer:

    def __init__(self, project, corpus, rootFolder, builder, *args, **kwargs):
        self.project = project
        self.corpus = corpus
        self.projectDataFolder = cloud.gotProjectDataFolder(project)
        self.rootFolder = rootFolder
        self.builder = builder
        self.processedFile = {}
        self.createdPResources = []

    # import all P1 files in folder (unzip on the fly root zips)
    def process(self):
        importedObjects = []
        # unzip if necessary, implemented for one zip only
        for file in files.getAllFiles(self.rootFolder):
            if files.getFileExtension(file) == "zip":
                # extractionFolderName = files.getFileName(file, withExtension=False)+"/"
                # extractionFolder = files.gotFolder(files.gotFolder(file)+extractionFolderName)
                extractionFolder = files.gotFolder(file)
                files.extratZIP(file, extractionFolder)
        # treat files
        #importer = Importer(rootFolder, self.builder, projectDataFolder)
        currentFile = None
        try:
            for filePath in files.getAllFiles(self.rootFolder, True):
                fileName = ntpath.basename(filePath)
                currentFile = fileName
                extension = fileName.split(".")[-1].lower()
                if extension in ["dic", "col", "fic", "cat"]:
                    print("walk " + extension, filePath)
                    dico = self.walk(filePath)
                    importedObjects.append(dico)
                    self.builder.add(self.project, "dictionnaries", dico)
                elif extension == "txt":
                    print("walk txt", filePath)
                    text = self.walk(filePath)
                    importedObjects.append(text)
                    ctxPath = self.findCtxFile(filePath)
                    if ctxPath:
                        currentFile = ntpath.basename(ctxPath)
                        print("walk ctx", ctxPath)
                        metaDatas, associatedDatas, requiredDatas, identCtxP1 = self.walk(ctxPath)
                        importedObjects.extend(metaDatas)
                        importedObjects.extend(associatedDatas)
                        for data in metaDatas:
                            self.builder.add(text, "metaDatas", data)
                        for data in associatedDatas:
                            self.builder.add(text, "associatedDatas", data)
                        for fieldName in requiredDatas:
                            self.builder.set(text, fieldName, requiredDatas[fieldName])
                        self.builder.set(text, "identCtxP1", identCtxP1)
                    if self.corpus == None:
                        self.corpus = self.project.gotDefaultCorpus()
                        importedObjects.append(self.corpus)
                    self.corpus.addText(text)
                    # corpus.texts.add(text)
        except Exception as e:
            e.file = currentFile
            raise e

        return importedObjects

    def findCtxFile(self, txtFile):
        fileName = files.getFileName(txtFile, False)
        folder = files.gotFolder(txtFile)
        for file in files.findFilesWithExtension(folder, "ctx"):
            if files.getFileName(file, False).lower() == fileName.lower():
                return folder+file

    def walk(self, filePath):
        print("walk file", filePath)
        fileName = ntpath.basename(filePath)
        extension = fileName.split(".")[-1].lower()
        if extension == "dic":
            return self.walkSyntaxicalDict(filePath)
        elif extension == "col":
            return self.walkSemanticDict(filePath, self.builder.createCollectionDictionnary, self.builder.createCollection)
        elif extension == "fic":
            return self.walkSemanticDict(filePath, self.builder.createFictionDictionnary, self.builder.createFiction)
        elif extension == "cat":
            return self.walkCategoryDict(filePath)
        elif extension == "ctx":
            return self.walkMetaData(filePath)
        elif extension == "prc":
            return self.walkProject(filePath)
        elif extension == "txt":
            return self.walkText(filePath)
        else:
            raise Exception("extension not supported")

    def walkSyntaxicalDict(self, filePath):
        fileName = ntpath.basename(filePath)
        tab = fileName.split("_")
        dico = self.builder.createLexicalDictionnary(tab[1].split(".")[0], tab[0])
        relPath = files.getRelativePath(files.gotFolder(filePath), self.rootFolder)
        self.builder.set(dico, "filePath", relPath)
        text = files.readFile(filePath, detectEncoding=True)
        for x in reader.splitLines(text):
            if x == "ENDFILE":
                break
            elt = self.builder.createDictElement(x)
            self.builder.add(dico, "elements", elt)
        return dico

    def walkSemanticDict(self, filePath, createDictionnaryFunc, createEntityFunc):
        fileName = ntpath.basename(filePath)
        dico = createDictionnaryFunc(fileName.split(".")[0])
        relPath = files.getRelativePath(files.gotFolder(filePath), self.rootFolder)
        self.builder.set(dico, "filePath", relPath)
        text = files.readFile(filePath, detectEncoding=True)
        lines = reader.splitLines(text)
        identP1 = lines.pop(0)
        self.builder.set(dico, "identP1", identP1)
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
                    self.builder.add(current, "elements", entity)
                    current = entity
                    state = "FICTION"
            elif state == "FICTION":
                elt = lines.pop(0)
                if elt == "ENDFICTION":
                    state = "IDLE"
                    current = currentStack.pop()
                else:
                    currentStack.append(current)
                    pck = self.builder.createDictPackage(elt)
                    self.builder.add(current, "elements", pck)
                    current = pck
                    state = "PCK"
            elif state == "PCK":
                elt = lines.pop(0)
                if elt == "END":
                    state = "FICTION"
                    current = currentStack.pop()
                else:
                    elt = self.builder.createDictElement(elt)
                    self.builder.add(current, "elements", elt)
        return dico

    def walkCategoryDict(self, filePath):
        fileName = ntpath.basename(filePath)
        dico = self.builder.createCategoryDictionnary(fileName.split(".")[0])
        relPath = files.getRelativePath(files.gotFolder(filePath), self.rootFolder)
        self.builder.set(dico, "filePath", relPath)
        text = files.readFile(filePath, detectEncoding=True)
        lines = reader.splitLines(text)
        identP1 = lines.pop(0)
        self.builder.set(dico, "identP1", identP1)
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
                    category = self.builder.createCategory(elt)
                    self.builder.set(category, "type", catType)
                    self.builder.add(current, "elements", category)
                    current = category
                    state = "CATEGORY"
            elif state == "CATEGORY":
                elt = lines.pop(0)
                if elt == "END":
                    state = "IDLE"
                    lines.pop(0) # avoid ENDCAT
                    current = currentStack.pop()
                else:
                    elt = self.builder.createDictElement(elt)
                    self.builder.add(current, "elements", elt)
        return dico

    def walkMetaData(self, filePath):
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
            data.append(self.builder.createMetaData("narrator", "String", value))
        value = lines.pop(0).strip()
        if value:
            data.append(self.builder.createMetaData("recipient", "String", value))
        value = lines.pop(0).strip()
        if value: # required
            requiredDatas["date"] = value
        value = lines.pop(0).strip()
        if value: # required
            requiredDatas["source"] = value
            #data.append(self.builder.createMetaData("publicationName", "String", value))
        value = lines.pop(0).strip()
        if value:
            data.append(self.builder.createMetaData("publicationType", "String", value))
        value = lines.pop(0).strip()
        if value:
            data.append(self.builder.createMetaData("observation", "Text", value))
        value = lines.pop(0).strip()
        if value:
            data.append(self.builder.createMetaData("authorStatus", "String", value))
        value = lines.pop(0).strip()
        if value:
            data.append(self.builder.createMetaData("issuePlace", "String", value))
        value = lines.pop(0).strip()
        if value:
            data.append(self.builder.createMetaData("freeField1", "String", value))
        value = lines.pop(0).strip()
        if value:
            data.append(self.builder.createMetaData("freeField2", "String", value))
        value = lines.pop(0).strip()
        if value:
            data.append(self.builder.createMetaData("calculation1", "Boolean", value))
        value = lines.pop(0).strip()
        if value:
            data.append(self.builder.createMetaData("calculation2", "Boolean", value))
        value = lines.pop(0).strip()
        if value:
            data.append(self.builder.createMetaData("hour", "Hour", value))
        associatedData = []
        while len(lines) > 0:
            line = lines.pop(0)
            if line.startswith("REF_EXT:"):
                ressource = self.builder.createPResource(line[8:], self)
                self.createdPResources.append(ressource)
                associatedData.append(ressource)
        return data, associatedData, requiredDatas, identCtxP1

    def walkText(self, filePath):
        fileName = ntpath.basename(filePath)
        text = files.readFile(filePath, detectEncoding=True)
        text = self.builder.createPText(text)
        self.builder.set(text, "fileName", fileName)
        relPath = files.getRelativePath(files.gotFolder(filePath), self.rootFolder)
        self.builder.set(text, "filePath", relPath)
        return text

    def walkProject(self, filePath):
        fileName = ntpath.basename(filePath)
        project = self.builder.createProject(fileName.split(".")[0])
        text = files.readFile(filePath, detectEncoding=True)
        lines = reader.splitLines(text)
        lines.pop(0)
        self.builder.set(project, "dicPath", lines.pop(0))
        self.builder.set(project, "ficPath", lines.pop(0))
        self.builder.set(project, "catPath", lines.pop(0))
        self.builder.set(project, "colPath", lines.pop(0))
        self.builder.set(project, "language", lines.pop(0))
        defaultCorpus = self.builder.get(project, "corpuses")[0]
        while True:
            if len(lines) > 0:
                textPath = lines.pop(0)
                if textPath == "ENDFILE":
                    break
                # create PText
                text = self.walk(textPath)
                # get ctx file and set augmentedDatas
                ctxPath = self.findCtxFile(textPath)
                if ctxPath:
                    metaDatas, associatedDatas, requiredDatas, identCtxP1 = self.walk(ctxPath)
                    for data in metaDatas:
                        self.builder.add(text, "metaDatas", data)
                    for data in associatedDatas:
                        self.builder.add(text, "associatedDatas", data)
                    for fieldName in requiredDatas:
                        self.builder.set(text, fieldName, requiredDatas[fieldName])
                    self.builder.set(text, "identCtxP1", identCtxP1)
                self.builder.add(defaultCorpus, "corpuses", text)
            else:
                break
        return project