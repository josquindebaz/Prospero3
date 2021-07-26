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

@register.filter
def inArray(value, item):
    return item in value

@register.filter
def txtConcise(value, maxChars):
    if len(value) <= maxChars:
        return value
    else:
        return value[:maxChars-4]+" ..."

