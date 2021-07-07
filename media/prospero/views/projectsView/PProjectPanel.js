class PProjectPanel extends PDBObject {

	constructor($node, view) {
	    super($node);
	    var self = this;
	    self.view = view;
	    self.menu = new PGenericMenu($(".generic-menu"));
	    self.menu.addAction("delete", "Delete project", function() {
            var modalLock = modals.openApproval("Confirmation", "Do you really want to delete this project ?");
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "yes") {
                    prospero.ajax("deleteObject", self.identity, function(data) {
                        self.view.currentProject.node.remove();
                    });
                }
            });
	    });
	    self.menu.addAction("changePrivileges", "Change privileges", function() {
            prospero.ajax("getProjectRights", { project: self.view.currentProject.identity }, function(data) {
                var modalLock = modals.openChangeRights(self.view.currentProject.identity, data.rights);
                prospero.wait(modalLock, function() {
                    if (modalLock.data.action == "save")
                        self.view.loadProjectInfos(false);
                });
            });
	    });
	}
}