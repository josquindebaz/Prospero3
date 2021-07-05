class Form:

    def __init__(self, fields, *args, **kwargs):
        self.fields = fields

    def getValue(self, fieldName):
        return self.fields[fieldName]["value"]

    def setError(self, fieldName, errorMessage):
        self.fields[fieldName]["error"] = errorMessage

    def getErrors(self):
        result = {}
        for fieldName in self.fields:
            if "error" in self.fields[fieldName]:
                result[fieldName] = self.fields[fieldName]
        return result

    def checkRequired(self, fieldName, errorMessage):
        field = self.fields[fieldName]
        value = field["value"]
        if  value == None or value == "":
            field["error"] = errorMessage
            return False
        return True

    def hasErrors(self):
        for fieldName in self.fields:
            if "error" in self.fields[fieldName]:
                return True
        return False
