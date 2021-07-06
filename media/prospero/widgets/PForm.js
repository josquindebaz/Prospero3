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
	clear() {
	    $.each(this.fieldsInError, function(index, field) {
	        field.setAsValid();
	        field.clear();
	    });
	    $.each(this.fields, function(name, field) {
	        field.clear();
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

