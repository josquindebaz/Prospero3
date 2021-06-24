from datetime import datetime
from django.contrib.sessions.backends import file
from main.helpers import files, normalisation

bdCatTypeTranslation = {
    "ENTITY" : "ENTITE",
    "MARKER" : "MARQUEUR",
    "VERB" : "EPREUVE",
    "QUALITY" : "QUALITE",
}

#fileEncoding = "ISO-8859-1"
fileEncoding = "utf-8"

def export(rootFolder, objects):
    fileNameNoExt = "P1Export-"+datetime.now().strftime('%d-%m-%Y')
    folder = rootFolder + fileNameNoExt + '/'
    files.gotFolder(folder)
    visitor = PVisitor(folder)
    for obj in objects:
        visitor.serialize(obj)
    fileName = fileNameNoExt + ".zip"
    files.compressZIP(
        folder,
        rootFolder + fileName
    )
    files.deleteFile(folder)
    return fileName

class PVisitor:

    def __init__(self, rootFolder, *args, **kwargs):
        self.rootFolder = rootFolder

    def getFilePath(self, obj, fileName):
        relPath = ""
        if obj.filePath:
            relPath = obj.filePath
        filePath = self.rootFolder + relPath + fileName
        filePath = normalisation.findAvailableAbsolutePath(filePath)
        return filePath

    def gotPTextFilename(self, pText):
        if pText.fileName:
            return pText.fileName
        else:
            fileName = "XXX.txt"
            pText.fileName = fileName
            pText.save()
            return fileName

    def none2VoidString(self, value):
        if value == None:
            value = ""
        return value

    def serialize(self, obj):
        return obj.accept(self)

    def visitProspero(self, obj):
        return None

    def visitProject(self, obj):
        for x in obj.corpuses.all():
            self.serialize(x)
        for x in obj.dictionnaries.all():
            self.serialize(x)

    def visitPCorpus(self, obj):
        for x in obj.texts.all():
            self.serialize(x)

    def visitPText(self, obj):
        fileName = self.gotPTextFilename(obj)
        filePath = self.getFilePath(obj, fileName)
        files.writeFile(filePath, obj.text, fileEncoding)
        ctxFilePath = files.gotFolder(filePath) + files.getFileName(filePath, False) + ".ctx"

        ctxData = [obj.identCtxP1]
        ctxData.append(self.none2VoidString(obj.title))
        ctxData.append(self.none2VoidString(obj.author))
        ctxData.append(self.none2VoidString(obj.getDataValue("narrator")))
        ctxData.append(self.none2VoidString(obj.getDataValue("recipient")))
        ctxData.append(self.none2VoidString(obj.date))
        ctxData.append(self.none2VoidString(obj.source))
        ctxData.append(self.none2VoidString(obj.getDataValue("publicationType")))
        ctxData.append(self.none2VoidString(obj.getDataValue("observation")))
        ctxData.append(self.none2VoidString(obj.getDataValue("authorStatus")))
        ctxData.append(self.none2VoidString(obj.getDataValue("issuePlace")))
        ctxData.append(self.none2VoidString(obj.getDataValue("freeField1")))
        ctxData.append(self.none2VoidString(obj.getDataValue("freeField2")))
        ctxData.append(self.none2VoidString(obj.getDataValue("calculation1")))
        ctxData.append(self.none2VoidString(obj.getDataValue("calculation2")))
        ctxData.append(self.none2VoidString(obj.getDataValue("hour")))
        ctxData.append('\n')
        ctxData = '\n'.join(ctxData)
        files.writeFile(ctxFilePath, ctxData, fileEncoding)
        # TODO associatedDatas

    def visitCategoryDictionnary(self, obj):
        filePath = self.getFilePath(obj, obj.name + ".cat")
        self.lines = [obj.identP1]
        self.dicoType = obj.type
        for x in obj.elements.all():
            self.serialize(x)
        self.lines.append("ENDFILE")
        self.lines.append('\n')
        data = '\n'.join(self.lines)
        files.writeFile(filePath, data, fileEncoding)

    def visitCategory(self, obj):
        self.lines.append("*"+bdCatTypeTranslation[obj.type]+"*")
        self.lines.append(obj.name)
        for x in obj.elements.all():
            self.serialize(x)
        self.lines.append("END")
        self.lines.append("ENDCAT")

    def visitFictionDictionnary(self, obj):
        filePath = self.getFilePath(obj, obj.name + ".fic")
        self.lines = [obj.identP1]
        self.dicoType = obj.type
        for x in obj.elements.all():
            self.serialize(x)
        self.lines.append("ENDFILE")
        self.lines.append('\n')
        data = '\n'.join(self.lines)
        files.writeFile(filePath, data, fileEncoding)

    def visitFiction(self, obj):
        self.lines.append("FICTION")
        self.lines.append(obj.name+"@")
        for x in obj.elements.all():
            self.serialize(x)
        self.lines.append("ENDFICTION")

    def visitDictPackage(self, obj):
        self.lines.append(obj.name)
        for x in obj.elements.all():
            self.serialize(x)
        self.lines.append("END")

    def visitCollectionDictionnary(self, obj):
        filePath = self.getFilePath(obj, obj.name + ".col")
        self.lines = [obj.identP1]
        self.dicoType = obj.type
        for x in obj.elements.all():
            self.serialize(x)
        self.lines.append("ENDFILE")
        self.lines.append('\n')
        data = '\n'.join(self.lines)
        files.writeFile(filePath, data, fileEncoding)

    def visitCollection(self, obj):
        self.lines.append("FICTION")
        self.lines.append(obj.name+"*")
        for x in obj.elements.all():
            self.serialize(x)
        self.lines.append("ENDFICTION")

    def visitLexicalDictionnary(self, obj):
        filePath = self.getFilePath(obj, obj.language + "_" + obj.name + ".dic")
        self.lines = []
        self.dicoType = obj.type
        for x in obj.elements.all():
            self.serialize(x)
        #self.lines.append("ENDFILE")
        self.lines.append('\n')
        data = '\n'.join(self.lines)
        files.writeFile(filePath, data, fileEncoding)

    def visitDictElement(self, obj):
        self.lines.append(obj.value)

    def visitPUri(self, obj):
        return None

    def visitPFile(self, obj):
        return None