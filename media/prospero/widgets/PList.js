class PList extends PObject {

	constructor($node) {
	    super($node);
	    var self = this;
    }
    setData(data) {
        this.data = data;
        return this;
    }
    getItemsData() {
        return this.data.items;
    }
    addItem(itemData) {
        var items = this.getItemsData();
        items.push(itemData);
        var $node = $("<div></div>");
        var item = this.createItem($node, itemData.identity);
        item.load(itemData);
        this.node.append($node);
    }
    removeItem(itemData) {
        var items = this.getItemsData();
        items.splice(_.findIndex(items, function(obj) {
            return obj.identity.id === itemData.identity.id;
        }), 1);
        prospero.getPDBWidget(itemData.identity, this.node).remove();
    }
	load() {
        var self = this;
        $.each(this.getItemsData(), function(index, itemData) {
            var $node = $("<div></div>");
            var item = self.createItem($node, itemData.identity);
            item.load(itemData);
            self.node.append($node);
        });
	}
	createItem($node, identity) {
        return new PListItem($node, identity, this);
	}
}
class PListItem extends PDBObject {

	constructor($node, identity, plist) {
	    super($node, identity);
	    var self = this;
	    self.plist = plist;
	}
	load(item) {
        var self = this;
        this.data = item;
        self.node.text(item);
	}
}