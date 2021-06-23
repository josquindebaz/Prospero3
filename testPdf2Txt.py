import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'prospero.settings'
import django
django.setup()
from prospero import settings
from main.models import *
import pdftotext

pdfFile = settings.ROOT+"data2Import/exempleTxt.pdf"
print(pdfFile)
# Load your PDF
with open("exempleTxt.pdf", "rb") as f:
    pdf = pdftotext.PDF(f)

# How many pages?
#print(len(pdf))

# Iterate over all the pages
#for page in pdf:
#    print(page)

# Read all the text into one string
txt = "\n\n".join(pdf)
print(txt)
