class PListUserItem extends PListItem {

	constructor($node, identity, plist) {
	    super($node, identity);
	    var self = this;
	    self.plist = plist;
	}
	load(item) {
        var self = this;
        this.data = item;
        self.node.text(item);
        self.node.addClass("user-item");
        self.node.html('<div class="img_container"><img src="'+item.thumbnail+'" class="rounded-circle" alt=""></div><div class="txt_container"><div class="username">'+item.username+'</div><div class="first-and-last-name">'+item.first_name+' '+item.last_name+'</div></div><div class="icon_container"><div class="icon-cancel-circled"></div></div>');
        self.node.find(".icon-cancel-circled").bind("click", function() {
            self.plist.removeItem(self.data);
        });
	}
}