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
        from main.models import DictPackage
        parent = DictPackage.objects.get(elements__in=[obj.id])
        return self.find(parent)

    def visitDictPackage(self, obj):
        from main.models import DictPackage
        parent = DictPackage.objects.get(elements__in=[obj.id])
        return self.find(parent)

    def visitCollectionDictionnary(self, obj):
        from main.models import Project
        return Project.objects.get(dictionnaries__in=[obj.id])

    def visitCategoryDictionnary(self, obj):
        from main.models import Project
        return Project.objects.get(dictionnaries__in=[obj.id])

    def visitFictionDictionnary(self, obj):
        from main.models import Project
        return Project.objects.get(dictionnaries__in=[obj.id])

    def visitLexicalDictionnary(self, obj):
        from main.models import Project
        return Project.objects.get(dictionnaries__in=[obj.id])

    def visitCategory(self, obj):
        return self.visitDictPackage(obj)

    def visitCollection(self, obj):
        return self.visitDictPackage(obj)

    def visitFiction(self, obj):
        return self.visitDictPackage(obj)

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