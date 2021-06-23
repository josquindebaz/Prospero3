from main.models import *

class PDeletionVisitor:

    def __init__(self, *args, **kwargs):
        pass

    def delete(self, obj):
        return obj.accept(self)

    def visitProspero(self, obj):
        pass

    def visitProject(self, obj):
        pass

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

    def visitDictPackage(self, obj):
        pass

    def visitCollectionDictionnary(self, obj):
        pass

    def visitCategoryDictionnary(self, obj):
        pass

    def visitFictionDictionnary(self, obj):
        pass

    def visitLexicalDictionnary(self, obj):
        pass

    def visitDictElement(self, obj):
        pass

    def visitCategory(self, obj):
        pass

    def visitCollection(self, obj):
        pass

    def visitFiction(self, obj):
        pass

    def visitPUri(self, obj):
        pass

    def visitPFile(self, obj):
        pass

deletor = PDeletionVisitor()