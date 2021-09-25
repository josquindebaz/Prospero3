class PProjectView extends PObject {

	constructor($node) {
	    super($node);
	    var self = this;
	    this.corporaTable = new CorporaTable($(".corpora-table"), this);
	    this.corporaTable.addObserver(function(event) {
	        self.manageEvent(self.corporaTable, event)
	    });
	    this.dicoTable = new DicoTable($(".dico-table"), this);
	    this.dicoTable.addObserver(function(event) {
	        self.manageEvent(self.dicoTable, event)
	    });
	    this.middlePanel = new MiddlePanel($(".middle-panel"), this);
	    this.textTable = this.middlePanel.getPanel("textTable");
	    this.textTable.addObserver(function(event) {
	        self.manageEvent(self.textTable, event)
	    });
	    this.middleDicoEditor = this.middlePanel.getPanel("dicoEditor");
	    this.middleDicoEditor.addObserver(function(event) {
	        self.manageEvent(self.middleDicoEditor, event)
	    });

	    this.rightPanel = new RightPanel($(".right-panel"), this);
	    this.rightDicoEditor = this.rightPanel.getPanel("dicoEditor");

	    var importExportButton = new StateButton($("[action-name=multi-actions]"));
	    importExportButton.addObserver(function(event) {
	        if (event.action == "Import") {
	            var corpus = prospero.get(self.corporaTable.getSelection());
	            if (corpus == null)
	                corpus = prospero.get(self.corporaTable.getItems().eq(0));
                var modalLock = modals.openImport(corpus);
                prospero.wait(modalLock, function() {
                    if (modalLock.data.action == "import") {
                        var lock = self.reload();
                        prospero.wait(lock, function() {
                            if (corpus) {
                                corpus = prospero.getPDBObject(corpus.identity, self.corporaTable.node); // reload
                                var $corpus = corpus ? corpus.node : self.corporaTable.getItems().eq(0);
                                self.corporaTable.setSelection($corpus);
                            }
                        });
                    }
                });
	        } else {
                var selectedCorpus = prospero.get(self.corporaTable.getSelection(), true);
                var selectedTexts = prospero.get(self.textTable.getSelection(), true);
                var selectedDictionaries = prospero.get(self.dicoTable.getSelection(), true);
                var modalLock = modals.openExport(selectedCorpus, selectedTexts, selectedDictionaries);
                /*prospero.wait(modalLock, function() {
                    if (modalLock.data.action == "export") {
                    }
                });*/
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
	    //console.log(origin, event);
	    if (origin == self.corporaTable) {
	        if (event.name == "selectionChanged") {
                var item = prospero.get(self.corporaTable.getSelection());
                if (item) {
                    self.textTable.setData(item.identity).reload();
                    console.log("open corpus infos pane");
                    self.rightPanel.switchTo("corpusEditor");
                    self.rightPanel.getPanel("corpusEditor").setData(item.identity).reload();
                } else {
                    self.textTable.setData(null).reload();
                    self.rightPanel.switchTo();
                }
                self.dicoTable.deselectAll();
                self.textTable.deselectAll();
                self.middlePanel.switchTo("textTable");
	        }
	    } else if (origin == self.textTable) {
	        if (event.name == "selectionChanged") {
                var $items = this.textTable.getSelection();
                if ($items.length == 1) {
                    var item = prospero.get($items.eq(0));
                    self.rightPanel.getPanel("textEditor").setData(item.identity).reload();
                    console.log("open text edition pane");
                    self.rightPanel.switchTo("textEditor");
                } else if ($items.length > 1) {
                    // open multitexts pane
                    console.log("open multitexts pane");
                    self.rightPanel.switchTo("textSelectionsEditor");
                } else {
                    self.rightPanel.switchTo();
                }
                self.dicoTable.deselectAll();
                self.corporaTable.deselectAll();
	        }
	    } else if (origin == self.dicoTable) {
            var item = prospero.get(self.dicoTable.getSelection());
            self.corporaTable.deselectAll();
            self.textTable.deselectAll();
            self.rightPanel.switchTo();
            self.middleDicoEditor.setData(item.identity).reload();
            self.middlePanel.switchTo("dicoEditor");
	    } else if (origin == self.middleDicoEditor) {
            var item = prospero.get(self.middleDicoEditor.getSelection());
            if (item != null && !Array.isArray(item) && !item.isLeaf()) {
                console.log(item);
                self.rightDicoEditor.setData(item.identity).reload();
                self.rightPanel.switchTo("dicoEditor");
            }
	    }
    }
    reload() {
        return this.load();
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