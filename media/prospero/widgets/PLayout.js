class PLayout extends PObject {

	constructor($node) {
	    super($node);
	    this.name = this.uniqueId();
	}
	init(panels) {
        var lock = $.Deferred();
        this.node.w2layout({
            name: this.name,
            panels: panels,
            onRender: function(event) {
                event.done(function () {
                    lock.resolve();
                });
            }
        });
        return lock;
	}
	getPanel(name) {
	    return $(w2ui[this.name].el(name));
	}
}