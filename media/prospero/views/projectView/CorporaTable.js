class CorporaTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    var self = this;
	    self.propertyName = "corpuses";
	    self.menu = new PGenericMenu($(".generic-menu", self.node));
        self.menu.addAction("create", "Create corpus", function() {
            var project = view.data;
            var modalLock = modals.openNewCorpus(project);
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "create") {
                    var lock = self.reload(view.data);
                    prospero.wait(lock, function() {
                        var $corpusItem = self.getItem(modalLock.data.corpus.identity)
                        self.setSelection($corpusItem);
                    });
                }
            });
        });
        self.menu.addAction("delete", "Delete corpus", function() {
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
        self.menu.setEnabled("delete", false);
	}
	load() {
	    var lock = super.load();
	    this.menu.setEnabled("delete", false);
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
                self.menu.setEnabled("delete", true);
            //}
            //if (selectionChanged)
                self.notifyObservers({name: "selectionChanged"});
        }
	}
}