from main.models import *

class PProjectFinder:

    def __init__(self, *args, **kwargs):
        pass

    def find(self, obj):
        return obj.accept(self)

    def visitProspero(self, obj):
        return None

    def visitProject(self, obj):
        return obj

    def visitPCorpus(self, obj):
        return self.find(obj.project.all()[0])

    def visitPText(self, obj):
        return self.find(obj.corpus.all()[0])

    def visitMetaData(self, obj):
        return self.find(obj.augmentedData.all()[0])

    def visitDictElement(self, obj):
        return None # TODO

    def visitDictPackage(self, obj):
        return None # TODO

    def visitCollectionDictionnary(self, obj):
        return None # TODO

    def visitCategoryDictionnary(self, obj):
        return None # TODO

    def visitFictionDictionnary(self, obj):
        return None # TODO

    def visitLexicalDictionnary(self, obj):
        return None # TODO

    def visitCategory(self, obj):
        return None # TODO

    def visitCollection(self, obj):
        return None # TODO

    def visitFiction(self, obj):
        return None # TODO

    def visitPUri(self, obj):
        return self.find(obj.augmentedData.all()[0])

    def visitPFile(self, obj):
        return self.find(obj.augmentedData.all()[0])

    def visitPUser(self, obj):
        return None

    def visitPGroup(self, obj):
        return None

    def visitUserRight(self, obj):
        return None

finder = PProjectFinder()