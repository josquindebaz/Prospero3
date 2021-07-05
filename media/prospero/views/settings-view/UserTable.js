class UserTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	}
	load() {
        var self = this;
        var lock = $.Deferred();
        var renderData = {
            filters : self.filters
        }
        prospero.ajax("renderUserTable", renderData, function(data) {
            var $tbody = $("tbody", self.node);
            $.each(data.table, function(index, line) {
                var $tr = $("<tr></tr>");
                $tbody.append($tr);
                var item = self.createTableItem($tr, line.identity, self.columns);
                item.load(line.values, line.identity);
                item.addObserver(function(event) {
                    self.receiveEvent(event);
                });
            });
            self.filters.pagination = data.pagination;
            lock.resolve();
        });
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
            }
            self.lastSelectedItem = item;
        }

	}
	createTableItem($node, identity, columns) {
        return new PUserItem($node, identity, columns);
	}
}
class PUserItem extends PTableItem {

	constructor($node, data, columns) {
	    super($node, data, columns);
	}
	load(data, identity) {
        var self = this;
        $.each(self.columns, function(index, column) {
            var value = data[column];
            if (value == null)
                value = "";
            if (column == "thumbnail") {
                var $td = $('<td class="col-thumbnail"><div class="col-container"><div class="img_container"><img src="'+value+'" class="rounded-circle" alt=""></div></div></td>');
                self.node.append($td);
            } else if (column == "username") {
                var iconClass = "icon-user";
                if (identity.model == "PGroup")
                    iconClass = "icon-group";
                var $td = $('<td class="col-username"><div class="col-container"><div class="'+iconClass+'"></div><div class="user-name">'+value+'</div></div></td>');
                self.node.append($td);
            } else {
                var $td = $("<td></td>");
                $td.text(value);
                self.node.append($td);
            }
        });
	}
}