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
    setAsValid() {
    }
    setAsInvalid(message) {
        if (message)
            this.node.find(".invalid-feedback").text(message);
        this.fieldNode.addClass("is-invalid");
    }
    setAsValid() {
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