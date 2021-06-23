from main.importerP1 import reader
from main.models import *

def add(parent, propertyName, elt):
    getattr(parent, propertyName).add(elt)

def set(parent, propertyName, elt):
    setattr(parent, propertyName, elt)
    parent.save()

def createFictionDictionnary(name):
    obj = FictionDictionnary(name=name, type="FictionDict")
    obj.save()
    return obj

def createCollectionDictionnary(name):
    obj = CollectionDictionnary(name=name, type="CollectionDict")
    obj.save()
    return obj

def createCategoryDictionnary(name):
    obj = CategoryDictionnary(name=name, type="CategoryDict")
    obj.save()
    return obj

def createLexicalDictionnary(name, language):
    obj = LexicalDictionnary(name=name, language=language, type="SyntaxicDict")
    obj.save()
    return obj

def createProject(name):
    obj = Project(name=name)
    obj.save()
    defaultCorpus = createPCorpus("main")
    obj.corpuses.add(defaultCorpus)
    return obj

def createDictPackage(name):
    obj = DictPackage(name=name)
    obj.save()
    return obj

def createDictElement(value):
    value = reader.normalizeDictElementValue(value)
    obj = DictElement(value=value)
    obj.save()
    return obj

def createPResource(uri):
    obj = PUri(uri=uri)
    obj.save()
    return obj

def createFiction(name):
    obj = Fiction(name=name)
    obj.save()
    return obj

def createCollection(name):
    obj = Collection(name=name)
    obj.save()
    return obj

def createCategory(name):
    obj = Category(name=name)
    obj.save()
    return obj

def createPText(text):
    obj = PText(text=text)
    obj.save()
    return obj

def createPCorpus(name):
    obj = PCorpus(name=name)
    obj.save()
    return obj

def createMetaData(name, type, value):
    obj = MetaData(name=name, type=type, value=value)
    obj.save()
    return obj