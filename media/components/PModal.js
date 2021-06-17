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