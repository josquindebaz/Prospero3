from main.models import *
from main.helpers import frontend

def getTagsData(request, data, results):
    tags = {}
    for tag in PTag.objects.all():
        tags[str(tag.id)] = tag.name
    results["tags"] = tags

def addTag(request, data, results):
    pobject = frontend.getBDObject(data["identity"])
    if not "id" in data:
        value = data["value"]
        try:
            tag = PTag.objects.get(value=value)
        except:
            tag = PTag(name=value)
            tag.save()
        results["newTag"] = tag.serialize()
    else:
        tag = PTag.objects.get(id=data["id"])
    pobject.tags.add(tag)

def removeTag(request, data, results):
    pobject = frontend.getBDObject(data["identity"])
    tag = PTag.objects.get(id=data["id"])
    pobject.tags.remove(tag)
    if tag.taggedElements.count() == 0:
        tag.delete()
        results["deletedTag"] = True

