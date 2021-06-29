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
