class PUsersView extends PObject {

	constructor($node) {
	    super($node);
	    var self = this;
	    this.userTable = new UserTable($(".users-table"), this);
	    this.userTable.addObserver(function(event) {
	        self.manageEvent(self.userTable, event);
	    });
	    self.menu = new PGenericMenu($(".users-panel .generic-menu", self.node));
	    self.menu.addAction("createUser", "Create user", function() {
            newUserModal.show();
	    });
	    self.menu.addAction("createGroup", "Create group", function() {
            newGroupModal.show();
	    });
	    self.menu.addAction("edit", "Edit", function() {
            var item = prospero.get(self.userTable.getSelection());
            if (item.identity.model == "PUser")
                editUserModal.show(item);
            else
                editGroupModal.show(item);
	    });
	    self.menu.setEnabled("edit", false);
	    self.menu.addAction("delete", "Delete", function() {
            var items = prospero.get(self.userTable.getSelection(), true);
            var types = $.map(items, function(item){
                return item.identity.model;
            });
            types = _.uniq(types);
            var txt = "element";
            if (types.length == 1) {
                if (types[0] == "PUser")
                    txt = "user";
                else
                    txt = "group";
            }
            if (items.length > 1)
                txt = "these "+txt+"s";
            else
                txt = "this "+txt;
            items = $.map(items, function(item){
                return item.identity;
            });
            approvalModal.show({
                title: "Confirmation",
                text: "Do you really want to delete "+txt+" ?",
                callback : function() {
                    prospero.ajax("deleteObject", items, function(data) {
                        $.each(items, function(index, item) {
                            prospero.getPDBWidget(item).remove();
                        });
                        var lock = self.userTable.reload();
                        prospero.wait(lock, function() {
                            approvalModal.hide();
                        });
                    });
                }
            });
	    });
        self.menu.setEnabled("delete", false);
	    self.menu.addAction("affectUsers", "Affect users", function() {
            console.log("Affect users");
	    });
        self.menu.setEnabled("affectUsers", false);

	}
	setData(data) {
        this.data = data;
	    this.corporaTable.setData(this.data);
	    this.dicoTable.setData(this.data);
        return this;
	}
	manageEvent(origin, event) {
	    var self = this;
	    if (origin == self.userTable) {
	        if (event.name == "selectionChanged") {
                var items = prospero.get(self.userTable.getSelection(), true);
                if (items.length == 0) {
                    self.menu.setEnabled("edit", false);
                    self.menu.setEnabled("delete", false);
                    self.menu.setEnabled("affectUsers", false);
                } else if (items.length == 1) {
                    var item = items[0];
                    self.menu.setEnabled("edit", true);
                    self.menu.setEnabled("delete", true);
                    if (item.identity.model == "PGroup") {
                        self.menu.setEnabled("affectUsers", true);
                    } else {
                        self.menu.setEnabled("affectUsers", false);
                    }
                } else {
                    self.menu.setEnabled("edit", false);
                    self.menu.setEnabled("delete", true);
                    self.menu.setEnabled("affectUsers", false);
                }
	        }
	    }
    }
	load() {
	    var lock = $.Deferred();
	    var lock1 = this.userTable.reload();
        return lock;
	}
}