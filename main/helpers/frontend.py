from main.models import *

def getBDObject(data):
    return globals()[data["model"]].objects.get(id=data["id"])