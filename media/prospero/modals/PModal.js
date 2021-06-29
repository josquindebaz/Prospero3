class PModal extends PObject {

	constructor($node) {
	    super($node)
	    this.uniqueId = this.uniqueId();
	}
	show() {
	    this.node.modal("show");
	}
	hide() {
	    this.node.modal("hide");
	}
}