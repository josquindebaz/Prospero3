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
	    this.node[0].disabled = false;
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
    clear() {
        this.setValue("");
    }
    setEnabled(enabled) {
        this.fieldNode[0].disabled = !enabled;
    }
}
class PTextarea extends PInputField {

	constructor($node) {
	    super($node);
        this.fieldNode[0].setAttribute('autocomplete', 'off');
        this.fieldNode[0].setAttribute('autocorrect', 'off');
        this.fieldNode[0].setAttribute('autocapitalize', 'off');
        this.fieldNode[0].setAttribute('spellcheck', false);
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("textarea").addBack('textarea');
	    if (this.fieldNode.length == 0) {
	        this.node = this.node.replaceTag('<textarea>', true);
	        this.fieldNode = this.node;
	    }
	}
	autosize() {
        this.fieldNode.each(function () {
            this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
        }).on("input", function () {
            this.style.height = "auto";
            this.style.height = (this.scrollHeight) + "px";
        });
	}
    setEnabled(enabled) {
        this.fieldNode[0].disabled = !enabled;
    }
}
class PASTextarea extends PTextarea {

	constructor($node, data, editable) {
	    super($node);
	    var self = this;
	    self.data = data;
	    if (editable) {
            self.timer = new CallbackTimer(this, 500, function() {
                self.save();
            });
            self.addObserver(function() {
                self.timer.trigger();
            });
	    }
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

	constructor($node, data, editable) {
	    super($node);
	    var self = this;
	    self.data = data;
	    if (editable) {
            self.timer = new CallbackTimer(this, 500, function() {
                self.save();
            });
            self.addObserver(function() {
                self.timer.trigger();
            });
	    }
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
	    self.node.addClass("tags-input");
	    self.node.html('<div class="tags-input-container"><select class="form-select" id="validationTagsNew" name="tags_new[]" multiple data-allow-new="true"><option class="option-placeholer" selected disabled hidden value="">Choose a tag...</option></select></div>');
        prospero.getTagsManager(function(tagsManager) {
            var existingData = self.data.value;
            var identity = self.data.identity;
            var tagsInput = new TagsInput(
                self.node.find(".tags-input-container"),
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
        return this.fieldNode.is(":checked");
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
    bindChange() {
        var self = this;
	    if (self.fieldNode) {
            self.fieldNode.bind("change", function(event) {
                self.setAsValid();
                self.notifyObservers({
                    name: "valueChanged",
                    target: self,
                    original: event
                });
            });
	    }
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
	    this.actions = {};
	    this.refresh();
	}
	refresh() {
	    var hide = true;
	    $.each(this.actions, function(actionName, value) {
	        if (value.visible) {
	            hide = false;
	            return false;
	        }
	    });
	    if (this.node.hasClass("hidden") && !hide)
	        this.node.toggleClass("hidden");
	}
	addAction(actionName, actionText, callback) {
	    var $li = $('<li><a action-name="'+actionName+'" class="dropdown-item" href="#">'+actionText+'</a></li>');
	    $(".dropdown-menu", this.node).append($li);
	    $li.bind("click", function(event) {
	        callback(event);
	    });
	    this.actions[actionName] = {
	        enabled: true,
	        visible: true
	    };
	    this.refresh();
	}
	setEnabled(actionName, enabled) {
	    if (enabled)
	        $(".dropdown-menu", this.node).find('[action-name='+actionName+']').removeClass("disabled");
	    else
	        $(".dropdown-menu", this.node).find('[action-name='+actionName+']').addClass("disabled");
	    this.actions[actionName].enabled = enabled;
	    this.refresh();
	}
	setVisible(actionName, visible) {
	    if (visible)
	        $(".dropdown-menu", this.node).find('[action-name='+actionName+']').removeClass("hidden");
	    else
	        $(".dropdown-menu", this.node).find('[action-name='+actionName+']').addClass("hidden");
        this.actions[actionName].visible = visible;
        this.refresh();
	}
}
class PDropzone extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
	    self.filePath = null;
		var $dropzone = this.node.find(".dropzone-panel");
		this.dropzone = new McDropzone(
			$dropzone,
			{
				fileExtensions : $dropzone.data("extensions"),
				fileChange : function(dropzone, file, loadEvent) {
					var formData = new FormData();
					formData.append('file', file, file.name);
					prospero.uploadFile(formData, function(uploadDone, data) {
						if (uploadDone) {
                            self.setValue(data.fileUrl);
                            self.setAsValid();
                            self.notifyObservers({
                                name: "valueChanged",
                                target: self,
                                original: event
                            });
						} else {
							console.log("upload fails", data);
						}
					});
				},
				enterExit : function(dropzone, isHover) {
					if (isHover)
						dropzone.node.find(".mc-dropzone-feedback").addClass("hover");
					else
						dropzone.node.find(".mc-dropzone-feedback").removeClass("hover");
				},
				badFile : function(dropzone, file) {
					$$.magicCms.showUserFeedback("Import only csv files");
				}
			}
		);
	}
    bindChange() {}
	initFieldNode() {
	    this.fieldNode = null;
	}
	getValue() {
	    return this.filePath;
	}
	setValue(value) {
	    this.filePath = value;
	}
	clear() {
	    this.setValue(null);
	}
    setAsInvalid(message) {
        if (message) {
            this.node.find(".feedbacker").text(message);
            this.node.find(".feedbacker").removeClass("hidden");
        }
    }
    setAsValid() {
        this.node.find(".feedbacker").text("");
        this.node.find(".feedbacker").addClass("hidden");
    }
}
class PUserDropzone extends PDropzone {

	constructor($node) {
	    super($node);
	}
	setValue(value) {
	    super.setValue(value);
	    if (value == null) {
            this.node.find(".dropzone-panel").addClass("novalue");
            this.node.find(".dropzone-panel").css("background-image", 'url(media_site/assets/images/icon_dropzone.png)');
	    } else {
	        this.node.find(".dropzone-panel").removeClass("novalue");
	        this.node.find(".dropzone-panel").css("background-image", 'url("'+value+'")');
	    }
	}
}
class PAutoCompleteInput extends PInputField {

	constructor($node) {
	    super($node);
	    var self = this;
        self.autoComplete = new UserAutocomplete(self.fieldNode[0], {
            data: [],
            maximumItems: 5,
            treshold: 1,
            onSelectItem: function(item) {
                self.notifyObservers({
                    name: "valueSelected",
                    target: self,
                    item: item
                });
            }
        });
	}
	setData(data) {
	    this.autoComplete.setData(data);
	}
	clear() {
	    this.autoComplete.clear();
	}
	initFieldNode() {
	    this.fieldNode = this.node.find("input");
	}
    bindChange() {
    }
}