import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'prospero.settings'
import django
django.setup()
from prospero import settings
from main.models import *
from main.importerP1 import builder2BD as builder
from django.contrib import admin

# Register your models here.
from django.apps import apps
models = apps.get_models("main")
for model in models:
    if model.__module__ == "main.models":
        print(model, model.objects.count())
        for x in model.objects.all():
            x.delete()

loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut interdum purus quis nunc eleifend, in molestie ante pellentesque. Suspendisse sit amet odio dui. Mauris tortor libero, vulputate dapibus tortor ac, commodo consectetur erat. Vestibulum elit lorem, finibus ut velit sed, malesuada porttitor justo."

def gotPTag(name):
    try:
        return PTag.objects.get(name=name)
    except:
        tag = PTag(name=name)
        tag.save()
        return tag

def createProject(name, tags, owner):
    p = Project(name=name, owner=owner, description=loremIpsum)
    p.save()
    for tag in tags.split(","):
        tag = gotPTag(tag.strip())
        p.tags.add(tag)
    corpus = PCorpus(name="main", author="John")
    corpus.save()
    p.corpuses.add(corpus)
    return p

def createAugmentedDatas(object):
    object.metaDatas.add(builder.createMetaData("string", "String", "une valeur"))
    object.metaDatas.add(builder.createMetaData("date", "Datetime", "01/01/2020"))
    object.metaDatas.add(builder.createMetaData("text", "Text", "aaa\nbbb\nccc"))
    object.associatedDatas.add(builder.createPResource("c:/file.pdf"))

def createPUser(username, first_name, last_name, thumbnail=None):
    user = PUser(username=username, first_name=first_name, last_name=last_name)
    if not thumbnail:
        thumbnail = settings.MEDIA_ROOT+"users/thumbnails/anonymous_user.jpg"
    user.thumbnail = thumbnail
    user.save()
    return user

def createPGroup(username, thumbnail=None):
    group = PGroup(username=username)
    if not thumbnail:
        thumbnail = settings.MEDIA_ROOT+"users/thumbnails/anonymous_user.jpg"
    group.thumbnail = thumbnail
    group.save()
    return group

if PUser.objects.count() == 0:
    josquin = createPUser("josquin@gmail.com", "Josquin", "Debaz", settings.MEDIA_ROOT+"users/thumbnails/josquin.jpg")
    group = createPGroup("GSPR")
    group.users.add(josquin)
    user = josquin
    group = createPGroup("Public")
    anonymous = createPUser("anonymous", "", "", settings.MEDIA_ROOT+"users/thumbnails/anonymous_user.jpg")
else:
    user = PUser.objects.all()[0]

project = createProject("Project test", "ipsum, dolor, sit, amet, consectetur, adipiscing, elit, ut, interdum", user)
createAugmentedDatas(project.corpuses.first())
projectNames = [
    "Alertes Varia",
    "Algues vertes et nitrates",
    "Amiante 2010",
    "Amiante historique (1970 - 2010)",
    "AMIANTO_IT",
    "Antibiorésistance",
    "Aspartame",
    "Biologie synthétique",
    "BPA",
    "Changement climatique",
    "Dioxine",
    "Eternit",
    "Frack Gas",
    "Participatory Sciences and Biodiversity",
    "Gaz de schiste",
    "H0N1",
    "H4N1",
    "Lanceurs d'alertes - une histoire politique",
    "Nucléaire (1944 - 2013) socle",
    "Test1",
    "Test2",
    "Test3",
    "Test4",
    "Test5",
    "Test6",
    "Test7",
    "Test8",
    "Test9",
    "Test10",
    "Test11",
    "Test12",
    "Test13",
    "Test14",
    "Test15",
    "Test16",
    "Test17",
    "Test18",
    "Test19",
    "Test20",
    "Test41",
    "Test42",
    "Test43",
    "Test44",
    "Test45",
    "Test46",
    "Test47",
    "Test48",
    "Test49",
    "Test50",
    "Test51",
    "Test52",
    "Test53",
    "Test54",
    "Test55",
    "Test56",
    "Test57",
    "Test58",
    "Test59",
    "Test60",
]
for name in projectNames:
    createProject(name, "purus, quis, nunc", user)

for i in range(0, 15):
    createPUser("test"+str(i)+"@gmail.com", "John", "Doe")

for i in range(0, 10):
    createPGroup("group"+str(i))
