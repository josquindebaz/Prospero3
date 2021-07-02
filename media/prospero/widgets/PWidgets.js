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
	    if (self.fieldNode) {
            self.fieldNode.bind("keyup blur change input", function(event) {
                self.setAsValid();
                self.notifyObservers({
                    name: "valueChanged",
                    target: self,
                    original: event
                });
            });
	    }
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
	    this.fieldNode = this.node.find("textarea").addBack('textarea');
	}
	autosize() {
        this.fieldNode.each(function () {
            this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
        }).on("input", function () {
            this.style.height = "auto";
            this.style.height = (this.scrollHeight) + "px";
        });
	}
}
class PASTextarea extends PTextarea {

	constructor($node, data) {
	    super($node);
	    var self = this;
	    self.data = data;
	    self.timer = new CallbackTimer(this, 500, function() {
            self.save();
	    });
	    self.addObserver(function() {
	        self.timer.trigger();
	    });
	}
	save() {
        this.data.value = this.getValue();
        prospero.ajax("changeData", this.data, function(data) {
            console.log("done");
        });
	}
}

class PTextInput extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("input").addBack('input');
	}
}
class PASTextInput extends PTextInput {

	constructor($node, data) {
	    super($node);
	    var self = this;
	    self.data = data;
	    self.timer = new CallbackTimer(this, 500, function() {
            self.save();
	    });
	    self.addObserver(function() {
	        self.timer.trigger();
	    });
	}
	save() {
        this.data.value = this.getValue();
        prospero.ajax("changeData", this.data, function(data) {
            console.log("done");
        });
	}
}

class PASInputTags extends PInputField {

	constructor($node, data) {
	    super($node);
	    var self = this;
	    self.data = data;

        prospero.getTagsManager(function(tagsManager) {
            var $widget = $(".tags-input", self.node);
            var existingData = self.data.value;
            var identity = self.data.identity;
            var tagsInput = new TagsInput(
                $widget.find(".tags-input-container"),
                existingData,
                tagsManager,
                identity,
                true
            );
            //tagsInput.addItemProg("Orange");
            //tagsInput.adjustWidth();
        });

	}
	initFieldNode() {
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
class PGenericMenu extends PObject {

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
	addAction(actionName, actionText, callback) {
	    var $li = $('<li><a action-name="'+actionName+'" class="dropdown-item" href="#">'+actionText+'</a></li>');
	    $(".dropdown-menu").append($li);
	    $li.bind("click", function(event) {
	        callback(event);
	    });
	}
	setEnabled(actionName, enabled) {
	    if (enabled)
	        $(".dropdown-menu").find('action-name='+actionName).removeClass("disabled");
	    else
	        $(".dropdown-menu").find('action-name='+actionName).addClass("disabled");
	}
	setVisible(actionName, visible) {
	    if (visible)
	        $(".dropdown-menu").find('action-name='+actionName).removeClass("hidden");
	    else
	        $(".dropdown-menu").find('action-name='+actionName).addClass("hidden");
	}
}