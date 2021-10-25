from django.db.models import Q
publicGroup = None
anonymousUser = None

def getPublicGroup():
    global publicGroup
    if not publicGroup:
        publicGroup = gotPublicGroup()
    return publicGroup

def gotPublicGroup():
    from main.models import PGroup
    try:
        publicGroup = PGroup.objects.get(username="Public")
    except:
        from main.importerP1 import builder2BD as builder
        publicGroup = builder.createPGroup("Public")
        publicGroup.setThumbnailUrl("/media_site/testData/images/groupPublic.png")
    return publicGroup

def getAnonymousUser():
    global anonymousUser
    if not anonymousUser:
        anonymousUser = gotAnonymousUser()
    return anonymousUser

def gotAnonymousUser():
    from main.models import PUser
    try:
        anonymousUser = PUser.objects.get(username="anonymous")
    except:
        from main.importerP1 import builder2BD as builder
        anonymousUser = builder.createPUser("anonymous")
        anonymousUser.setThumbnailUrl("/media_site/testData/images/anonymous_user.jpg")
    return anonymousUser

def canWrite(user, project):
    rights = getRights(user, project)
    return "Write" in rights or "Owner" in rights
    #return project in Project.objects.filter(Q(userRights__user__in=users) & (Q(userRights__right="Write") | Q(userRights__right="Owner"))).distinct()

def canRead(user, project):
    rights = getRights(user, project)
    return "Read" in rights or "Write" in rights or "Owner" in rights

def getRights(user, project):
    from main.models import UserRight
    users = [user, getPublicGroup()]
    users.extend(user.groups.all())
    rights = list(set(UserRight.objects.filter(Q(user__in=users) & Q(project=project)).distinct().values_list("right", flat=True)))
    return rights