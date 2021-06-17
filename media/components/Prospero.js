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
}