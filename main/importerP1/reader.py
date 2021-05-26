repoFolder = "data2Import/"
repoFolderEquivalent = "C:/corpus/"

def getFileLines(file, keepVoidLines=False):
    lines = []
    text = file.read()
    for x in text.split("\n"):
        x = x.strip()
        if x or keepVoidLines:
            lines.append(x)
    return lines

def normalizePath(path):
    path = path.replace("\\", "/")
    if path.startswith(repoFolderEquivalent):
        path = repoFolder + path[len(repoFolderEquivalent):]
    return path
