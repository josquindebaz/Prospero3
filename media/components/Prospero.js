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
}
class PDBObject extends PObject {

	constructor($node, data) {
	    super($node);
	    $node.attr("object-model", data.model);
	    $node.attr("object-id", data.id);
	}
}
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
	get($node) {
	    return $node.data("PObject");
	}
	getPDBObject(data) {
	    return $('[object-model='+data.model+'][object-id='+data.id+']');
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
}