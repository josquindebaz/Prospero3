class TextTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    var self = this;
	    this.propertyName = "texts";
	    this.addActionTrigger("create", $(".icon_link.plus", self.node), function() {
            var corpus = prospero.get(view.corporaTable.getSelection());
            var modalLock = modals.openNewText(corpus);
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "create") {
                    var item = prospero.get(view.corporaTable.getSelection());
                    if (item) {
                        var lock = self.reload(item.identity);
                        prospero.wait(lock, function() {
                            var $textItem = self.getItem(data.text.identity)
                            self.setSelection($textItem);
                        });
                    }
                }
            });
	    });
	    this.addActionTrigger("delete", $(".icon_link.moins", self.node), function() {
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
                        self.notifyObservers({name: "selectionChanged"});
                    });
                }
            });
	    });
	}
	load() {
	    var lock = super.load();
	    this.showActionTrigger("create");
	    this.hideActionTrigger("delete");
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
            } else if (self.lastSelectedItem && event.original && event.original.shiftKey) {
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
            }
            if (selectionChanged) {
                self.notifyObservers({name: "selectionChanged"});
                if (self.getSelection().length > 0)
                    self.showActionTrigger("delete");
                else
                    self.hideActionTrigger("delete");
            }
            self.lastSelectedItem = item;
        }
	}
}