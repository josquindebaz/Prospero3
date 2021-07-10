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
    initEditionWidgets($container, widgetDatas, identity) {
        var self  = this;
        $.each(widgetDatas, function(index, widgetData) {
            var $widget = $('[property-name='+widgetData.name+']', $container);
            if ($widget.length > 0)
                self.initEditionWidget($widget, widgetData, identity);
        });
    }
    initEditionWidget($widget, widgetData, identity) {
        if (identity)
            widgetData.identity = identity;
        var widgetType = widgetData.type;
        var widget = null;
        if (widgetType == "String") {
            widget = new PASTextInput($widget, widgetData);
            if ("value" in widgetData)
                widget.setValue(widgetData.value);
        } else if (widgetType == "Datetime") {
            widget = new PASTextInput($widget, widgetData);
            if ("value" in widgetData)
                widget.setValue(widgetData.value);
        } else if (widgetType == "Text") {
            widget = new PASTextarea($widget, widgetData);
            if ("value" in widgetData)
                widget.setValue(widgetData.value);
            widget.autosize();
        } else if (widgetType == "Tags") {
            widget = new PASInputTags($widget, widgetData);
        }
    }
    createEditionWidgetHtml(widgetData) {
        var widgetType = widgetData.type;
        if (widgetType == "String" || widgetType == "Datetime") {
            return $('<input class="edition-widget"/>');
        } else if (widgetType == "Text") {
            return $('<textarea class="edition-widget"></textarea>');
        }
    }
}