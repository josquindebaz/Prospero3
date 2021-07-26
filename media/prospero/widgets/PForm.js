class PForm extends PObject {

	constructor($node, view) {
	    super($node);
	    this.fields = {};
	    this.fieldsInError = [];
	}
	addField(name, field) {
	    this.fields[name] = field;
	}
	getField(name) {
	    return this.fields[name];
	}
	serialize() {
        var result = {};
        $.each(this.fields, function(name, widget) {
            result[name] = {
                value : widget.getValue(),
                id : widget.uniqueId()
            };
        });
	    return result;
	}
	setErrors(fields) {
        var self = this;
        $.each(fields, function(key, fieldData) {
            var field = prospero.get(self.node.find("#"+fieldData.id));
            field.setAsInvalid(fieldData.error);
            self.fieldsInError.push(field);
        });
	}
	setError(fieldName, errorMessage) {
	    var field = this.getField(fieldName);
	    field.setAsInvalid(errorMessage);
        this.fieldsInError.push(field);
	}
	clear(exceptFieldNames) {
	    var self = this;
	    $.each(this.fields, function(name, field) {
	        if (!_.contains(exceptFieldNames, name)) {
                //if (_.contains(self.fieldsInError, field))
                if (field.setAsValid)
                    field.setAsValid();
                field.clear();
	        }
	    });
	    this.fieldsInError = [];
	}
	load(data) {
	    var self = this;
	    /*$.each(data, function(name, value) {
	        self.fields[name].setValue(value)
	    });*/
	    $.each(self.fields, function(name, field) {
	        field.setValue(data[name]);
	    });

	}
}

