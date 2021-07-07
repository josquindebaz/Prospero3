class PUserRightList extends PList {

	constructor($node, userData) {
	    super($node);
	    var self = this;
	    self.userData = userData;
    }
    clear() {
        super.clear();
        this.data = {
	        users : []
	    };
    }
    setValue(value) {
        var self = this;
        $.each(value, function(index, right) {
            var user = self.userData.find(function(item) {
                return item.identity.id == right.user;
            });
            var item = _.clone(user);
            item.right = right
            self.addItem(item);
        });
    }
    getValue() {
        var result = [];
        $.each(this.getItemsData(), function(index, user) {
            result.push({
                user: user.identity.id,
                right: user.right.right,
                identity: user.right.identity != null ? user.right.identity : null
            })
        });
        return result;
    }
    getItemsData() {
        return this.data.users;
    }
	createItem($node, identity) {
        return new PListUserRightItem($node, identity, this);
	}
}
