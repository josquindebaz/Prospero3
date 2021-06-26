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
	    this.identity = identity;
	    $node.attr("object-model", identity.model);
	    $node.attr("object-id", identity.id);
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
}