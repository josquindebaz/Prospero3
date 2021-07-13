class PObject {

	constructor($node) {
	    this.node = $node
	    this.observers = []
	    $node.data("PObject", this);
	}
    addObserver(callback) {
        this.observers.push(callback);
	}
	notifyObservers(event) {
	    $.each(this.observers, function(index, observer) {
	        observer(event);
	    })
	}
	uniqueId() {
        return this.node.uniqueId().attr("id");
	}
}
class PDBObject extends PObject {

	constructor($node, identity) {
	    super($node);
	    if (identity) {
            this.identity = identity;
            $node.attr("object-model", identity.model);
            $node.attr("object-id", identity.id);
	    } else {
	        this.identity = {
	            model: $node.attr("object-model"),
	            id: $node.attr("object-id")
	        }
	    }
	}
}
class CallbackTimer {

    constructor(widget, delay, callback) {
        this.widget = widget;
        this.callback = callback;
        this.delay = delay;
    }
    trigger() {
    	var self = this;
	    if (!_.contains(CallbackTimer.delayArray, self.widget))
	        CallbackTimer.delayArray.push(self.widget);
	    clearTimeout(CallbackTimer.delayTimer);
	    CallbackTimer.delayTimer = setTimeout(function() {
    	    var tab = CallbackTimer.delayArray;
    	    CallbackTimer.delayArray = [];
    	    $.each(tab, function (index, value) {
    	        self.callback();
    	    });
	    }, self.delay);
    }
}
CallbackTimer.delayArray = [];
CallbackTimer.delayTimer = null;

class Prospero {

	constructor() {
	    this.tagManager = null;
	}
	getInterface(callback) {
		var self = this;
		if (self.interface)
		    callback(self.interface);
		else {
            this.onload(function() {
                self.interface = new PInterface();
                callback(self.interface);
            });
        }
	}
    nodes(htmlText) {
        var html = htmlText.replace(/[\n\r]+/g, ' ').trim();
        return $(html); // attention, s'il y a des scripts ...
    }
	ajax(service, data, callback) {
        var data = {
            service: service,
            data: data ? data : null
        }
        $.ajax({
            type: "POST",
            url: "/ajax",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data) {
                callback(data);
            },
            error: function(errMsg) {
                console.error(errMsg);
            }
        });
	}
	get($nodes, asList) {
	    var result = [];
	    $nodes.each(function(index, value) {
	        value = $(value).data("PObject");
	        if (value)
	            result.push(value);
	    });
        if (asList)
            return result;
        else if (result.length == 1)
            return result[0];
        else if (result.length == 0)
            return null;
        else
            return result;
	}
	getPDBObject(data, $container) {
	    return this.get(this.getPDBWidget(data, $container));
	}
	getPDBWidget(data, $container) {
	    if ($container == null)
	        return $('[object-model='+data.model+'][object-id='+data.id+']');
	     else
	        return $('[object-model='+data.model+'][object-id='+data.id+']', $container);
	}
	wait(locks, callback) {
        if (!Array.isArray(locks))
            locks = [locks];
        $.when.apply($,locks).then(function() {
            callback();
        });
	}
    uploadFile(formData, callback) {
    	$.ajax("/fileUpload", {
    		method: "POST",
    		data: formData,
    		processData: false,
    		contentType: false,
    		dataType: 'json',
    		success: function (result) {
    			callback(result.status == "OK", result);
    		},
    		error: function (data) {
    			callback(false);
    		}
    	});
    }
    escapeHtml(text) {
        return text
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
    onload(callback) {
		$(window).on("load", callback);
    }
    find(array, key, value) {
        return array.find(function(obj) {return obj[key] === value;})
    }
    sortable($listContainer, options) {
        $listContainer.sortable(options);
        $listContainer.disableSelection();
    }
    getTagsManager(callback) {
        var self = this;
        if (self.tagManager)
            callback(self.tagManager);
        else {
            this.ajax("getTagsData", {}, function(data) {
                self.tagManager = new TagManager(data.tags);
                callback(self.tagManager);
            });
        }
    }
    getUserData(callback) {
        var self = this;
        if (self.userDataLock == null)
            self.userDataLock = $.Deferred();
        if (self.userData == null) {
            self.ajax("serializeUserData", {}, function(data) {
                self.userData = data.users;
                self.userDataLock.resolve();
            });
        }
        self.wait(self.userDataLock, function() {
            callback(self.userData);
        });
    }
    getAllUserData(callback) {
        var self = this;
        if (self.allUserDataLock == null)
            self.allUserDataLock = $.Deferred();
        if (self.allUserData == null) {
            self.ajax("serializeAllUserData", {}, function(data) {
                self.allUserData = data.users;
                self.allUserDataLock.resolve();
            });
        }
        self.wait(self.allUserDataLock, function() {
            callback(self.allUserData);
        });
    }
    initEditionWidgets($container, widgetDatas, identity, editable) {
        var self  = this;
        $.each(widgetDatas, function(index, widgetData) {
            var $widget = $('[property-name='+widgetData.name+']', $container);
            if ($widget.length > 0)
                self.initEditionWidget($widget, widgetData, identity, editable);
        });
    }
    initEditionWidget($widget, widgetData, identity, editable) {
        if (identity)
            widgetData.identity = identity;
        editable = editable ? true : false;
        if (editable)
            $widget.find(".edition-widget").addBack('.edition-widget').addClass("editable");
        var widgetType = widgetData.type;
        var widget = null;
        if (widgetType == "String" || widgetType == "Datetime" || widgetType == "Hour") {
            widget = new PASTextInput($widget, widgetData, editable);
            if ("value" in widgetData)
                widget.setValue(widgetData.value);
            widget.setEnabled(editable);
        } else if (widgetType == "Text") {
            widget = new PASTextarea($widget, widgetData, editable);
            if ("value" in widgetData)
                widget.setValue(widgetData.value);
            widget.autosize();
            widget.setEnabled(editable);
        } else if (widgetType == "Tags") {
            widget = new PASInputTags($widget, widgetData, editable);
        }
        return widget;
    }
    createEditionWidgetHtml(widgetData, editable) {
        var widgetType = widgetData.type;
        var classes = "edition-widget";
        if (editable)
            classes = classes + ' editable';
        if (widgetType == "String" || widgetType == "Datetime" || widgetType == "Hour") {
            return $('<input class="'+classes+'"/>');
        } else if (widgetType == "Text") {
            return $('<textarea class="'+classes+'"></textarea>');
        }
    }
	addMetadata(metaData, $container, identity, editable) {
        var labelName = metaData.name.charAt(0).toUpperCase() + metaData.name.slice(1)
        var codeIconCancel = '';
        if (editable)
            codeIconCancel = '<div class="icon-delete-metadata"><div class="icon-cancel-circled"></div></div>';
        var $item = $('<div class="cartouche_item metadata-widget">'+codeIconCancel+'<label>'+labelName+'</label></div>');
        var $editionWidget = prospero.createEditionWidgetHtml(metaData, editable);
        $item.append($editionWidget);
        $container.append($item);
        var widget = prospero.initEditionWidget($item, metaData, identity, editable);
        $item.find(".icon-delete-metadata .icon-cancel-circled").bind("click", function() {
	        var modalLock = modals.openApproval("Confirmation", "Do you really want to delete this data ?");
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "yes") {
                    prospero.ajax("deleteObject", widget.data.identity, function(data) {
                        widget.node.remove();
                    });
                }
            });
        });
	}
}