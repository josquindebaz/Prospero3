class PTable extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	    this.actionTriggers = {};
	    this.columns = $node.find("thead th").map(function(value){
	        return $(this).attr("property-name")
	    }).get();
	    this.clearFilters();
	    this.setSort(this.columns[0], true);
        this.bindScroll($(".card-body", $node));
        this.bindSorting();
	}
	clearFilters() {
	    this.filters = {
	        pagination : {
	            frameSize : 30,
	            page : 0,
	            end : false
	        },
	        sort : {
	            property: null,
	            ascendant : true
	        }
	    };
	}
	setSort(columnName, isAscendant) {
	    this.filters.sort.property = columnName;
	    this.filters.sort.ascendant = isAscendant;
	    $("thead .sort-filter", self.node).removeClass("selected");
	    $('thead th[property-name='+columnName+'] .sort-filter-' + (isAscendant ? 'asc' : 'desc'), self.node).addClass("selected");
	}
	bindSorting() {
	    var self = this;
	    $(".table-col-title .sort-filters .sort-filter", self.node).bind("click", function() {
            var $button = $(this);
	        console.log("sort click", this);
	        self.clearFilters();
	        self.setSort($button.closest("th[property-name]").attr("property-name"), $button.hasClass("sort-filter-asc"));
	        self.load(self.data, false);
	    });
	}
	bindScroll($scrolled) {
        var self = this;
        $scrolled[0].addEventListener('scroll', function(event) {
            var element = event.target;
            if (element.scrollHeight - element.scrollTop === element.clientHeight) {
                if (!self.filters.pagination.end)
                    self.load(self.data, true);
            }
        });
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
	load(data, appendMode) {
        var self = this;
        var lock = $.Deferred();
        var $tbody = $("tbody", self.node);
        if (data) {
            this.data = data;
            this.data.property = this.propertyName;
            var renderData = {
                identity : data,
                filters : self.filters
            }
            prospero.ajax("renderTable", renderData, function(data) {
                if (!appendMode)
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
                self.filters = data.filters;
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

