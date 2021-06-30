class TextTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    var self = this;
	    this.propertyName = "texts";
	    this.addActionTrigger("create", $(".icon_link.plus", self.node), function() {
	        newTextModal.show({
	            title: "Create text",
	            text: "",
	            callback : function() {
                    prospero.ajax("createText", item.data, function(data) {
                        console.log("create text", item.data);
                        newTextModal.hide();
                        //prospero.getPDBWidget(item.data).remove();
                        //self.notifyObservers({name: "selectionChanged"});
                    });
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
	        approvalModal.show({
	            title: "Confirmation",
	            text: approvalText,
	            callback : function() {
                    prospero.ajax("deleteObject", itemDatas, function(data) {
                        console.log("delete text", items);
                        approvalModal.hide();
                        $.each(items, function(index, item) {
                            item.node.remove();
                        });
                        self.notifyObservers({name: "selectionChanged"});
                    });
	            }
	        });
	    });
	}
	load(data, appendMode) {
	    var lock = super.load(data, appendMode);
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