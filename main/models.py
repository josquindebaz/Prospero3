from django.db import models
from sortedm2m.fields import SortedManyToManyField
from django.db import models
import json
from datetime import datetime
from django.utils import timezone
import pytz
from django.contrib.auth.models import *

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

class PTag(models.Model) :

    name = models.CharField(blank=True, max_length=255)

    def __str__(self):
        return "[" + str(self.id) + ":PTag]"

    def serializeIdentity(self):
        return {
            "model" : self.getRealInstance().__class__.__name__,
            "id" : self.id
        }

    def serialize(self):
        return {
            "id" : self.id,
            "value" : self.name
        }

    def getRealInstance(self):
        return self

class PObject(models.Model) :

    tags = models.ManyToManyField('PTag', blank=True, related_name='taggedElements')

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
        elif hasattr(self, "pcorpus"):
            return self.pcorpus.getRealInstance()
        else:
            return self

    def serializeIdentity(self):
        return {
            "model" : self.getRealInstance().__class__.__name__,
            "id" : self.id
        }

    def accept(self, visitor):
        obj = self.getRealInstance()
        return getattr(visitor, "visit"+type(obj).__name__)(obj)

    def tagList(self):
        return ", ".join(self.tags.values_list('name', flat=True))

    def tagIds(self):
        return list(self.tags.values_list('id', flat=True))

class AugmentedData(PObject):

    associatedDatas = SortedManyToManyField('PResource', blank=True, related_name='augmentedData')
    metaDatas = SortedManyToManyField('MetaData', blank=True, related_name='augmentedData')

    def __unicode__(self):
        return "[" + str(self.id) + ":AugmentedData]"

    def getRealInstance(self):
        if hasattr(self, "project"):
            return self.project.getRealInstance()
        elif hasattr(self, "ptext"):
            return self.ptext.getRealInstance()
        elif hasattr(self, "pcorpus"):
            return self.pcorpus.getRealInstance()
        else:
            return self

    def getMetaDatas(self):
        res = []
        for elt in self.metaDatas.all():
            res.append(elt.getRealInstance())
        return res

    def getMetaData(self, name):
        try:
            return self.metaDatas.get(name=name)
        except:
            return None

    def getAssociatedDatas(self):
        res = []
        for elt in self.associatedDatas.all():
            res.append(elt.getRealInstance())
        return res

    def getDateObject(self):
        try:
            return datetime.strptime(self.date, '%d/%m/%Y')
        except:
            return None

    def getDataValue(self, dataName, rawValue=True):
        try:
            metadata = self.metaDatas.get(name=dataName)
            value = metadata.value
            if not rawValue:
                if metadata.type == "Datetime":
                    value = datetime.strptime(value, '%d/%m/%Y')
            return value
        except:
            return None

    def hasData(self, name):
        if name in self.getRealInstance().getFixedDataNames():
            return True
        else:
            return self.getMetaData(name)

class ProsperoUser(User) :

    def __str__(self):
        return "["+str(self.id)+":ProsperoUser] "+self.username

    def interfaceName(self):
        return self.last_name + " " + self.first_name

    def getRealInstance(self):
            return self

class Project(AugmentedData) :

    name = models.CharField(blank=True, max_length=255)
    language = models.CharField(blank=True, max_length=255)
    description = models.TextField(blank=True)
    creationDate = models.DateTimeField(null=True, blank=True)
    lastOpeningDate = models.DateTimeField(null=True, blank=True)
    lastModificationDate = models.DateTimeField(null=True, blank=True)
    dictionnaries = models.ManyToManyField('Dictionnary', blank=True, related_name='project')
    corpuses = models.ManyToManyField('PCorpus', blank=True, related_name='project')

    owner = models.ForeignKey('ProsperoUser', null=True, on_delete=models.SET_NULL, related_name='ownedProjects')

    def save(self, *args, **kwargs):
        if not self.pk:
            self.creationDate = timezone.now()
        super(Project, self).save(*args, **kwargs)

    def declareAsModified(self):
        self.lastModificationDate = timezone.now()
        self.save()

    def declareAsOpened(self):
        self.lastOpeningDate = timezone.now()
        self.save()

    def __str__(self):
        return "[" + str(self.id) + ":Project]"

    def getRealInstance(self):
        return self

    def gotDefaultCorpus(self):
        try:
            return self.corpuses.get(name="main")
        except:
            from main.importerP1 import builder2BD as builder
            corpus = builder.createPCorpus("main")
            self.corpuses.add(corpus)
            return corpus

    def getFixedDataNames(self):
        return ["name", "language"]

    def nbTexts(self):
        nb = 0
        for corpus in self.corpuses.all():
            nb = nb + corpus.nbTexts()
        return nb

    def nbTextChar(self):
        nb = 0
        for corpus in self.corpuses.all():
            nb = nb + corpus.nbTextChar()
        return nb

class PCorpus(AugmentedData) :

    #ATTRIBUTES
    name = models.CharField(blank=True, max_length=255)
    author = models.CharField(blank=True, max_length=255)

    #RELATIONS
    texts = models.ManyToManyField('PText', blank=True, related_name='corpus')

    def __str__(self):
        return "[" + str(self.id) + ":PCorpus]"

    def getRealInstance(self):
        return self

    def getTexts(self):
        res = []
        for elt in self.texts.all():
            res.append(elt.getRealInstance())
        return res

    def serialize(self):
        identity = self.serializeIdentity()
        data = {
            "identity" : identity,
            "name" : self.name,
            "author": self.author,
        }
        datas = [
            {
                "identity": identity,
                "name": "name",
                "type": "String",
                "value": self.name,
                "kind": "data"
            },
            {
                "identity": identity,
                "name": "author",
                "type": "String",
                "value": self.author,
                "kind": "data"
            },
            {
                "identity": identity,
                "name": "tags",
                "type": "Tags",
                "value": self.tagIds(),
                "kind": "data"
            }
        ]
        data["datas"] = datas
        metaDatas = []
        for metaData in self.metaDatas.all():
            metaDatas.append(metaData.serialize())
        data["metaDatas"] = metaDatas
        return data

    def serializeAsTableItem(self):
        return {
            "identity" : self.serializeIdentity(),
            "values" : {
                "name" : self.name,
                "author" : self.author,
                "tags" : self.tagList()
            }
        }

    def getFixedDataNames(self):
        return ["name", "author"]

    def nbTexts(self):
        return self.texts.count()

    def nbTextChar(self):
        nb = 0
        for text in self.texts.all():
            nb = nb + text.getNbChar()
        return nb

class MetaData(PObject) :

    name = models.CharField(blank=True, max_length=255)
    type = models.CharField(blank=True, choices = DataType, max_length=255)
    value = models.TextField(blank=True)

    def __str__(self):
        return "[" + str(self.id) + ":MetaData] "+self.name

    def getRealInstance(self):
        return self

    def serialize(self):
        return {
            "identity" : self.serializeIdentity(),
            "name" : self.name,
            "type": self.type,
            "value": self.value,
            "kind" : "metadata"
        }

    def parent(self):
        return self.augmentedData.first().getRealInstance()

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
        return "[" + str(self.id) + ":DictPackage] " + self.name

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
    filePath = models.CharField(blank=True, max_length=255)

    def __str__(self):
        return "[" + str(self.id) + ":Dictionnary] " + self.name

    def getRealInstance(self):
        if hasattr(self, "lexicaldictionnary"):
            return self.lexicaldictionnary.getRealInstance()
        elif hasattr(self, "semanticdictionnary"):
            return self.semanticdictionnary.getRealInstance()
        else:
            return self

    def serializeAsTableItem(self):
        return {
            "identity" : self.serializeIdentity(),
            "values" : {
                "name" : self.name,
                "author" : "John Doe",
                "type" : self.type
            }
        }

class SemanticDictionnary(Dictionnary) :

    identP1 = models.CharField(blank=True, max_length=255)

    def __str__(self):
        return "[" + str(self.id) + ":SemanticDictionnary] " + self.name

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
        return "[" + str(self.id) + ":CollectionDictionnary] " + self.name

    def getRealInstance(self):
        return self

class CategoryDictionnary(SemanticDictionnary) :

    def __str__(self):
        return "[" + str(self.id) + ":CategoryDictionnary] " + self.name

    def getRealInstance(self):
        return self

class FictionDictionnary(SemanticDictionnary) :

    def __str__(self):
        return "[" + str(self.id) + ":FictionDictionnary] " + self.name

    def getRealInstance(self):
        return self

class DictElement(DictObject) :

    value = models.CharField(blank=True, max_length=255)

    def __str__(self):
        return "[" + str(self.id) + ":DictElement] " + self.value

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
    pathP1 = models.CharField(blank=True, max_length=255)

    def __str__(self):
        return "[" + str(self.id) + ":PFile] " + self.file.name

    def getRealInstance(self):
        if hasattr(self, "ptext"):
            return self.ptext.getRealInstance()
        else:
            return self

class PText(AugmentedData) :

    text = models.TextField(blank=True)
    fileName = models.CharField(blank=True, max_length=255)
    filePath = models.CharField(blank=True, max_length=255)
    identCtxP1 = models.CharField(blank=True, max_length=255)

    title = models.CharField(blank=True, max_length=255)
    date = models.CharField(blank=True, max_length=255)
    source = models.CharField(blank=True, max_length=255)
    author = models.CharField(blank=True, max_length=255)

    def getFixedDataNames(self):
        return ["title", "date", "source", "author"]

    def __str__(self):
        return "[" + str(self.id) + ":PText]"

    def getRealInstance(self):
        return self

    def getNbChar(self):
        return len(self.text)

    def serialize(self):
        data = {
            "identity" : self.serializeIdentity(),
            "text" : self.text
        }
        requiredDatas = []
        requiredDatas.append({
            "identity" : self.serializeIdentity(),
            "name" : "title",
            "type": "String",
            "value": self.title
        })
        requiredDatas.append({
            "identity" : self.serializeIdentity(),
            "name" : "date",
            "type": "Date",
            "value": self.date
        })
        requiredDatas.append({
            "identity" : self.serializeIdentity(),
            "name" : "source",
            "type": "String",
            "value": self.source
        })
        requiredDatas.append({
            "identity" : self.serializeIdentity(),
            "name" : "author",
            "type": "String",
            "value": self.author
        })
        data["requiredDatas"] = requiredDatas
        metaDatas = []
        ignoredNames = ["calculation1", "calculation2"]
        for metaData in self.metaDatas.all():
            if not metaData.name in ignoredNames:
                metaDatas.append(metaData.serialize())
        data["metaDatas"] = metaDatas
        return data

    def serializeAsTableItem(self):
        return {
            "identity" : self.serializeIdentity(),
            "values" : {
                "title" : self.title,
                "date" : self.date,
                "source" : self.source,
                "author" : self.author,
                "noc" : self.getNbChar()
            }
        }

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
        return "[" + str(self.id) + ":LexicalDictionnary] " + self.name

    def getRealInstance(self):
        return self

class Category(DictPackage) :

    type = models.CharField(blank=True, choices = CategoryType, max_length=255)

    def __str__(self):
        return "[" + str(self.id) + ":Category] " + self.name

    def getRealInstance(self):
        return self

class Collection(DictPackage) :

    def __str__(self):
        return "[" + str(self.id) + ":Collection] " + self.name

    def getRealInstance(self):
        return self

class Fiction(DictPackage) :

    def __str__(self):
        return "[" + str(self.id) + ":Fiction] " + self.name

    def getRealInstance(self):
        return self

class PUri(PResource) :

    uri = models.URLField(blank=True)

    def __str__(self):
        return "[" + str(self.id) + ":PUri] " + self.uri

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