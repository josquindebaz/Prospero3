class PLayout extends PObject {

	constructor($node, padding) {
	    super($node);
	    this.name = this.uniqueId();
	    this.padding = padding;
	}
	init(panels) {
        var lock = $.Deferred();
        var initData = {
            name: this.name,
            panels: panels,
            onRender: function(event) {
                event.done(function () {
                    lock.resolve();
                });
            }
        };
        if (this.padding)
            initData.padding = this.padding;
        this.node.w2layout(initData);
        return lock;
	}
	getPanel(name) {
	    return $(w2ui[this.name].el(name));
	}
}