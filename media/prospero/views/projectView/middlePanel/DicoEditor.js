class DicoEditor extends PObject {

	constructor($node, view) {
	    super($node);
	    var self = this;
	    this.view = view;
	    this.root = this.node.find(".accordion-root");
	    this.menu = new PGenericMenu($(".generic-menu", self.node));
	    this.clearFilters();
        var $scrollable = $(".card-body", $node);
        if ($scrollable.length > 0)
            this.bindScroll($scrollable);

        self.menu.addAction("create", "Create element", function() {
            var infos = self.getCreateInfos();
            var modalLock = modals.openNewDicoElt(infos);
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "create") {
                    var root = prospero.getPDBObject(infos.parent, self.root);
                    var $root = null;
                    if (root != null)
                        $root = root.node.find(".accordion").eq(0);
                    else
                        $root = self.root;
                    self.createItem(modalLock.data.metadata, $root, true);
                }
            });
        });
        self.menu.addAction("delete", "Delete element", function() {
	        var items = prospero.get(self.getSelection(), true);
	        var itemDatas = [];
	        $.each(items, function(index, item) {
	            itemDatas.push(item.identity);
	        });
	        var approvalText = items.length > 1 ? "Do you really want to delete these elements ?" : "Do you really want to delete this element ?";
            var modalLock = modals.openApproval("Confirmation", approvalText);
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "yes") {
                    prospero.ajax("deleteObject", itemDatas, function(data) {
                        $.each(items, function(index, item) {
                            item.node.remove();
                        });
                        self.notifyObservers({name: "selectionChanged"});
                        self.updateMenu();
                    });
                }
            });
        });
	}
	getCreateInfos() {
        //var dico = prospero.get(this.view.dicoTable.getSelection());
        if (this.data != null) {
            var infos = null;
            if (this.data.model == "LexicalDictionnary") {
                infos = {
                    "model" : "PDictElement",
                    "elementTypeName" : "element",
                    "parent" : this.data
                };
            } else if (this.data.model == "CategoryDictionnary") {
                infos = {
                    "model" : "Category",
                    "elementTypeName" : "category",
                    "parent" : this.data
                };
            } else if (this.data.model == "CollectionDictionnary") {
                var parent = prospero.get(this.getSelection());
                if (parent != null && !Array.isArray(parent) && parent.identity.model == "Collection") {
                    infos = {
                        "model" : "PDictPackage",
                        "elementTypeName" : "package",
                        "parent" : parent.identity
                    };
                }
            } else if (this.data.model == "FictionDictionnary") {
                var parent = prospero.get(this.getSelection())
                if (parent != null && !Array.isArray(parent) && parent.identity.model == "Fiction") {
                    infos = {
                        "model" : "PDictPackage",
                        "elementTypeName" : "package",
                        "parent" : parent.identity
                    };
                }
            } else if (this.data.model == "DictPackage" || this.data.model == "Category") {
                infos = {
                    "model" : "PDictElement",
                    "elementTypeName" : "element",
                    "parent" : this.data
                };
            }
        }
        console.log(infos);
        return infos;
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
                    self.createItem(element, self.root, false);
                });
                self.filters = data.filters;
                lock.resolve();
            });
        } else {
            lock.resolve();
        }
        this.updateMenu();
        return lock;
	}
	createItem(element, $root, appendFirst) {
        var self = this;
        var $accItem = $('<div class="accordion-item"></div>');
        if (appendFirst)
            $root.prepend($accItem);
        else
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
                self.updateMenu();
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
	updateMenu() {
        this.menu.setEnabled("delete", this.isSelectionDeletable());
        var createInfos = this.getCreateInfos();
        this.menu.setEnabled("create", createInfos != null);
        if (createInfos != null) {
            this.menu.setActionTitle("create", "Create "+createInfos.elementTypeName);
        } else {
            this.menu.setActionTitle("create", "Create element");
        }
	}
	isSelectionDeletable() {
	    var selection = this.getSelection();
	    if (selection.length == 0)
	        return false;
	    else {
	        selection = prospero.get(selection);
	        if (!Array.isArray(selection))
	            selection = [selection];
	        var result = true;
	        $.each(selection, function(index, element) {
	            result = element.isDeletable();
	            return result;
	        });
	        return result;
	    }
	}
}
class PDictObject extends PDBObject {

	constructor($node, identity, editor) {
	    super($node, identity);
	    this.editor = editor;
	    var self = this;
	    $node.bind("click", function(event) {
            console.log($node);
            event.preventDefault();
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
	isLeaf() {
	    return this.node.hasClass("leaf");
	}
	isDeletable() {
	    return this.identity.model != "Collection" && this.identity.model != "Fiction";
	}
}
class PDictElement extends PDictObject {

	constructor($node, identity, editor) {
	    super($node, identity, editor);
	}
	load(data) {
        super.load(data);
        var self = this;
        this.node.addClass("leaf");
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
            this.node.addClass("leaf");
            var childContainerId = "opener"+"-"+this.identity.model+"-"+this.identity.id;
            var flushId = "flush"+"-"+this.identity.model+"-"+this.identity.id;
            var $pck = $('<h2 class="accordion-header" id="'+flushId+'"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#'+childContainerId+'" aria-expanded="false" aria-controls="'+childContainerId+'">'+prefixCode+'<input class="edition-widget" value="'+data.name+'">'+suffixCode+'</button></h2>');
            this.node.append($pck);
            var $childContainer = $('<div id="'+childContainerId+'" class="accordion-collapse collapse" aria-labelledby="'+flushId+'"><div class="accordion"></div></div>');
            this.node.append($childContainer);
            var $root = $childContainer.find(".accordion");
            $.each(data.elements, function(index, element) {
                self.editor.createItem(element, $root, false);
            });
        } else {
            this.node.append($('<h2 class="accordion-header"><button class="accordion-button collapsed leaf" type="button" data-bs-toggle="collapse" aria-expanded="false">'+prefixCode+'<input class="edition-widget" value="'+data.name+'">'+suffixCode+'</button></h2>'));
        }
	}
}