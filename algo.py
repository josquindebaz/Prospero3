import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'prospero.settings'
import django
django.setup()
from prospero import settings
from main.models import *
from main.helpers import files
import ntpath

def findCtxFile(txtFile):
    fileName = files.getFileName(txtFile, False)
    folder = files.gotFolder(txtFile)
    for file in files.findFilesWithExtension(folder, "ctx"):
        if files.getFileName(file, False) == fileName:
            return folder+file

def importData(folder):
    # unzip if necessary
    for file in files.getAllFiles(folder):
        if files.getFileExtension(file) == "zip":
            extractionFolderName = files.getFileName(file, withExtension=False)+"/"
            extractionFolder = files.gotFolder(files.gotFolder(file)+extractionFolderName)
            files.extratZIP(file, extractionFolder)
    # treat files
    for file in files.getAllFiles(folder, True):
        fileName = ntpath.basename(file)
        extension = fileName.split(".")[-1].lower()
        if extension in ["dic", "col", "fic", "cat"]:
            print("walk "+extension, file)
        elif extension == "txt":
            print("walk txt", file)
            ctxFile = findCtxFile(file)
            if ctxFile:
                print("walk ctx", ctxFile)

importData(settings.MEDIA_ROOT+"upload/xxxxx/")
