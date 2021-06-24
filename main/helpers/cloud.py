import os, ntpath, time
from main.helpers import files
from prospero import settings

# return the preferredAbsolutePath if file does not exist,
#     else return new path that does not exist
def findAvailableAbsolutePath(preferredAbsolutePath):
    preferredAbsolutePath = preferredAbsolutePath.replace('\\', '/')
    fileFolder = os.path.dirname(preferredAbsolutePath)+"/"
    fileName = ntpath.basename(preferredAbsolutePath)
    if os.path.isfile(preferredAbsolutePath):
        tab = fileName.split(".")
        if len(tab) > 0:
            extension = "."+tab[len(tab)-1]
            fileName = ".".join(tab[:len(tab)-1])
        else:
            extension = ""
        index = 1
        tab = fileName.split("_")
        if len(tab) > 0:
            try:
                index = int(tab[len(tab)-1])+1
                fileName = "_".join(tab[:len(tab)-1])
            except:
                pass
        while os.path.isfile(fileFolder+fileName + "_" + str(index) + extension):
            index = index + 1
        fileName = fileName + "_" + str(index) + extension
    return fileFolder+fileName

def getStampedCloudFolder(mediaFolder):
    timestamp = str(time.time())
    relativeFileFolder = mediaFolder + '/' + timestamp + '/'
    fileFolder = settings.MEDIA_ROOT + relativeFileFolder
    files.gotFolder(fileFolder)
    return fileFolder

def getMediaRelativePath(path):
    return files.getRelativePath(path, settings.MEDIA_ROOT)

def getMediaRelativeUrl(path):
    return "/media_site/"+getMediaRelativePath(path)

def gotProjectDataFolder(project):
    folder = settings.MEDIA_ROOT + "projectData/" + project.name + "/"
    return files.createFolder(folder)