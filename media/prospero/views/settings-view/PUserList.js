class PUserList extends PList {

	constructor($node, userData) {
	    super($node);
	    var self = this;
        self.data = {
	        users : []
	    };
	    self.userData = userData;
    }
    setValue(value) {
        var self = this;
        $.each(value, function(index, itemId) {
            var item = self.userData.find(function(item) {return item.identity.id == itemId;})
            self.addItem(item);
        });
    }
    getItemsData() {
        return this.data.users;
    }
	createItem($node, identity) {
        return new PListUserItem($node, identity, this);
	}
}
