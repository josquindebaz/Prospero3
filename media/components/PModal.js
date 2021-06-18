class PModal extends PObject {

	constructor($node) {
	    super($node)
	    this.uniqueId = this.node.uniqueId().attr("id");
	}
	show() {
	    this.node.modal("show");
	}
	hide() {
	    this.node.modal("hide");
	}
}

class ApprovalModal extends PModal {

	constructor($node) {
	    super($node)
	}
	show(options) {
	    this.node.find(".modal-title").text(options.title);
	    this.node.find(".approval-text").text(options.text);
        this.node.find("[action-name=yes]").unbind("click").bind("click", function() {
            options.callback();
        });
	    super.show();
	}
}