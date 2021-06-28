from main.models import *

class PDeletionVisitor:

    def __init__(self, *args, **kwargs):
        pass

    def delete(self, obj):
        return obj.accept(self)

    def visitProspero(self, obj):
        pass

    def visitProject(self, obj):
        for corpus in obj.corpuses.all():
            self.delete(corpus)
        for dico in obj.dictionnaries.all():
            self.delete(dico)
        obj.delete()

    def visitPCorpus(self, obj):
        for metaData in obj.metaDatas.all():
            self.delete(metaData)
        for associatedData in obj.associatedDatas.all():
            self.delete(associatedData)
        for text in obj.texts.all():
            self.delete(text)
        obj.delete()

    def visitPText(self, obj):
        for metaData in obj.metaDatas.all():
            self.delete(metaData)
        for associatedData in obj.associatedDatas.all():
            self.delete(associatedData)
        obj.delete()

    def visitMetaData(self, obj):
        obj.delete()

    def visitAssociatedData(self, obj):
        obj.delete()

    def visitDictElement(self, obj):
        obj.delete()

    def visitDictPackage(self, obj):
        for element in obj.elements.all():
            self.delete(element)
        obj.delete()

    def visitCollectionDictionnary(self, obj):
        for element in obj.elements.all():
            self.delete(element)
        obj.delete()

    def visitCategoryDictionnary(self, obj):
        for element in obj.elements.all():
            self.delete(element)
        obj.delete()

    def visitFictionDictionnary(self, obj):
        for element in obj.elements.all():
            self.delete(element)
        obj.delete()

    def visitLexicalDictionnary(self, obj):
        for element in obj.elements.all():
            self.delete(element)
        obj.delete()

    def visitCategory(self, obj):
        for element in obj.elements.all():
            self.delete(element)
        obj.delete()

    def visitCollection(self, obj):
        for element in obj.elements.all():
            self.delete(element)
        obj.delete()

    def visitFiction(self, obj):
        for element in obj.elements.all():
            self.delete(element)
        obj.delete()

    def visitPUri(self, obj):
        pass

    def visitPFile(self, obj):
        pass

deletor = PDeletionVisitor()