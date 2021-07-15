class DicoTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    var self = this;
	    self.propertyName = "dictionnaries";

	    self.menu = new PGenericMenu($(".generic-menu", self.node));
        self.menu.addAction("delete", "Delete dictionary", function() {
	        var items = prospero.get(self.getSelection(), true);
	        var itemDatas = [];
	        $.each(items, function(index, item) {
	            itemDatas.push(item.identity);
	        });
	        var approvalText = items.length > 1 ? "Do you really want to delete these dictionaries ?" : "Do you really want to delete this dictionary ?";
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
        self.menu.setEnabled("delete", false);
	}
	load() {
	    var lock = super.load();
	    this.menu.setEnabled("delete", false);
	    return lock;
	}
	createTableItem($node, data, columns) {
        return new DicoTableItem($node, data, columns);
	}
	receiveEvent(event) {
        var self = this;
        if (event.name == "click") {
            var item = event.target;
            var selectionChanged = false;
            if (event.original && event.original.ctrlKey) {
                selectionChanged = true;
                item.toggleSelected()
            } else if (self.lastSelectedItem && event.original && event.original.shiftKey) {
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
                    self.menu.setEnabled("delete", true);
                else
                    self.menu.setEnabled("delete", false);
            }
            self.lastSelectedItem = item;
        }
	}
}
class DicoTableItem extends PTableItem {

	constructor($node, data, columns) {
	    super($node, data, columns);
	}
	load(data) {
        var self = this;
        $.each(self.columns, function(index, column) {
            var value = data[column];
            if (value == null)
                value = "";
            var $td = $("<td></td>");
            if (column == "name") {
                $td.html('<div class="form-check"><input class="form-check-input" type="checkbox" value=""><label class="form-check-label" for="">'+value+'</label></div>');
                var id = $td.find(".form-check-input").uniqueId().attr("id");
                $td.find(".form-check-label").attr("for", id);
                var check = new PCheckInput($td.find("input"));
                if (data.selected)
                    check.setValue(true);
                check.addObserver(function(event) {
                    var ajaxData = {
                        dico: self.identity,
                        selected: check.getValue()
                    }
                    console.log(ajaxData);
                    prospero.ajax("selectDico", ajaxData, function(data) {

                    });
                });
            } else
                $td.text(value);
            self.node.append($td);
        });
	}
}