class CorporaTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    var self = this;
	    this.propertyName = "corpuses";
	    this.addActionTrigger("create", $(".icon_link.plus", self.node), function() {
            var project = view.data;
            var modalLock = modals.openNewCorpus(project);
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "create") {
                    var lock = self.reload(projectView.data);
                    prospero.wait(lock, function() {
                        var $corpusItem = self.getItem(data.corpus.identity)
                        self.setSelection($corpusItem);
                    });
                }
            });
	    });
	    this.addActionTrigger("delete", $(".icon_link.moins", self.node), function() {
	        var item = prospero.get(self.getSelection());
	        var modalLock = modals.openApproval("Confirmation", "Do you really want to delete this corpus ?");
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "yes") {
                    prospero.ajax("deleteObject", item.identity, function(data) {
                        console.log("delete corpus", item.identity);
                        prospero.getPDBWidget(item.identity).remove();
                        self.notifyObservers({name: "selectionChanged"});
                    });
                }
            });
	    });
	}
	load() {
	    var lock = super.load();
	    this.showActionTrigger("create");
	    return lock;
	}
	receiveEvent(event) {
        var self = this;
        if (event.name == "click") {
            var item = event.target;
            var selectionChanged = false;
            //if (!item.isSelected()) {
                selectionChanged = true;
                self.deselectAll();
                item.setSelected();
                self.showActionTrigger("delete");
            //}
            //if (selectionChanged)
                self.notifyObservers({name: "selectionChanged"});
        }
	}
}