class PButton extends PObject {
	constructor($node) {
	    super($node);
	    var self = this;
	    self.node.bind("click", function(event) {
	        console.log("click");
            self.notifyObservers({
                name: "click",
                target: self,
                original: event
            });
	    });
    }
}
class PInputField extends PObject {
	constructor($node) {
	    super($node);
	    this.initFieldNode();
	    this.bindChange();
    }
    bindChange() {
        var self = this;
	    self.fieldNode.bind("keyup blur change input", function(event) {
	        self.setAsValid();
            self.notifyObservers({
                name: "valueChanged",
                target: self,
                original: event
            });
	    });
    }
    setAsInvalid(message) {
        if (message)
            this.node.find(".invalid-feedback").text(message);
        if (this.fieldNode)
            this.fieldNode.addClass("is-invalid");
    }
    setAsValid() {
        if (this.fieldNode)
            this.fieldNode.removeClass("is-invalid");
    }
    getValue() {
        return this.fieldNode.val();
    }
    setValue(value) {
        this.fieldNode.val(value);
    }
}
class PTextarea extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("textarea");
	}
}
class PTextInput extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("input");
	}
}
class PCheckInput extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("input").addBack('input');
	}
    getValue() {
        return this.fieldNode.val();
    }
    setValue(value) {
        this.fieldNode.val(value);
    }
    bindChange() {
        var self = this;
	    self.fieldNode.bind("click", function(event) {
	        //event.preventDefault();
	        event.stopPropagation();
	        self.setAsValid();
            self.notifyObservers({
                name: "valueChanged",
                target: self,
                original: event
            });
	    });
    }
}
class PRadioInput extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	}
	initFieldNode() {
	}
    getValue() {
        return this.node.find("input:checked").attr("value");
    }
    setValue(value) {
        this.node.find("input").prop('checked', false);
        this.node.find("input[value="+value+"]").prop('checked', true);
    }
    setOptionEnabled(optionValue, enabled) {
        this.node.find("input[value="+optionValue+"]").prop('disabled', !enabled);
    }
    getEnabledOptions() {
        return this.node.find("input:not(:disabled)");
    }
    bindChange() {
        var self = this;
	    self.node.find("input").bind("click", function(event) {
	        //event.preventDefault();
	        event.stopPropagation();
	        self.setAsValid();
            self.notifyObservers({
                name: "valueChanged",
                target: self,
                original: event
            });
	    });
    }
}
class PSelect extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("select").addBack('select');
	}
    getValue() {
        return this.node.find("option:selected").attr("value");
    }
    setValue(value) {
        this.node.find("option").prop('selected', false);
        this.node.find("option[value="+value+"]").prop('selected', true);
    }
}
class StateButton extends PObject {

	constructor($node) {
	    super($node);
	    var self = this;
	    $(".state-button-state", self.node).bind("click", function() {
	        var action = $(this).text().trim();
	        self.notifyObservers({name: "click", action: action});
	    });

	    $(".dropdown-item", self.node).bind("click", function() {
	        var action = $(this).text().trim();
	        $(".state-button-state", self.node).text(action);
	        self.notifyObservers({name: "click", action: action});
	    });
	}
}