import json

catTypeTranslation = {
    "ENTITY": "ENTITE",
    "MARKER": "MARQUEUR",
    "VERB": "EPREUVE",
    "QUALITY": "QUALITE",
}

def export(obj, filePath):
    data = serialize(obj)
    res = json.dumps(data, indent=4)
    file = open(filePath, "w")
    file.write(res)
    file.close()

def serialize(obj):
    visitor = PVisitor()
    data = visitor.serialize(obj)
    return data

class PVisitor:

    def __init__(self, *args, **kwargs):
        self.result = {}

    def serialize(self, obj):
        return obj.accept(self)

    def visitProspero(self, obj):
        return None

    def visitProject(self, obj):
        corpora = []
        for x in obj.corpuses.all():
            data = self.serialize(x)
            corpora.append(data)
        dictionaries = []
        for x in obj.dictionnaries.all():
            data = self.serialize(x)
            dictionaries.append(data)
        return {
            "model": "Project",
            "name": obj.name,
            "language": None,
            "dictionaries": dictionaries,
            "corpora": corpora
        }

    def visitPCorpus(self, obj):
        texts = []
        for x in obj.texts.all():
            data = self.serialize(x)
            texts.append(data)
        metaDatas = []
        for x in obj.metaDatas.all():
            data = self.serialize(x)
            metaDatas.append(data)
        associatedDatas = []
        for x in obj.associatedDatas.all():
            data = self.serialize(x)
            associatedDatas.append(data)
        return {
            "model": "PCorpus",
            "name": obj.name,
            "author": obj.author,
            "metaDatas": metaDatas,
            "associatedData": associatedDatas,
            "texts": texts
        }

    def visitPText(self, obj):
        metaDatas = []
        for x in obj.metaDatas.all():
            data = self.serialize(x)
            metaDatas.append(data)
        associatedDatas = []
        for x in obj.associatedDatas.all():
            data = self.serialize(x)
            associatedDatas.append(data)
        return {
            "model": "PText",
            "fileName": obj.fileName,
            "filePath": obj.filePath,
            "title": obj.title,
            "date": obj.date,
            "source": obj.source,
            "author": obj.author,
            "text": obj.text,
            "metaDatas": metaDatas,
            "associatedData": associatedDatas
        }

    def visitMetaData(self, obj):
        return {
            "model": "MetaData",
            "name": obj.name,
            "type": obj.type,
            "value": obj.value
        }

    def visitDictPackage(self, obj):
        elements = []
        for x in obj.elements.all():
            data = self.serialize(x)
            elements.append(data)
        return {
            "model": "DictPackage",
            "name": obj.name,
            "elements": elements
        }

    def visitCollectionDictionnary(self, obj):
        elements = []
        for x in obj.elements.all():
            data = self.serialize(x)
            elements.append(data)
        return {
            "model": "CollectionDictionnary",
            "name": obj.name,
            "identP1": obj.identP1,
            "filePath": obj.filePath,
            "elements": elements
        }

    def visitCategoryDictionnary(self, obj):
        elements = []
        for x in obj.elements.all():
            data = self.serialize(x)
            elements.append(data)
        return {
            "model": "CategoryDictionnary",
            "name": obj.name,
            "identP1": obj.identP1,
            "filePath": obj.filePath,
            "elements": elements
        }

    def visitFictionDictionnary(self, obj):
        elements = []
        for x in obj.elements.all():
            data = self.serialize(x)
            elements.append(data)
        return {
            "model": "FictionDictionnary",
            "name": obj.name,
            "identP1": obj.identP1,
            "filePath": obj.filePath,
            "elements": elements
        }

    def visitLexicalDictionnary(self, obj):
        elements = []
        for x in obj.elements.all():
            data = self.serialize(x)
            elements.append(data)
        return {
            "model": "LexicalDictionnary",
            "name": obj.name,
            "language": obj.language,
            "filePath": obj.filePath,
            "elements": elements
        }

    def visitDictElement(self, obj):
        return obj.value

    def visitCategory(self, obj):
        elements = []
        for x in obj.elements.all():
            data = self.serialize(x)
            elements.append(data)
        return {
            "model": "Category",
            "name": obj.name,
            "type": catTypeTranslation[obj.type],
            "elements": elements
        }

    def visitCollection(self, obj):
        elements = []
        for x in obj.elements.all():
            data = self.serialize(x)
            elements.append(data)
        return {
            "model": "Collection",
            "name": obj.name,
            "elements": elements
        }

    def visitFiction(self, obj):
        elements = []
        for x in obj.elements.all():
            data = self.serialize(x)
            elements.append(data)
        return {
            "model": "Fiction",
            "name": obj.name,
            "elements": elements
        }

    def visitPUri(self, obj):
        return {
            "model": "PUri",
            "uri": obj.uri
        }

    def visitPFile(self, obj):
        return {
            "model": "PFile",
            "pathP1": obj.pathP1
        }
