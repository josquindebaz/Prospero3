class PObject {

	constructor($node) {
	    this.node = $node
	    $node.data("PObject", this);
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
}