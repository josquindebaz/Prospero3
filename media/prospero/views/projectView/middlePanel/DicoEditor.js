class DicoEditor extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	    this.root = this.node.find(".accordion-root");
	    this.actionTriggers = {};
	    this.clearFilters();
        var $scrollable = $(".card-body", $node);
        if ($scrollable.length > 0)
            this.bindScroll($scrollable);
	}
	setData(data) {
	    this.data = data;
	    return this;
	}
	clearFilters() {
	    this.filters = {
	        pagination : {}
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
	    this.root.empty();
	    this.clearPagination();
	    return this.load();
	}
	load() {
        var self = this;
        var lock = $.Deferred();
        if (this.data) {
            var renderData = {
                identity : this.data,
                filters : self.filters
            }
            prospero.ajax("serializeDico", renderData, function(data) {
                $.each(data.elements, function(index, element) {
                    self.createItem(element, self.root);
                });
                self.filters = data.filters;
                lock.resolve();
            });
        } else {
            lock.resolve();
        }
        return lock;
	}
	createItem(element, $root) {
        var $accItem = $('<div class="accordion-item"></div>');
        $root.append($accItem);
        //var item = this.createTableItem($accItem, element.identity);
        var item = null;
        if (element.identity.model == "DictElement")
            item = new PDictElement($accItem, element.identity, this);
        else
            item = new PDictPackage($accItem, element.identity, this);
        item.load(element);
        /*item.addObserver(function(event) {
            self.receiveEvent(event);
        });*/
	}
	/*
	createTableItem($node, identity) {
        if (identity.model == "DictElement")
            return new PDictElement($node, identity, this);
        else
            return new PDictPackage($node, identity, this);
	}
	*/
	getItems() {
	    return this.root.children();
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
	    var $selected = this.root.children(".active");
	    return $selected;
	}
	deselectAll() {
	    $("tbody", this.node).children().removeClass("active");
	}
	// override if necessary
	receiveEvent(event) {}
}
class PDictObject extends PDBObject {

	constructor($node, identity, editor) {
	    super($node, identity);
	    this.editor = editor;
	    var self = this;
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
class PDictElement extends PDictObject {

	constructor($node, identity, editor) {
	    super($node, identity, editor);
	}
	load(data) {
        super.load(data);
        var self = this;
        this.node.append($('<h2 class="accordion-header"><button class="accordion-button collapsed leaf" type="button" data-bs-toggle="collapse" aria-expanded="false"><input class="edition-widget editable" value="'+data.value+'"></button></h2>'));
	}
}
class PDictPackage extends PDictObject {

	constructor($node, identity, editor) {
	    super($node, identity, editor);
	}
	load(data) {
        super.load(data);
        var self = this;
        var prefixCode = "";
        var suffixCode = "";
        if (this.identity.model == "Collection")
            prefixCode = '<span>*</span>';
        else if (this.identity.model == "Fiction")
            prefixCode = '<span>@</span>';
        else if (this.identity.model == "Category")
            suffixCode = '<span>['+data.type+']</span>';
        var childContainerId = "opener"+"-"+this.identity.model+"-"+this.identity.id;
        var flushId = "flush"+"-"+this.identity.model+"-"+this.identity.id;
        var $pck = $('<h2 class="accordion-header" id="'+flushId+'"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#'+childContainerId+'" aria-expanded="false" aria-controls="'+childContainerId+'">'+prefixCode+'<input class="edition-widget editable" value="'+data.name+'">'+suffixCode+'</button></h2>');
        this.node.append($pck);
        var $childContainer = $('<div id="'+childContainerId+'" class="accordion-collapse collapse" aria-labelledby="'+flushId+'"><div class="accordion"></div></div>');
        this.node.append($childContainer);
        var $root = $childContainer.find(".accordion");
        $.each(data.elements, function(index, element) {
            self.editor.createItem(element, $root);
        });
	}
}