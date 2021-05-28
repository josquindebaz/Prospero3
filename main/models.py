from django.db import models

from django.db import models
from prospero.settings import *

CategoryType = (
    ('ENTITY', 'ENTITY'),
    ('QUALITY', 'QUALITY'),
    ('VERB', 'VERB'),
    ('MARKER', 'MARKER'),
)
DataType = (
    ('String', 'String'),
    ('Datetime', 'Datetime'),
    ('File', 'File'),
    ('Text', 'Text'),
)
DictType = (
    ('FictionDict', 'FictionDict'),
    ('CollectionDict', 'CollectionDict'),
    ('CategoryDict', 'CategoryDict'),
    ('SyntaxicDict', 'SyntaxicDict'),
)

class PObject(models.Model) :

    def __str__(self):
        return "[" + str(self.id) + ":PObject]"

    def getRealInstance(self):
        if hasattr(self, "metadata"):
            return self.metadata.getRealInstance()
        elif hasattr(self, "prospero"):
            return self.prospero.getRealInstance()
        elif hasattr(self, "dictobject"):
            return self.dictobject.getRealInstance()
        elif hasattr(self, "presource"):
            return self.presource.getRealInstance()
        elif hasattr(self, "augmenteddata"):
            return self.augmenteddata.getRealInstance()
        else:
            return self

class AugmentedData(PObject):

    associatedDatas = models.ManyToManyField('PResource', blank=True, related_name='augmentedData')
    metaDatas = models.ManyToManyField('MetaData', blank=True, related_name='augmentedData')

    def __unicode__(self):
        return "[" + str(self.id) + ":AugmentedData]"

    def getRealInstance(self):
        if hasattr(self, "project"):
            return self.project.getRealInstance()
        elif hasattr(self, "ptext"):
            return self.ptext.getRealInstance()
        else:
            return self

    def getMetaDatas(self):
        res = []
        for elt in self.metaDatas.all():
            res.append(elt.getRealInstance())
        return res

    def getAssociatedDatas(self):
        res = []
        for elt in self.associatedDatas.all():
            res.append(elt.getRealInstance())
        return res

class Project(PObject) :

    language = models.CharField(blank=True, max_length=255)

    texts = models.ManyToManyField('PText', blank=True, related_name='project')
    dictionnaries = models.ManyToManyField('Dictionnary', blank=True, related_name='project')

    def __str__(self):
        return "[" + str(self.id) + ":Project]"

    def getRealInstance(self):
        return self

    def getTexts(self):
        res = []
        for elt in self.texts.all():
            res.append(elt.getRealInstance())
        return res

    def getDictionnaries(self):
        return self.dictionnaries.getRealInstance()

class MetaData(PObject) :

    name = models.CharField(blank=True, max_length=255)
    type = models.CharField(blank=True, choices = DataType, max_length=255)
    value = models.TextField(blank=True)

    def __str__(self):
        return "[" + str(self.id) + ":MetaData]"

    def getRealInstance(self):
        return self

class DictObject(PObject) :

    def __str__(self):
        return "[" + str(self.id) + ":DictObject]"

    def getRealInstance(self):
        if hasattr(self, "dictelement"):
            return self.dictelement.getRealInstance()
        elif hasattr(self, "dictpackage"):
            return self.dictpackage.getRealInstance()
        else:
            return self

class DictPackage(DictObject) :

    name = models.CharField(blank=True, max_length=255)

    elements = models.ManyToManyField('DictObject', blank=True, related_name='package')

    def __str__(self):
        return "[" + str(self.id) + ":DictPackage]"

    def getRealInstance(self):
        if hasattr(self, "dictionnary"):
            return self.dictionnary.getRealInstance()
        elif hasattr(self, "category"):
            return self.category.getRealInstance()
        elif hasattr(self, "collection"):
            return self.collection.getRealInstance()
        elif hasattr(self, "fiction"):
            return self.fiction.getRealInstance()
        else:
            return self
    def getElements(self):
        res = []
        for elt in self.elements.all():
            res.append(elt.getRealInstance())
        return res

class Dictionnary(DictPackage) :

    type = models.CharField(blank=True, choices = DictType, max_length=255)

    def __str__(self):
        return "[" + str(self.id) + ":Dictionnary]"

    def getRealInstance(self):
        if hasattr(self, "lexicaldictionnary"):
            return self.lexicaldictionnary.getRealInstance()
        elif hasattr(self, "semanticdictionnary"):
            return self.semanticdictionnary.getRealInstance()
        else:
            return self

class SemanticDictionnary(Dictionnary) :

    def __str__(self):
        return "[" + str(self.id) + ":SemanticDictionnary]"

    def getRealInstance(self):
        if hasattr(self, "collectiondictionnary"):
            return self.collectiondictionnary.getRealInstance()
        elif hasattr(self, "categorydictionnary"):
            return self.categorydictionnary.getRealInstance()
        elif hasattr(self, "fictiondictionnary"):
            return self.fictiondictionnary.getRealInstance()
        else:
            return self

class CollectionDictionnary(SemanticDictionnary) :

    def __str__(self):
        return "[" + str(self.id) + ":CollectionDictionnary]"

    def getRealInstance(self):
        return self

class CategoryDictionnary(SemanticDictionnary) :

    def __str__(self):
        return "[" + str(self.id) + ":CategoryDictionnary]"

    def getRealInstance(self):
        return self

class FictionDictionnary(SemanticDictionnary) :

    def __str__(self):
        return "[" + str(self.id) + ":FictionDictionnary]"

    def getRealInstance(self):
        return self

class DictElement(DictObject) :

    value = models.CharField(blank=True, max_length=255)

    def __str__(self):
        return "[" + str(self.id) + ":DictElement]"

    def getRealInstance(self):
        return self

class PResource(PObject) :

    def __str__(self):
        return "[" + str(self.id) + ":PResource]"

    def getRealInstance(self):
        if hasattr(self, "pfile"):
            return self.pfile.getRealInstance()
        elif hasattr(self, "puri"):
            return self.puri.getRealInstance()
        else:
            return self

class PFile(PResource) :

    file = models.FileField(blank=True, upload_to="upload")

    def __str__(self):
        return "[" + str(self.id) + ":PFile]"

    def getRealInstance(self):
        if hasattr(self, "ptext"):
            return self.ptext.getRealInstance()
        else:
            return self

class PText(PObject) :

    text = models.TextField(blank=True)

    def __str__(self):
        return "[" + str(self.id) + ":PText]"

    def getRealInstance(self):
        return self

class Prospero(PObject) :

    projects = models.ManyToManyField('Project', blank=True, related_name='prospero')
    texts = models.ManyToManyField('PText', blank=True, related_name='prospero')
    dictionnaries = models.ManyToManyField('Dictionnary', blank=True, related_name='prospero')

    def __str__(self):
        return "[" + str(self.id) + ":Prospero]"

    def getRealInstance(self):
        return self

    def getProjects(self):
        res = []
        for elt in self.projects.all():
            res.append(elt.getRealInstance())
        return res

    def getTexts(self):
        res = []
        for elt in self.texts.all():
            res.append(elt.getRealInstance())
        return res

    def getDictionnaries(self):
        res = []
        for elt in self.dictionnaries.all():
            res.append(elt.getRealInstance())
        return res

class LexicalDictionnary(Dictionnary) :

    language = models.CharField(blank=True, max_length=255)

    def __str__(self):
        return "[" + str(self.id) + ":LexicalDictionnary]"

    def getRealInstance(self):
        return self

class Category(DictPackage) :

    type = models.CharField(blank=True, choices = CategoryType, max_length=255)

    def __str__(self):
        return "[" + str(self.id) + ":Category]"

    def getRealInstance(self):
        return self

class Collection(DictPackage) :

    def __str__(self):
        return "[" + str(self.id) + ":Collection]"

    def getRealInstance(self):
        return self

class Fiction(DictPackage) :

    def __str__(self):
        return "[" + str(self.id) + ":Fiction]"

    def getRealInstance(self):
        return self

class PUri(PResource) :

    uri = models.URLField(blank=True)

    def __str__(self):
        return "[" + str(self.id) + ":PUri]"

    def getRealInstance(self):
        return self

# Returns true if a field has changed in a model
# May be used in a model.save() method.
def has_changed(instance, field, manager='objects'):
    if not instance.pk:
        return True
    manager = getattr(instance.__class__, manager)
    try:
        old = getattr(manager.get(pk=instance.pk), field)
    except:
        return False
    logger.info(getattr(instance, field))
    logger.info(old)
    return not getattr(instance, field) == old

#Returns true if an image field has changed in a model
#May be used in a model.save() method.
def image_has_changed(instance, field, manager='objects'):
    if hasattr(instance, field) and hasattr(getattr(instance,field), 'url') and has_changed(instance, field):
        return True
    return False