class PModal extends PObject {

	constructor($node) {
	    super($node)
	    this.uniqueId = this.uniqueId();
	}
	show() {
	    this.node.modal("show");
	}
	setDoneLock(doneLock) {
	    this.doneLock = doneLock;
	}
	hide(data) {
	    this.node.modal("hide");
        if (this.doneLock != null) {
            this.doneLock.data = data;
            this.doneLock.resolve();
        }
	}
}