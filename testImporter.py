import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'prospero.settings'
import django
django.setup()
from prospero import settings
from main.models import *


from main.importerP1 import builder, importer, reader
from main.exporterP1 import exporter

testResultFolder = reader.repoFolder + "test/result/"

#data = importMetaData(open(repoFolder+"TC/taxe_carbone_web.CTX"))

data = importer.walk(open(reader.repoFolder+"TC/1-dico/fr_epreu.dic"))
exporter.dumpStructuredData(data, testResultFolder+"dic.txt")

data = importer.walk(open(reader.repoFolder+"TC/1-dico/GdS.fic"))
exporter.dumpStructuredData(data, testResultFolder+"fic.txt")

data = importer.walk(open(reader.repoFolder+"TC/1-dico/GdS.col"))
exporter.dumpStructuredData(data, testResultFolder+"col.txt")

data = importer.walk(open(reader.repoFolder+"TC/1-dico/GdS.cat"))
exporter.dumpStructuredData(data, testResultFolder+"cat.txt")

data = importer.walk(open(reader.repoFolder+"TC/tc-presse.prc"))
exporter.dumpStructuredData(data, testResultFolder+"prc.txt")
