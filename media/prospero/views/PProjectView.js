class PProjectView extends PObject {

	constructor($node) {
	    super($node);
	    var self = this;
	    this.corporaTable = new CorporaTable($(".corpora-table"), this);
	    this.corporaTable.addObserver(function(event) {
	        self.manageEvent(self.corporaTable, event)
	    });
	    this.dicoTable = new DicoTable($(".dico-table"), this);
	    this.textTable = new TextTable($(".text-table"), this);
	    this.textTable.addObserver(function(event) {
	        self.manageEvent(self.textTable, event)
	    });
	    this.editorPanel = new EditorPanel($(".editor-panel"), this);
	    var importExportButton = new StateButton($("[action-name=multi-actions]"));
	    importExportButton.addObserver(function(event) {
	        if (event.action == "Import") {
	            importModal.show();
	        } else {
	            exportModal.show();
	        }
	    });
	}
	setData(data) {
        this.data = data;
	    this.corporaTable.setData(this.data);
	    this.dicoTable.setData(this.data);
        return this;
	}
	manageEvent(origin, event) {
	    var self = this;
	    console.log(origin, event);
	    if (origin == self.corporaTable) {
	        if (event.name == "selectionChanged") {
                var item = prospero.get(self.corporaTable.getSelection());
                if (item) {
                    self.textTable.setData(item.identity).reload();
                    console.log("open corpus infos pane");
                    self.editorPanel.switchTo("corpusEditor");
                    self.editorPanel.getPanel("corpusEditor").setData(item.identity).reload();
                } else {
                    self.textTable.setData(null).reload();
                    self.editorPanel.switchTo();
                }
	        }
	    } else if (origin == self.textTable) {
	        if (event.name == "selectionChanged") {
                var $items = this.textTable.getSelection();
                if ($items.length == 1) {
                    var item = prospero.get($items.eq(0));
                    self.editorPanel.getPanel("textEditor").setData(item.identity).reload();
                    console.log("open text edition pane");
                    self.editorPanel.switchTo("textEditor");
                } else if ($items.length > 1) {
                    // open multitexts pane
                    console.log("open multitexts pane");
                    self.editorPanel.switchTo("textSelectionsEditor");
                } else {
                    self.editorPanel.switchTo();
                }
	        }
	    }
    }
	load() {
	    var lock = $.Deferred();
	    var lock1 = this.corporaTable.reload();
	    var lock2 = this.dicoTable.reload();
        prospero.wait([lock1, lock2], function() {
            lock.resolve();
        });
        return lock;
	}
}