class InfoModal extends PModal {

	constructor($node) {
	    super($node)
	}
	show(text) {
	    var self = this;
	    this.node.find(".info-text").text(text);
	    super.show();
	}
}