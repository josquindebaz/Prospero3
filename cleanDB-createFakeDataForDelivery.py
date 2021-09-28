import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'prospero.settings'
import django
django.setup()
from prospero import settings
from main.models import *
from main.importerP1 import builder2BD as builder
from django.contrib import admin
from django.apps import apps
from main.helpers import users

import random, time
from datetime import datetime
from django.utils.timezone import make_aware
from time import mktime

def deleteAll():
    models = apps.get_models("main")
    for model in models:
        if model.__module__ == "main.models":
            print(model, model.objects.count())
            for x in model.objects.all():
                try:
                    x.getRealInstance().delete()
                except:
                    x.delete()

# random_date("1/1/2008 1:30 PM", "1/1/2009 4:50 AM", '%m/%d/%Y %I:%M %p')
def random_date(start, end, time_format):
    prop = random.random()
    stime = time.mktime(time.strptime(start, time_format))
    etime = time.mktime(time.strptime(end, time_format))
    ptime = stime + prop * (etime - stime)
    result = time.localtime(ptime)
    result = datetime.fromtimestamp(mktime(result)) # convert to datetime
    result = make_aware(result) # add timezone
    return result

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
loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut interdum purus quis nunc eleifend, in molestie ante pellentesque. Suspendisse sit amet odio dui. Mauris tortor libero, vulputate dapibus tortor ac, commodo consectetur erat. Vestibulum elit lorem, finibus ut velit sed, malesuada porttitor justo."
possibleTags = ["ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "ut", "interdum"]
possibleCreators = []
possibleUsersWithRights = []
possibleRights = ["Read", "Write", "Owner"]
publicGroup = None

def gotPTag(name):
    try:
        return PTag.objects.get(name=name)
    except:
        tag = PTag(name=name)
        tag.save()
        return tag

def createProject(name, owner=None, randomCreationDate=True, tags=None, description=loremIpsum):
    if not owner:
        owner = random.sample(possibleCreators, 1)[0]
    print("createProject", name, owner)
    p = builder.createProject(name, owner)
    #p = Project(name=name, owner=owner, description=description)
    p.description = description    
    p.save()
    if randomCreationDate:
        p.creationDate = random_date("1/1/2010 1:30 PM", "7/6/2021 4:50 AM", '%m/%d/%Y %I:%M %p')
        p.save()
    tagList = []
    if not tags:
        tagList = random.sample(possibleTags, random.randint(0, len(possibleTags)-1))
    else:
        for tag in tags.split(","):
            tagList.append(tag.strip())
    for tag in tagList:
        tag = gotPTag(tag.strip())
        p.tags.add(tag)
    return p

def createUserRight(user, right, project):
    print("createUserRight", user, right, project)
    builder.createUserRight(user, right, project)

def createAugmentedDatas(object):
    print("createAugmentedDatas", object)
    object.metaDatas.add(builder.createMetaData("string", "String", "une valeur"))
    object.metaDatas.add(builder.createMetaData("date", "Datetime", "01/01/2020"))
    object.metaDatas.add(builder.createMetaData("text", "Text", "aaa\nbbb\nccc"))
    object.associatedDatas.add(builder.createPResource("c:/file.pdf"))

def createPUser(username, first_name, last_name, thumbnail=None, inPossibleCreators=True, inPossibleUsersWithRights=True, setPassword=True, isAdministrator=False):
    print("createPUser", username)
    user = builder.createPUser(username, first_name, last_name)
    user.isAdministrator = isAdministrator
    #user = PUser(username=username, first_name=first_name, last_name=last_name)
    user.save()
    if not thumbnail:
        thumbnail = "/media_site/testData/images/fake_thumbnail.jpg"
    user.setThumbnailUrl(thumbnail)
    if inPossibleCreators:
        possibleCreators.append(user)
    if inPossibleUsersWithRights:
        possibleUsersWithRights.append(user)
    if setPassword:
        users.setPassword(user, "00000000")
        user.save()
    return user

def createPGroup(username, thumbnail=None, inPossibleUsersWithRights=True):
    print("createPGroup", username)
    group = builder.createPGroup(username)
    #group = PGroup(username=username)
    group.save()
    if not thumbnail:
        thumbnail = "/media_site/testData/images/fake_thumbnail.jpg"
    group.setThumbnailUrl(thumbnail)
    if inPossibleUsersWithRights:
        possibleUsersWithRights.append(group)
    return group

def createFakeObjects():
    josquin = createPUser("josquin.debaz@ehess.fr", "Josquin", "Debaz", "/media_site/testData/images/josquin.jpg", isAdministrator=True)
    francis = createPUser("chateau@msh-paris.fr", "Francis", "Chateauraynaud", "/media_site/testData/images/francis.jpg", isAdministrator=True)
    orelie = createPUser("orelie.desfriches-doria@univ-paris8.fr", "Orélie", "Desfriches-Doria", "/media_site/testData/images/orelie.jpg", isAdministrator=True)
    waldir = createPUser("waldir@lisboarocha.com", "Waldir", "Lisboa Rocha", isAdministrator=True)
    aymeric = createPUser("aymeric.luneau@gmail.com", "Aymeric", "Luneau", isAdministrator=True)
    robin = createPUser("robin.dianoux@gmail.com", "Robin", "Dianoux", isAdministrator=True)
    salcedo = createPUser("hernando.salcedo@ehess.fr", "Salcedo", "Hernando", isAdministrator=True)
    jerome = createPUser("jerome.gaillaguet@hotmail.fr", "Jerome", "Gaillaguet", isAdministrator=True)
    erwan = createPUser("erwan.brottier@gmail.com", "Erwan", "Brottier", isAdministrator=True)

    anonymous = createPUser("anonymous", "", "", "/media_site/testData/images/anonymous_user.jpg", inPossibleCreators=False, inPossibleUsersWithRights=False, setPassword=False)
    groupGSPR = createPGroup("GSPR", "/media_site/testData/images/gspr.png")
    groupGSPR.users.add(josquin)
    groupGSPR.users.add(francis)
    groupProspero = createPGroup("Prospero")
    groupProspero.users.add(josquin)
    groupProspero.users.add(francis)
    groupProspero.users.add(orelie)
    groupProspero.users.add(waldir)
    groupProspero.users.add(aymeric)
    groupProspero.users.add(robin)
    groupProspero.users.add(salcedo)
    groupProspero.users.add(jerome)
    groupProspero.users.add(erwan)

    global publicGroup
    publicGroup = createPGroup("Public", "/media_site/testData/images/groupPublic.png", inPossibleUsersWithRights=False)

    #description = loremIpsum+loremIpsum+loremIpsum+loremIpsum+loremIpsum+loremIpsum
    description = "Ce projet est un exemple accessible à tous pour illustration (le groupe public en est propriétaire, autrement dit tous les utilisateurs ont tous les droits de modifications).\n Vous pouvez bien sûr créer vos propres projets. Pour cela, connectez-vous !\n Votre mot de passe par défaut est 00000000. Puisque vous êtes tous administrateur, vous pouvez accéder aux préférences et modifier votre mot de passe (et celui des autres ... ;-)."
    project = createProject("Project test", erwan, randomCreationDate=False, description=description)
    createUserRight(publicGroup, "Owner", project)
    createAugmentedDatas(project.corpuses.first())

deleteAll()
createFakeObjects()
