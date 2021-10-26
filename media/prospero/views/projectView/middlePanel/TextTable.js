class TextTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    var self = this;
	    self.propertyName = "texts";
	    self.menu = new PGenericMenu($(".generic-menu", self.node));

        self.menu.addAction("create", "Create text", function() {
            var corpus = prospero.get(view.corporaTable.getSelection());
            var modalLock = modals.openNewText(corpus);
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "create") {
                    var lock = self.reload();
                    prospero.wait(lock, function() {
                        var $textItem = self.getItem(modalLock.data.text.identity)
                        self.setSelection($textItem);
                        self.updateMenu();
                        corpus.reload();
                    });
                }
            });
        });
        self.menu.addAction("delete", "Delete text", function() {
	        var items = prospero.get(self.getSelection(), true);
	        var itemDatas = [];
	        $.each(items, function(index, item) {
	            itemDatas.push(item.identity);
	        });
	        var approvalText = items.length > 1 ? "Do you really want to delete these texts ?" : "Do you really want to delete this text ?";
            var modalLock = modals.openApproval("Confirmation", approvalText);
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "yes") {
                    prospero.ajax("deleteObject", itemDatas, function(data) {
                        $.each(items, function(index, item) {
                            item.node.remove();
                        });
                        var corpus = prospero.get(view.corporaTable.getSelection());
                        corpus.reload();
                        self.notifyObservers({name: "selectionChanged"});
                        self.updateMenu();
                    });
                }
            });
        });
        this.node.find("table").bind("keydown", function(event) {
            console.log(event.key);
        });
        this.updateMenu();
	}
	load() {
	    var lock = super.load();
	    this.updateMenu();
	    return lock;
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
                self.lastSelectedItem = item;
            } else if (self.lastSelectedItem && event.original && (event.original.shiftKey || event.original.metaKey)) {
                //event.original.preventDefault();
                //document.getSelection().removeAllRanges();
                var indexes = [];
                var $children = $("tbody", this.node).children();
                indexes.push($children.index(item.node));
                indexes.push($children.index(self.lastSelectedItem.node));
                indexes = _.sortBy(indexes);
                console.log("multi", indexes);
                var $selected = $children.slice(indexes[0], indexes[1]+1);
                selectionChanged = true;
                self.deselectAll();
                $selected.each(function(index, value) {
                    prospero.get($(value)).setSelected();
                });
            } else {
                if (!item.isSelected() || self.getSelection().length > 1) {
                    selectionChanged = true;
                    self.deselectAll();
                    item.setSelected();
                }
                self.lastSelectedItem = item;
            }
            if (selectionChanged) {
                self.notifyObservers({name: "selectionChanged"});
                self.updateMenu();
            }
        }
	}
	updateMenu() {
        if (this.getSelection().length > 0)
            this.menu.setEnabled("delete", true);
        else
            this.menu.setEnabled("delete", false);
	}
}