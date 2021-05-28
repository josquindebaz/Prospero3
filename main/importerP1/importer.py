import ntpath, os
from main.importerP1 import builder, reader

def walk(file):
    print("walk file", file.name)
    fileName = ntpath.basename(file.name)
    extension = fileName.split(".")[-1].lower()
    if extension == "dic":
        return walkSyntaxicalDict(file)
    elif extension == "col":
        return walkSemanticDict(file, builder.createCollectionDictionnary, builder.createCollection)
    elif extension == "fic":
        return walkSemanticDict(file, builder.createFictionDictionnary, builder.createFiction)
    elif extension == "cat":
        return walkCategoryDict(file)
    elif extension == "ctx":
        return walkMetaData(file)
    elif extension == "prc":
        return walkProject(file)
    else:
        raise Exception("extension not supported")

def walkSyntaxicalDict(file):
    fileName = ntpath.basename(file.name)
    tab = fileName.split("_")
    dico = builder.createLexicalDictionnary(tab[1].split(".")[0], tab[0])
    pck = builder.createDictPackage("")
    builder.add(dico, "elements", pck)
    for x in reader.getFileLines(file):
        if x == "ENDFILE":
            break
        elt = builder.createDictElement(x)
        builder.add(pck, "elements", elt)
    return dico

def walkSemanticDict(file, createDictionnaryFunc, createEntityFunc):
    fileName = ntpath.basename(file.name)
    dico = createDictionnaryFunc(fileName.split(".")[0])
    lines = reader.getFileLines(file)
    lines.pop(0)
    state = "IDLE"
    currentStack = []
    current = dico
    while lines:
        if state == "IDLE":
            elt = lines.pop(0)
            if elt == "ENDFILE":
                break
            else:
                elt = lines.pop(0)  # avoid FICTION keyword
                currentStack.append(current)
                entity = createEntityFunc(elt)
                builder.add(current, "elements", entity)
                current = entity
                state = "FICTION"
        elif state == "FICTION":
            elt = lines.pop(0)
            if elt == "ENDFICTION":
                state = "IDLE"
                current = currentStack.pop()
            else:
                currentStack.append(current)
                pck = builder.createDictPackage(elt)
                builder.add(current, "elements", pck)
                current = pck
                state = "PCK"
        elif state == "PCK":
            elt = lines.pop(0)
            if elt == "END":
                state = "FICTION"
                current = currentStack.pop()
            else:
                elt = builder.createDictElement(elt)
                builder.add(current, "elements", elt)
    return dico

def walkCategoryDict(file):
    fileName = ntpath.basename(file.name)
    dico = builder.createCategoryDictionnary(fileName.split(".")[0])
    lines = reader.getFileLines(file)
    lines.pop(0)
    state = "IDLE"
    currentStack = []
    current = dico
    while lines:
        if state == "IDLE":
            elt = lines.pop(0)
            if elt == "ENDFILE":
                break
            else:
                currentStack.append(current)
                catType = elt.replace("*", "")
                elt = lines.pop(0)
                category = builder.createCategory(elt, catType)
                builder.add(current, "elements", category)
                current = category
                state = "CATEGORY"
        elif state == "CATEGORY":
            elt = lines.pop(0)
            if elt == "END":
                state = "IDLE"
                lines.pop(0) # avoid ENDCAT
                current = currentStack.pop()
            else:
                elt = builder.createDictElement(elt)
                builder.add(current, "elements", elt)
    return dico

def walkMetaData(file):
    lines = reader.getFileLines(file, keepVoidLines=True)
    lines.pop(0)
    data = []
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("titre", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("auteur", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("narrateur", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("destinataire", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("date", "Date", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("nomPublication", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("typePublication", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("observation", "Text", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("statutAuteur", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("lieuEmission", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("champLibre1", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("champLibre2", "String", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("calcul1", "Boolean", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("calcul2", "Boolean", value))
    value = lines.pop(0).strip()
    if value:
        data.append(builder.createMetaData("heureMin", "Hour", value))
    associatedData = []
    while len(lines) > 0:
        line = lines.pop(0)
        if line.startswith("REF_EXT:"):
            associatedData.append(builder.createPResource(line[8:]))
    return data, associatedData

def walkProject(file):
    fileName = ntpath.basename(file.name)
    project = builder.createProject(fileName.split(".")[0])
    lines = reader.getFileLines(file)
    lines.pop(0)
    builder.set(project, "dicPath", lines.pop(0))
    builder.set(project, "ficPath", lines.pop(0))
    builder.set(project, "catPath", lines.pop(0))
    builder.set(project, "colPath", lines.pop(0))
    builder.set(project, "language", lines.pop(0))
    while True:
        if len(lines) > 0:
            textPath = lines.pop(0)
            if textPath == "ENDFILE":
                break
            textPath = reader.normalizePath(textPath)
            path = os.path.dirname(textPath)+"/"
            fileName = ntpath.basename(textPath)
            tab = fileName.split(".")
            tab[len(tab)-1] = "CTX"
            fileName = ".".join(tab)
            ctxFile = open(path + fileName)
            data, associatedData = walkMetaData(ctxFile)
            text = builder.createText(textPath, data, associatedData)
            builder.add(project, "texts", text)
        else:
            break
    return project