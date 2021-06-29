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