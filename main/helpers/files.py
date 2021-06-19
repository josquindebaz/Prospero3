import os, ntpath, shutil
from fnmatch import filter
import chardet, codecs

import zipfile

mime_types = dict(
    txt='text/plain',
    htm='text/html',
    html='text/html',
    php='text/html',
    css='text/css',
    js='application/javascript',
    json='application/json',
    xml='application/xml',
    swf='application/x-shockwave-flash',
    flv='video/x-flv',

    # images
    png='image/png',
    jpe='image/jpeg',
    jpeg='image/jpeg',
    jpg='image/jpeg',
    gif='image/gif',
    bmp='image/bmp',
    ico='image/vnd.microsoft.icon',
    tiff='image/tiff',
    tif='image/tiff',
    svg='image/svg+xml',
    svgz='image/svg+xml',

    # archives
    zip='application/zip',
    rar='application/x-rar-compressed',
    exe='application/x-msdownload',
    msi='application/x-msdownload',
    cab='application/vnd.ms-cab-compressed',

    # audio/video
    mp3='audio/mpeg',
    ogg='audio/ogg',
    qt='video/quicktime',
    mov='video/quicktime',

    # adobe
    pdf='application/pdf',
    psd='image/vnd.adobe.photoshop',
    ai='application/postscript',
    eps='application/postscript',
    ps='application/postscript',

    # ms office
    doc='application/msword',
    rtf='application/rtf',
    xls='application/vnd.ms-excel',
    ppt='application/vnd.ms-powerpoint',

    # open office
    odt='application/vnd.oasis.opendocument.text',
    ods='application/vnd.oasis.opendocument.spreadsheet',
)

def getFileExtension(file):
    return os.path.splitext(file)[1][1:].lower()

def getMimeType(filename):
    ext = getFileExtension(filename)
    if ext in mime_types:
        return mime_types[ext]
    else:
        return 'application/octet-stream'

def moveFile(sourceFile, targetFile):
    gotFolder(targetFile)
    shutil.move(sourceFile, targetFile)
    #cleanFolder(getFolder(sourceFile))

def renameFile(filePath, newName, overwrite=False):
    folder = os.path.dirname(filePath) + "/"
    newFilePath = folder+newName
    if overwrite and exists(newFilePath):
        deleteFile(newFilePath)
    os.rename(filePath, newFilePath)
    return newFilePath

def deleteFile(file):
    if os.path.isdir(file):
        shutil.rmtree(file)
    else:
        os.remove(file)

def cleanFolder(folder):
    if isFolderEmpty(folder):
        os.rmdir(folder)

def getFileName(file, withExtension=True):
    result = ntpath.basename(file)
    if not withExtension:
        result = os.path.splitext(result)[0]
    return result


def exists(file):
    return os.path.exists(file)

def gotFolder(file):
    folder = os.path.dirname(file) + "/"
    if not os.path.exists(folder):
        os.makedirs(folder)
    return folder

def isFolderEmpty(folder):
    return not os.listdir(folder)

def copyFile(sourceFile, targetFile):
    gotFolder(targetFile)
    shutil.copy(sourceFile, targetFile)

def getAllFiles(path, recursive=False):
    if recursive:
        files = []
        # r = root, d = directories, f = files
        for r, d, f in os.walk(path):
            for file in f:
                files.append(os.path.join(r, file).replace("\\", "/"))
        lst = [file for file in files]
        return lst
    else:
        files = []
        for fileName in os.listdir(path):
            file = os.path.join(path, fileName)
            if os.path.isfile(file):
                files.append(file)
        return files

def extratZIP(file, targetFolder):
    with zipfile.ZipFile(file, 'r') as zip_ref:
        zip_ref.extractall(targetFolder)

# find all files in folder which are the following extension (case-insensitive)
def findFilesWithExtension(folder, extension):
    regExp = '*.'
    for c in extension:
        regExp = regExp + '[' + c.upper() + c.lower() + ']'
    return filter(os.listdir(folder), regExp)

def detectEncoding(filePath):
    rawdata = open(filePath, 'rb').read()
    result = chardet.detect(rawdata)
    return result['encoding']

def detectEncodingAndRead(filePath):
    encoding = detectEncoding(filePath)
    file = codecs.open(filePath, "r", encoding)
    text = file.read()
    #print(type(text))
    # text = text.encode('utf-8')
    # print("done")
    return text

