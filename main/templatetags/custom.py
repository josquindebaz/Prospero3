from django import template
register = template.Library()
import json

@register.filter
def dump(value):
    if value == '':
        value = None
    elif type(value) == str:
        return value
    return json.dumps(value)

@register.filter
def dateConcise(value):
    if not value:
        value = None
    else:
        return value.strftime('%d-%m-%Y')
    return json.dumps(value)