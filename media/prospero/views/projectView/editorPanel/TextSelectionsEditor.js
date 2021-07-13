class TextSelectionsEditor extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	}
	clear() {
	}
	setData(data) {
	    this.data = data;
	    return this;
	}
	reload() {
	    this.clear();
	    this.load();
	}
	load(data) {
        var self = this;
        this.data = data;
        prospero.ajax("serializeObject", this.data, function(data) {
            var $text = $(".text-container", self.node);
            $text.empty();
            $text.text(data.object.text);
        });
	}
}