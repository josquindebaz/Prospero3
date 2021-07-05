from main.models import *
from django.db.models import Q

def getObjects(querySet, filters):
    sorting = filters["sort"]
    sortingProp = sorting["property"]
    sortingAsc = sorting["ascendant"]
    querySet = querySet.order_by(sortingProp if sortingAsc else "-"+sortingProp)

    pagination = filters["pagination"]
    frameSize = pagination["frameSize"]
    page = pagination["page"]
    index1 = page * frameSize
    index2 = index1 + frameSize
    if querySet.count() < index1:
        pagination["end"] = True
        return []
    else:
        pagination["page"] = page + 1
        return querySet.all()[index1:index2]

def getUsers(querySet, filters, pagination):
    if "sort" in filters:
        sorting = filters["sort"]
        sortingProp = sorting["property"]
        sortingAsc = sorting["ascendant"]
        querySet = querySet.order_by(sortingProp if sortingAsc else "-"+sortingProp)
    if "search" in filters:
        search = filters["search"]
        if not search:
            querySet = Project.objects.all()
        else:
            querySet = Project.objects.filter(Q(username__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search)).distinct()
    frameSize = pagination["frameSize"]
    page = pagination["page"]
    index1 = page * frameSize
    index2 = index1 + frameSize
    if querySet.count() < index1:
        pagination["end"] = True
        return []
    else:
        pagination["page"] = page + 1
        querySet = querySet.all()
        if querySet.count() <= index2:
            pagination["end"] = True
        return querySet.all()[index1:index2]

def getProjects(pagination, filters):
    search = filters["search"]
    if not search:
        querySet = Project.objects.all()
    else:
        querySet = Project.objects.filter(corpuses__texts__text__icontains=search).distinct()
    querySet = querySet.order_by(filters["sort"])
    frameSize = pagination["frameSize"]
    page = pagination["page"]
    index1 = page * frameSize
    index2 = index1 + frameSize

    if querySet.count() < index1:
        pagination["end"] = True
        return []
    else:
        pagination["page"] = page + 1
        querySet = querySet.all()
        if querySet.count() <= index2:
            pagination["end"] = True
        return querySet[index1:index2]