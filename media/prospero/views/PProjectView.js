class PProjectView extends PObject {

	constructor($node, data) {
	    super($node);
	    var self = this;
	    this.data = data;
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
	manageEvent(origin, event) {
	    var self = this;
	    console.log(origin, event);
	    if (origin == self.corporaTable) {
	        if (event.name == "selectionChanged") {
                var item = prospero.get(self.corporaTable.getSelection());
                if (item) {
                    self.textTable.load(item.identity);
                    console.log("open corpus infos pane");
                    self.editorPanel.switchTo("corpusEditor");
                    self.editorPanel.getPanel("corpusEditor").load(item.identity);
                } else {
                    self.textTable.load();
                    self.editorPanel.switchTo();
                }
	        }
	    } else if (origin == self.textTable) {
	        if (event.name == "selectionChanged") {
                var $items = this.textTable.getSelection();
                if ($items.length == 1) {
                    var item = prospero.get($items.eq(0));
                    self.editorPanel.getPanel("textEditor").load(item.identity);
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
	    var lock1 = this.corporaTable.load(this.data);
	    var lock2 = this.dicoTable.load(this.data);
        prospero.wait([lock1, lock2], function() {
            lock.resolve();
        });
        return lock;
	    /* this.textTable.load(); */
	    /*
        if (this.corporaTable.getSelection() == null) {
            var $selected = this.corporaTable.getItems().eq(0);
            if ($selected.length)
                this.corporaTable.setSelection($selected);
        }
	    */
	}
}