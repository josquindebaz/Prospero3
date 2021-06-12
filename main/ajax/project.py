from prospero import settings
from main.models import *
from django.template import loader

def renderTable(request, data, results):
    results["table"] = [
        ["AAA", "BBB", "CCC"],
        ["AAA2", "BBB2", "CCC2"]
    ]
