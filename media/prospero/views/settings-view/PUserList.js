class PUserList extends PList {

	constructor($node) {
	    super($node);
	    var self = this;
    }
    getItemsData() {
        return this.data.users;
    }
	createItem($node, identity) {
        return new PListUserItem($node, identity, this);
	}
}
