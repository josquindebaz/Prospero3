import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'dashboard.settings'
import django
django.setup()
from dashboard import settings
from main.models import *

import code
vars = globals().copy()
vars.update(locals())
shell = code.InteractiveConsole(vars)
shell.interact()