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
        var self = this;
        var $accItem = $('<div class="accordion-item"></div>');
        $root.append($accItem);
        //var item = this.createTableItem($accItem, element.identity);
        var item = null;
        if (element.identity.model == "DictElement")
            item = new PDictElement($accItem, element.identity, this);
        else
            item = new PDictPackage($accItem, element.identity, this);
        item.load(element);
        item.addObserver(function(event) {
            self.receiveEvent(event);
        });
	}
	receiveEvent(event) {
        var self = this;
        if (event.name == "click") {
            var item = event.target;
            var selectionChanged = false;
            if (event.original && event.original.ctrlKey) {
                //event.original.preventDefault();
                //document.getSelection().removeAllRanges();
                selectionChanged = true;
                item.toggleSelected()
            } else if (self.lastSelectedItem && event.original && event.original.shiftKey) {
                //event.original.preventDefault();
                //document.getSelection().removeAllRanges();
                var p1 = item.node.parent()
                var p2 = self.lastSelectedItem.node.parent()
                if (p1.is(p2)) {
                    var indexes = [];
                    var $children = p1.children();
                    indexes.push($children.index(item.node));
                    indexes.push($children.index(self.lastSelectedItem.node));
                    indexes = _.sortBy(indexes);
                    var $selected = $children.slice(indexes[0], indexes[1]+1);
                    selectionChanged = true;
                    self.deselectAll();
                    $selected.each(function(index, value) {
                        prospero.get($(value)).setSelected();
                    });
                }
            } else {
                if (!item.isSelected() || self.getSelection().length > 1) {
                    selectionChanged = true;
                    self.deselectAll();
                    item.setSelected();
                }
            }
            if (selectionChanged) {
                self.notifyObservers({name: "selectionChanged"});
                /*if (self.getSelection().length > 0)
                    self.menu.setEnabled("delete", true);
                else
                    self.menu.setEnabled("delete", false);
                */
            }
            self.lastSelectedItem = item;
        }
	}
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
	    var $selected = this.root.find(".accordion-item.selected");
	    return $selected;
	}
	deselectAll() {
	    this.root.find(".accordion-item").removeClass("selected");
	}
}
class PDictObject extends PDBObject {

	constructor($node, identity, editor) {
	    super($node, identity);
	    this.editor = editor;
	    var self = this;
	    $node.bind("click", function(event) {
            event.stopPropagation();
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
	    return this.node.hasClass("selected");
	}
	setSelected() {
	    this.node.addClass("selected");
	}
	setUnselected() {
	    this.node.removeClass("selected");
	}
	toggleSelected() {
	    this.node.toggleClass("selected");
	}
}
class PDictElement extends PDictObject {

	constructor($node, identity, editor) {
	    super($node, identity, editor);
	}
	load(data) {
        super.load(data);
        var self = this;
        this.node.append($('<h2 class="accordion-header"><button class="accordion-button collapsed leaf" type="button" data-bs-toggle="collapse" aria-expanded="false"><input class="edition-widget" value="'+data.value+'"></button></h2>'));
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
        if ("elements" in data) {
            var childContainerId = "opener"+"-"+this.identity.model+"-"+this.identity.id;
            var flushId = "flush"+"-"+this.identity.model+"-"+this.identity.id;
            var $pck = $('<h2 class="accordion-header" id="'+flushId+'"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#'+childContainerId+'" aria-expanded="false" aria-controls="'+childContainerId+'">'+prefixCode+'<input class="edition-widget" value="'+data.name+'">'+suffixCode+'</button></h2>');
            this.node.append($pck);
            var $childContainer = $('<div id="'+childContainerId+'" class="accordion-collapse collapse" aria-labelledby="'+flushId+'"><div class="accordion"></div></div>');
            this.node.append($childContainer);
            var $root = $childContainer.find(".accordion");
            $.each(data.elements, function(index, element) {
                self.editor.createItem(element, $root);
            });
        } else {
            this.node.append($('<h2 class="accordion-header"><button class="accordion-button collapsed leaf" type="button" data-bs-toggle="collapse" aria-expanded="false">'+prefixCode+'<input class="edition-widget" value="'+data.name+'">'+suffixCode+'</button></h2>'));
        }
	}
}