from django.db.models import Q
publicGroup = None
anonymousUser = None

def getPublicGroup():
    global publicGroup
    if not publicGroup:
        from main.models import PGroup
        publicGroup = PGroup.objects.get(username="Public")
    return publicGroup

def getAnonymousUser():
    global anonymousUser
    if not anonymousUser:
        from main.models import PUser
        anonymousUser = PUser.objects.get(username="anonymous")
    return anonymousUser

def canWrite(user, project):
    rights = getRights(user, project)
    return "Write" in rights or "Owner" in rights
    #return project in Project.objects.filter(Q(userRights__user__in=users) & (Q(userRights__right="Write") | Q(userRights__right="Owner"))).distinct()


def getRights(user, project):
    from main.models import UserRight
    users = [user, getPublicGroup()]
    users.extend(user.groups.all())
    rights = list(set(UserRight.objects.filter(Q(user__in=users) & Q(project=project)).distinct().values_list("right", flat=True)))
    return rights