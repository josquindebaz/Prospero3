import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'prospero.settings'
import django
django.setup()
from prospero import settings
from main.models import *

from main.importerP1 import importer, reader
from main.importerP1 import builder2Json as builder
from main.exporterP1 import exporterFromJson as exporter
#from main.importerP1 import builder2BD as builder
#from main.exporterP1 import jsonSerializer as exporter

testResultFolder = reader.repoFolder + "test/result/"

"""
data = importer.walk(open(reader.repoFolder+"TC/1-dico/fr_epreu.dic"), builder)
#data = LexicalDictionnary.objects.all()[0]
exporter.export(data, testResultFolder+"dic.txt")

data = importer.walk(open(reader.repoFolder+"TC/1-dico/GdS.fic"), builder)
exporter.export(data, testResultFolder+"fic.txt")

data = importer.walk(open(reader.repoFolder+"TC/1-dico/GdS.col"), builder)
exporter.export(data, testResultFolder+"col.txt")
"""

"""
data = importer.walk(open(reader.repoFolder+"TC/1-dico/GdS.cat"), builder)
exporter.export(data, testResultFolder+"cat.txt")
"""

data = importer.walk(open(reader.repoFolder+"TC/tc-presse.prc"), builder)
exporter.export(data, testResultFolder+"prc.txt")