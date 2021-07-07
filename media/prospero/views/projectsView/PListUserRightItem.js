class PListUserRightItem extends PListItem {

	constructor($node, identity, plist) {
	    super($node, identity);
	    var self = this;
	    self.plist = plist;
	}
	load(user) {
        var self = this;
        this.data = user;
        self.node.addClass("user-item");
        var selectCode = '<select class="form-select rights-selector"><option value="Read">Read</option><option value="Write">Write</option><option value="Owner">Owner</option></select>';
        var userNameCode = "";
        if (user.identity.model == "PUser")
            userNameCode = '<div class="first-and-last-name">'+user.first_name+' '+user.last_name+'</div>';
        self.node.html('<div class="img_container"><img src="'+user.thumbnail+'" class="rounded-circle" alt=""></div><div class="txt_container"><div class="v-align"><div class="username">'+user.username+'</div>'+userNameCode+'</div></div>'+selectCode+'<div class="icon_container"><div class="icon-cancel-circled"></div></div>');
        self.node.find('select option[value='+user.right.right+']')[0].selected = 'selected';
        self.node.find(".icon-cancel-circled").bind("click", function() {
            self.plist.removeItem(self.data);
        });
        self.node.find("select").bind("change", function() {
            self.data.right.right = $(this).val();
        });
	}
}