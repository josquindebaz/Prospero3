class PTable extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	    this.actionTriggers = {};
	    this.columns = $node.find("thead th").map(function(value){
	        return $(this).attr("property-name")
	    }).get()
	}
	addActionTrigger(actionName, $trigger, callback) {
	    var self = this;
	    this.actionTriggers[actionName] = {
	        trigger: $trigger,
	        callback: callback
	    };
	    $trigger.bind("click", function() {
	        callback(self);
	    });
	}
	showActionTrigger(actionName) {
	    this.actionTriggers[actionName].trigger.removeClass("hidden");
	}
	hideActionTrigger(actionName) {
	    this.actionTriggers[actionName].trigger.addClass("hidden");
	}
	load(data) {
        var self = this;
        var lock = $.Deferred();
        var $tbody = $("tbody", self.node);
        if (data) {
            this.data = data;
            this.data.property = this.propertyName;
            prospero.ajax("renderTable", this.data, function(data) {
                $tbody.empty();
                $.each(data.table, function(index, line) {
                    var $tr = $("<tr></tr>");
                    $tbody.append($tr);
                    var item = self.createTableItem($tr, line.identity, self.columns);
                    item.load(line.values);
                    item.addObserver(function(event) {
                        self.receiveEvent(event);
                    });
                });
                lock.resolve();
            });
        } else {
            $tbody.empty();
            lock.resolve();
        }
        return lock;
	}
	createTableItem($node, identity, columns) {
        return new PTableItem($node, identity, columns);
	}
	getItems() {
	    return $("tbody", this.node).children();
	}
	getItem(data) {
        return prospero.getPDBWidget(data, this.node);
	}
	setSelection($item) {
	    var item = prospero.get($item);
	    //item.setSelected();
        item.notifyObservers({
            name: "click",
            target: item,
            original: null
        });
	}
	getSelection() {
	    var $selected = $("tbody", this.node).children(".active");
	    return $selected;
	}
	deselectAll() {
	    $("tbody", this.node).children().removeClass("active");
	}
	// override if necessary
	receiveEvent(event) {}
}
class PTableItem extends PDBObject {

	constructor($node, identity, columns) {
	    super($node, identity);
	    var self = this;
	    self.columns = columns;
	    $node.bind("click", function(event) {
            self.notifyObservers({
                name: "click",
                target: self,
                original: event
            });
	    });
	}
	load(data) {
        var self = this;
        this.data = data;
        $.each(self.columns, function(index, column) {
            var value = data[column];
            if (value == null)
                value = "";
            var $td = $("<td>"+value+"</td>");
            self.node.append($td);
        });
	}
	isSelected() {
	    return this.node.hasClass("active");
	}
	setSelected() {
	    this.node.addClass("active");
	}
	setUnselected() {
	    this.node.removeClass("active");
	}
	toggleSelected() {
	    this.node.toggleClass("active");
	}
}

