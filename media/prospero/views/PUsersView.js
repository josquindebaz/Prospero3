class PUsersView extends PObject {

	constructor() {
	    super($("body"));
	    var self = this;
	    this.userTable = new UserTable($(".users-table"), this);
	    this.userTable.addObserver(function(event) {
	        self.manageEvent(self.userTable, event);
	    });
	    self.menu = new PGenericMenu($(".users-panel .generic-menu", self.node));
	    self.menu.addAction("createUser", "Create user", function() {
            var modalLock = modals.openNewUser();
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "create") {
                    var lock = self.userTable.reload();
                    /*prospero.wait(lock, function() {
                    });*/
                }
            });
	    });
	    self.menu.addAction("createGroup", "Create group", function() {
            var modalLock = modals.openNewGroup();
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "create") {
                    var lock = self.userTable.reload();
                    /*prospero.wait(lock, function() {
                    });*/
                }
            });
	    });
	    self.menu.addAction("edit", "Edit", function() {
            var item = prospero.get(self.userTable.getSelection());
            if (item.identity.model == "PUser") {
                var modalLock = modals.openEditUser(item);
                prospero.wait(modalLock, function() {
                    if (modalLock.data.action == "save") {
                        var lock = self.userTable.reload();
                        /*prospero.wait(lock, function() {
                        });*/
                    }
                });
            } else {
                prospero.ajax("serializeObject", item.identity, function(data) {
                    var modalLock = modals.openEditGroup(data.object);
                    prospero.wait(modalLock, function() {
                        if (modalLock.data.action == "save") {
                            var lock = self.userTable.reload();
                            /*prospero.wait(lock, function() {
                            });*/
                        }
                    });
                });
            }
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
            var modalLock = modals.openApproval("Confirmation", "Do you really want to delete "+txt+" ?");
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "yes") {
                    prospero.ajax("deleteObject", items, function(data) {
                        self.userTable.reload();
                    });
                }
            });
	    });
        self.menu.setEnabled("delete", false);
        self.userData = prospero.interface.getUserData();
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
                } else if (items.length == 1) {
                    var item = items[0];
                    var isCurrentUser = prospero.interface.userData.id == item.identity.id;
                    if (item.identity.id != self.userData.anonymousUserId && item.identity.id != self.userData.publicGroupId) {
                        self.menu.setEnabled("edit", true);
                        self.menu.setEnabled("delete", !isCurrentUser);
                    } else {
                        self.menu.setEnabled("edit", false);
                        self.menu.setEnabled("delete", false);
                    }
                } else {
                    var canDelete = true;
                    $.each(items, function(index, item) {
                        if (item.identity.id == self.userData.anonymousUserId || item.identity.id == self.userData.publicGroupId || prospero.interface.userData.id == item.identity.id)
                            canDelete = false;
                        return canDelete;
                    });
                    self.menu.setEnabled("edit", false);
                    self.menu.setEnabled("delete", canDelete);
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