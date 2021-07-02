class PProjectPanel extends PDBObject {

	constructor($node, view) {
	    super($node);
	    var self = this;
	    self.view = view;
	    self.menu = new PGenericMenu($(".generic-menu"));
	    self.menu.addAction("delete", "Delete project", function() {
            approvalModal.show({
                title: "Confirmation",
                text: "Do you really want to delete this project ?",
                callback : function() {
                    prospero.ajax("deleteObject", self.identity, function(data) {
                        console.log("delete project", self.identity);
                        self.view.currentProject.node.remove();
                        approvalModal.hide();
                    });
                }
            });
	    });
	    self.menu.addAction("changePrivileges", "Change privileges", function() {
            console.log("changePrivileges");
	    });
	}
}