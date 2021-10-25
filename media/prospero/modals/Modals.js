class Modals {

	constructor($node) {}
	openChangeRights(project, rights) {
        var self = this;
        var doneLock = $.Deferred();
        var showLock = $.Deferred();
        if (self.changeRightsModal)
            showLock.resolve();
        else {
            prospero.getAllUserData(function(userData) {
                self.changeRightsModal = new ChangeRightsModal($(".change-rights-modal"), userData);
                showLock.resolve();
            });
        }
        prospero.wait(showLock, function() {
            self.changeRightsModal.setDoneLock(doneLock);
            self.changeRightsModal.show(project, rights);
        });
        return doneLock;
	}
	openApproval(title, text) {
        var self = this;
        if (self.approvalModal == null)
            self.approvalModal = new ApprovalModal($(".approval-modal"));
        var doneLock = $.Deferred();
        self.approvalModal.setDoneLock(doneLock);
        self.approvalModal.show({
            title: title,
            text: text
        });
        return doneLock;
	}
	openInfo(text) {
        var self = this;
        if (self.infolModal == null)
            self.infolModal = new InfoModal($(".info-modal"));
        var doneLock = $.Deferred();
        self.infolModal.setDoneLock(doneLock);
        self.infolModal.show(text);
        return doneLock;
	}
	openImport(corpus) {
        var self = this;
        if (self.importModal == null)
            self.importModal = new ImportModal($(".import-modal"));
        var doneLock = $.Deferred();
        self.importModal.setDoneLock(doneLock);
        self.importModal.show(corpus);
        return doneLock;
	}
	openExport(projectView, selectedCorpus, selectedTexts, selectedDictionaries) {
        var self = this;
        if (self.exportModal == null)
            self.exportModal = new ExportModal($(".export-modal"));
        var doneLock = $.Deferred();
        self.exportModal.setDoneLock(doneLock);
        self.exportModal.show(projectView, selectedCorpus, selectedTexts, selectedDictionaries);
        return doneLock;
	}
	openNewText(corpus) {
        var self = this;
        if (self.newTextModal == null)
            self.newTextModal = new NewTextModal($(".new-text-modal"));
        var doneLock = $.Deferred();
        self.newTextModal.setDoneLock(doneLock);
        self.newTextModal.show(corpus);
        return doneLock;
	}
	openNewDicoElt(infos) {
        var self = this;
        if (self.newDicoEltModal == null)
            self.newDicoEltModal = new NewDicoEltModal($(".new-dico-elt-modal"));
        var doneLock = $.Deferred();
        self.newDicoEltModal.setDoneLock(doneLock);
        self.newDicoEltModal.show(infos);
        return doneLock;
	}
	openNewCorpus(project) {
        var self = this;
        if (self.newCorpusModal == null)
            self.newCorpusModal = new NewCorpusModal($(".new-corpus-modal"));
        var doneLock = $.Deferred();
        self.newCorpusModal.setDoneLock(doneLock);
        self.newCorpusModal.show(project);
        return doneLock;
	}
	openNewProject() {
        var self = this;
        if (self.newProjectModal == null)
            self.newProjectModal = new NewProjectModal($(".new-project-modal"));
        var doneLock = $.Deferred();
        self.newProjectModal.setDoneLock(doneLock);
        self.newProjectModal.show();
        return doneLock;
	}
	openNewMetadata(corpusData) {
        var self = this;
        if (self.newMetadataModal == null)
            self.newMetadataModal = new NewMetadataModal($(".new-metadata-modal"));
        var doneLock = $.Deferred();
        self.newMetadataModal.setDoneLock(doneLock);
        self.newMetadataModal.show(corpusData);
        return doneLock;
	}
	openNewUser() {
        var self = this;
        if (self.newUserModal == null)
            self.newUserModal = new NewUserModal($(".new-user-modal"));
        var doneLock = $.Deferred();
        self.newUserModal.setDoneLock(doneLock);
        self.newUserModal.show();
        return doneLock;
	}
	openEditUser(user) {
        var self = this;
        if (self.editUserModal == null)
            self.editUserModal = new EditUserModal($(".edit-user-modal"));
        var doneLock = $.Deferred();
        self.editUserModal.setDoneLock(doneLock);
        self.editUserModal.show(user);
        return doneLock;
	}
	openNewGroup() {
        var self = this;
        if (self.newGroupModal == null)
            self.newGroupModal = new NewGroupModal($(".new-group-modal"));
        var doneLock = $.Deferred();
        self.newGroupModal.setDoneLock(doneLock);
        self.newGroupModal.show();
        return doneLock;
	}
	openEditGroup(group) {
        var self = this;
        if (self.editGroupModal == null)
            self.editGroupModal = new EditGroupModal($(".edit-group-modal"));
        var doneLock = $.Deferred();
        self.editGroupModal.setDoneLock(doneLock);
        self.editGroupModal.show(group);
        return doneLock;
	}
	openNewAssociatedData(text) {
        var self = this;
        if (self.newAssociatedDataModal == null)
            self.newAssociatedDataModal = new NewAssociatedDataModal($(".new-associated-data-modal"));
        var doneLock = $.Deferred();
        self.newAssociatedDataModal.setDoneLock(doneLock);
        self.newAssociatedDataModal.show(text);
        return doneLock;
	}
}
var modals = new Modals();
