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
        var $scrollable = $(".card-body", $node);
        if ($scrollable.length > 0)
            this.bindScroll($scrollable);
        this.bindSorting();
	}
	setData(data) {
	    this.data = data;
	    return this;
	}
	clearFilters() {
	    this.filters = {
	        pagination : {},
	        sort : {
	            property: null,
	            ascendant : true
	        }
	    };
	    this.clearPagination();
	}
	clearPagination() {
	    this.filters.pagination = {
            frameSize : 30,
            page : 0,
            end : false
        };
	}
	setSort(columnName, isAscendant) {
	    var self = this;
	    self.filters.sort.property = columnName;
	    self.filters.sort.ascendant = isAscendant;
	    var $button = $('thead th[property-name='+columnName+'] .sort-filter', self.node);
	    if (!$button.hasClass("active")) {
	        $("thead .sort-filter", self.node).removeClass("active");
	        $button.addClass("active");
	    }
	    if (isAscendant)
	        $button.removeClass("sort-filter-desc").addClass("sort-filter-asc");
	    else
	        $button.removeClass("sort-filter-asc").addClass("sort-filter-desc");
	}
	bindSorting() {
	    var self = this;
	    $(".table-col-title .sort-filters .sort-filter", self.node).bind("click", function() {
            var $button = $(this);
	        if (!$button.hasClass("active"))
	            self.setSort($button.closest("th[property-name]").attr("property-name"), $button.hasClass("sort-filter-asc"));
	        else
	            self.setSort($button.closest("th[property-name]").attr("property-name"), !$button.hasClass("sort-filter-asc"));
	        self.reload(self.data);
	    });
	}
	bindScroll($scrolled) {
        var self = this;
        $scrolled[0].addEventListener('scroll', function(event) {
            var element = event.target;
            if (element.scrollHeight - element.scrollTop === element.clientHeight) {
                if (!self.filters.pagination.end)
                    self.load();
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
	reload() {
	    $("tbody", this.node).empty();
	    this.clearPagination();
	    return this.load();
	}
	load() {
        var self = this;
        var lock = $.Deferred();
        if (this.data) {
            var renderData = {
                identity : this.data,
                property : self.propertyName,
                filters : self.filters
            }
            prospero.ajax("serializeTable", renderData, function(data) {
                var $tbody = $("tbody", self.node);
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

