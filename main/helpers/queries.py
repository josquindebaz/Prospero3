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