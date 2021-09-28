from django.db import models
from sortedm2m.fields import SortedManyToManyField
from django.db import models
import json
from datetime import datetime
from django.utils import timezone
import pytz
from django.contrib.auth.models import *
from main.helpers import cloud, files, projects

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
    ('Hour', 'Hour'),
)
DictType = (
    ('FictionDict', 'FictionDict'),
    ('CollectionDict', 'CollectionDict'),
    ('CategoryDict', 'CategoryDict'),
    ('SyntaxicDict', 'SyntaxicDict'),
)
UserRightType = (
    ('Read', 'Read'),
    ('Write', 'Write'),
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
        elif hasattr(self, "projectconf"):
            return self.projectconf.getRealInstance()
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

    def getProject(self):
        return projects.finder.find(self)

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

    def delete(self):
        folder = cloud.getProjectDataFolder(self)
        if files.exists(folder):
            print("delete projectFolder")
            files.deleteFile(folder)
        super(Project, self).delete()

    def save(self, *args, **kwargs):
        if not self.pk:
            self.creationDate = timezone.now()
        super(Project, self).save(*args, **kwargs)

    def getProjectOwnerConf(self):
        return ProjectConf.objects.get(project=self, puser=self.owner.getRealInstance())

    def gotProjectConf(self, user):
        try:
            return ProjectConf.objects.get(project=self, puser=user)
        except:
            from main.importerP1 import builder2BD as builder
            conf = builder.createProjectConf(self, user)
            conf.selectedDicos.add(*self.getProjectOwnerConf().selectedDicos.all())
            return conf

    def declareAsModified(self):
        self.lastModificationDate = timezone.now()
        self.save()

    def declareAsOpened(self):
        self.lastOpeningDate = timezone.now()
        self.save()

    def __str__(self):
        return "[" + str(self.id) + ":Project] " + self.name

    def getRealInstance(self):
        return self

    def gotDefaultCorpus(self, user):
        try:
            return self.corpuses.get(name="main")
        except:
            from main.importerP1 import builder2BD as builder
            corpus = builder.createPCorpus("main", user)
            self.corpuses.add(corpus)
            return corpus

    def getFixedDataNames(self):
        return ["name", "language"]

    def nbTexts(self):
        nb = 0
        for corpus in self.corpuses.all():
            nb = nb + corpus.nbTexts
        return nb

    def nbTextChar(self):
        nb = 0
        for corpus in self.corpuses.all():
            nb = nb + corpus.nbTextChar()
        return nb

    def serializeRights(self):
        result = []
        for right in UserRight.objects.filter(project=self):
            result.append(right.serialize())
        return result

    def serializeDataDef(self):
        identity = self.serializeIdentity()
        data = {
            "identity" : identity,
            "data" : [
                {
                    "name": "name",
                    "type": "String"
                },
                {
                    "name": "description",
                    "type": "Text"
                },
                {
                    "name": "tags",
                    "type": "Tags",
                    "value": self.tagIds(),
                }
            ],
        }
        return data

class PCorpus(AugmentedData) :

    #ATTRIBUTES
    name = models.CharField(blank=True, max_length=255)
    author = models.CharField(blank=True, max_length=255)
    """ NEW !! """
    nbTexts = models.IntegerField(null=True, blank=True, default=0)

    #RELATIONS
    texts = models.ManyToManyField('PText', blank=True, related_name='corpus')

    def addText(self, text):
        self.texts.add(text)
        self.nbTexts = self.nbTexts + 1
        self.save()

    def removeText(self, text):
        self.texts.remove(text)
        self.nbTexts = self.nbTexts - 1
        self.save()

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
                "nbTexts" : self.nbTexts,
                "tags" : self.tagList()
            }
        }

    def getFixedDataNames(self):
        return ["name", "author"]

    def nbTextChar(self):
        nb = 0
        for text in self.texts.all():
            nb = nb + text.noc
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

    elements = SortedManyToManyField('DictObject', blank=True, related_name='package')
    #elements = models.ManyToManyField('DictObject', blank=True, related_name='package')

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

    def serialize(self, **kwargs):
        if "depth" in kwargs:
            depth = kwargs["depth"]
        else:
            depth = -1
        result = {
            "identity" : self.serializeIdentity(),
            "name": self.name
        }
        if depth != 0:
            depth = depth - 1
            elements = []
            for item in self.elements.all():
                item = item.getRealInstance()
                elements.append(item.serialize(depth=depth))
            result["elements"] = elements
        return result

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

    def serializeAsTableItem(self, selected):
        return {
            "identity" : self.serializeIdentity(),
            "values" : {
                "name" : self.name,
                "author" : "John Doe",
                "type" : self.type,
                "selected" : self in selected
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

    def serialize(self, **kwargs):
        return {
            "identity" : self.serializeIdentity(),
            "value": self.value,
        }

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

    def delete(self):
        if self.file and len(PFile.objects.filter(file=self.file)) == 1:
            files.deleteFile(str(self.file), True)
        super(PFile, self).delete()

    def __str__(self):
        return "[" + str(self.id) + ":PFile] " + self.file.name

    def getRealInstance(self):
        if hasattr(self, "ptext"):
            return self.ptext.getRealInstance()
        else:
            return self

    def serialize(self):
        filePath = str(self.file)
        href = cloud.getMediaRelativeUrl(filePath)
        projectFolder = cloud.gotProjectDataFolder(self.getProject())
        value = filePath[len(projectFolder):]
        data = {
            "identity": self.serializeIdentity(),
            "type": "PFile",
            "value": value,
            "href": href
        }
        return data

class PUri(PResource) :

    uri = models.URLField(blank=True)

    def __str__(self):
        return "[" + str(self.id) + ":PUri] " + self.uri

    def getRealInstance(self):
        return self

    def serialize(self):
        data = {
            "identity": self.serializeIdentity(),
            "type": "PUri",
            "value": self.uri,
            "href": self.uri
        }
        return data

class PText(AugmentedData) :

    text = models.TextField(blank=True)
    fileName = models.CharField(blank=True, max_length=255)
    filePath = models.CharField(blank=True, max_length=255)
    identCtxP1 = models.CharField(blank=True, max_length=255)

    title = models.CharField(blank=True, max_length=1000)
    date = models.CharField(blank=True, max_length=255)
    source = models.CharField(blank=True, max_length=255)
    author = models.CharField(blank=True, max_length=255)
    noc = models.IntegerField(null=True, blank=True)

    def save(self, *args, **kwargs):
        self.noc = len(self.text)
        super(PText, self).save(*args, **kwargs)

    def delete(self):
        try:
            self.corpus.all()[0].removeText(self)
        except:
            pass
        super(PText, self).delete()

    def getFixedDataNames(self):
        return ["title", "date", "source", "author"]

    def __str__(self):
        return "[" + str(self.id) + ":PText]"

    def getRealInstance(self):
        return self

    def serialize(self):
        data = {
            "identity" : self.serializeIdentity()
        }
        requiredDatas = []
        requiredDatas.append({
            "name" : "title",
            "type": "String",
            "value": self.title
        })
        requiredDatas.append({
            "name" : "date",
            "type": "Datetime",
            "value": self.date
        })
        requiredDatas.append({
            "name" : "source",
            "type": "String",
            "value": self.source
        })
        requiredDatas.append({
            "name" : "author",
            "type": "String",
            "value": self.author
        })
        requiredDatas.append({
            "name" : "text",
            "type": "Text",
            "value": self.text
        })
        data["requiredDatas"] = requiredDatas
        metaDatas = []
        ignoredNames = ["calculation1", "calculation2"]
        for metaData in self.metaDatas.all():
            if not metaData.name in ignoredNames:
                metaDatas.append(metaData.serialize())
        data["metaDatas"] = metaDatas
        associatedDatas = []
        for d in self.associatedDatas.all():
            d = d.getRealInstance()
            associatedDatas.append(d.serialize())
        data["associatedDatas"] = associatedDatas
        return data

    def serializeAsTableItem(self):
        return {
            "identity" : self.serializeIdentity(),
            "values" : {
                "title" : self.title,
                "date" : self.date,
                "source" : self.source,
                "author" : self.author,
                "noc" : self.noc
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

    def serialize(self, **kwargs):
        depth = -1
        if "depth" in kwargs:
            depth = kwargs["depth"]
        result = super().serialize(depth=depth)
        result["type"] = self.type
        return result

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

class ProsperoUser(User) :

    thumbnail = models.ImageField(blank=True, upload_to="upload")

    def __str__(self):
        return "["+str(self.id)+":ProsperoUser] "+self.username

    def delete(self):
        if self.thumbnail:
            files.deleteFile(str(self.thumbnail))
        super(ProsperoUser, self).delete()

    def interfaceName(self):
        if self.last_name:
            return self.last_name + " " + self.first_name
        else:
            return self.username

    def getRealInstance(self):
        if hasattr(self, "pgroup"):
            return self.pgroup.getRealInstance()
        elif hasattr(self, "puser"):
            return self.puser.getRealInstance()
        else:
            return self

    def serializeIdentity(self):
        return {
            "model" : self.__class__.__name__,
            "id" : self.id
        }

    def serializeAsTableItem(self):
        return {
            "identity" : self.serializeIdentity(),
            "values" : {
                "thumbnail" : self.getThumbnailUrl(),
                "username" : self.username,
                "first_name" : self.first_name,
                "last_name" : self.last_name
            }
        }

    def accept(self, visitor):
        obj = self.getRealInstance()
        return getattr(visitor, "visit"+type(obj).__name__)(obj)

    def getThumbnailUrl(self):
        from prospero import settings
        return settings.MEDIA_URL + cloud.getMediaRelativePath(str(self.thumbnail))

    def setThumbnailUrl(self, thumbnail):
        from prospero import settings
        if thumbnail.startswith("/media_site/"):
            thumbnail = thumbnail[12:]
        if self.thumbnail:
            files.deleteFile(str(self.thumbnail))
        source = settings.MEDIA_ROOT+thumbnail
        target = settings.MEDIA_ROOT+'users/thumbnails/'+files.getFileName(source)
        target = cloud.findAvailableAbsolutePath(target)
        if thumbnail.startswith("upload"):
            files.moveFile(source, target)
            folder = files.gotFolder(source)
            files.cleanFolder(folder)
        else:
            files.copyFile(source, target)
        #filePath = cloud.getMediaRelativePath(target)
        self.thumbnail = target
        self.save()

    def isUser(self):
        return type(self.getRealInstance()) == PUser

    def isGroup(self):
        return type(self.getRealInstance()) == PGroup


class PGroup(ProsperoUser) :

    #RELATIONS
    users = models.ManyToManyField('PUser', blank=True, related_name='owningGroups')

    def __str__(self):
        return "["+str(self.id)+":PGroup] "+self.username

    def getRealInstance(self):
        return self

    def serialize(self):
        users = []
        for user in self.users.all():
            users.append(user.id)
        result = {
            "identity" : self.serializeIdentity(),
            "username": self.username,
            "thumbnail": self.getThumbnailUrl(),
            "users" : users
        }
        return result

class PUser(ProsperoUser) :

    def __str__(self):
        return "["+str(self.id)+":PUser] "+self.username

    def getRealInstance(self):
        return self

    def serialize(self):
        return {
            "identity" : self.serializeIdentity(),
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "thumbnail": self.getThumbnailUrl()
        }

    """
    def canReadProject(self, project):
        if UserRight.objects.filter(project=project, user=rights.getPublicGroup()).count() > 0:
            return True
        if UserRight.objects.filter(project=project, user=self).count() > 0:
            return True
        return False
    """

class UserRight(PObject) :

    right = models.CharField(blank=True, choices = UserRightType, max_length=255)
    project = models.ForeignKey('Project', null=True, on_delete=models.SET_NULL, related_name='userRights')
    user = models.ForeignKey('ProsperoUser', null=True, on_delete=models.SET_NULL, related_name='userRights')

    def __str__(self):
        return "[" + str(self.id) + ":UserRight]"

    def getRealInstance(self):
        return self

    def serialize(self):
        return {
            "identity" : self.serializeIdentity(),
            "right": self.right,
            "user": self.user.id
        }

class ProjectConf(PObject) :

    project = models.ForeignKey('Project', null=True, blank=True, on_delete=models.SET_NULL, related_name='projectConfs')
    puser = models.ForeignKey('PUser', null=True, blank=True, on_delete=models.SET_NULL, related_name='projectConfs')
    selectedDicos = models.ManyToManyField('Dictionnary', blank=True, related_name='projectConfs')

    def __str__(self):
        return "[" + str(self.id) + ":ProjectConf] "+str(self.puser)+" "+str(self.project)

    def getRealInstance(self):
        return self

    def getSelectedDicos(self):
        res = []
        for elt in self.selectedDicos.all():
            res.append(elt.getRealInstance())
        return res

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