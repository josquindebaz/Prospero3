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
	            console.log("TODO export");
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
                    self.textTable.load(item.data);
                    console.log("open corpus infos pane");
                    self.editorPanel.switchTo("corpusEditor");
                    self.editorPanel.getPanel("corpusEditor").load(item.data);
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
                    self.editorPanel.getPanel("textEditor").load(item.data);
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
	    this.corporaTable.load(this.data);
	    this.dicoTable.load(this.data);
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
class PTable extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	    this.actionTriggers = {};
	    this.columns = $node.find("thead th").map(function(value){
	        return $(this).attr("property-name")
	    }).get()
	}
	addActionTrigger(actionName, $trigger, callback) {
	    var self = this;
	    this.actionTriggers[actionName] = {
	        trigger: $trigger,
	        callback: callback
	    };
	    $trigger.bind("click", function() {
	        callback(self);
	    });
	}
	showActionTrigger(actionName) {
	    this.actionTriggers[actionName].trigger.removeClass("hidden");
	}
	hideActionTrigger(actionName) {
	    this.actionTriggers[actionName].trigger.addClass("hidden");
	}
	load(data) {
        var self = this;
        var $tbody = $("tbody", self.node);
        if (data) {
            this.data = data;
            this.data.property = this.propertyName;
            prospero.ajax("renderTable", this.data, function(data) {
                $tbody.empty();
                $.each(data.table, function(index, line) {
                    var $tr = $("<tr></tr>");
                    $tbody.append($tr);
                    var item = self.createTableItem($tr, line.identity, self.columns);
                    item.load(line.values);
                    item.addObserver(function(event) {
                        self.receiveEvent(event);
                    });
                });
            });
        } else {
            $tbody.empty();
        }
	}
	createTableItem($node, data, columns) {
        return new PTableItem($node, data, columns);
	}
	getItems() {
	    return $("tbody", self.node).children();
	}
	setSelection($item) {
	    var item = prospero.get($item);
	    item.setSelected();
	}
	getSelection() {
	    var $selected = $("tbody", this.node).children(".active");
	    return $selected;
	}
	deselectAll() {
	    $("tbody", this.node).children().removeClass("active");
	}
	// override if necessary
	receiveEvent(event) {}
}
class CorporaTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    var self = this;
	    this.propertyName = "corpuses";
	    this.addActionTrigger("create", $(".icon_link.plus", self.node), function() {
	        console.log("create corpus");
	    });
	    this.addActionTrigger("delete", $(".icon_link.moins", self.node), function() {
	        var item = prospero.get(self.getSelection());
	        approvalModal.show({
	            title: "Confirmation",
	            text: "Do you really want to delete this corpus ?",
	            callback : function() {
                    prospero.ajax("deleteObject", item.data, function(data) {
                        console.log("delete corpus", item.data);
                        approvalModal.hide();
                        prospero.getPDBObject(item.data).remove();
                        self.notifyObservers({name: "selectionChanged"});
                    });
	            }
	        });
	    });
	}
	load(data) {
	    super.load(data);
	    this.showActionTrigger("create");
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
class TextTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    var self = this;
	    this.propertyName = "texts";
	    this.addActionTrigger("create", $(".icon_link.plus", self.node), function() {
	        console.log("create text");
	    });
	    this.addActionTrigger("delete", $(".icon_link.moins", self.node), function() {
	        var item = prospero.get(self.getSelection());
	        approvalModal.show({
	            title: "Confirmation",
	            text: "Do you really want to delete this text ?",
	            callback : function() {
                    prospero.ajax("deleteObject", item.data, function(data) {
                        console.log("delete text", item.data);
                        approvalModal.hide();
                        prospero.getPDBObject(item.data).remove();
                        self.notifyObservers({name: "selectionChanged"});
                    });
	            }
	        });
	    });
	}
	load(data) {
	    super.load(data);
	    this.showActionTrigger("create");
	    this.hideActionTrigger("delete");
	}
	receiveEvent(event) {
        var self = this;
        if (event.name == "click") {
            var item = event.target;
            var selectionChanged = false;
            if (event.original.ctrlKey) {
                console.log("multi");
                selectionChanged = true;
                item.toggleSelected()
            } else {
                if (!item.isSelected() || self.getSelection().length > 1) {
                    selectionChanged = true;
                    self.deselectAll();
                    item.setSelected();
                }
            }
            if (selectionChanged) {
                self.notifyObservers({name: "selectionChanged"});
                if (self.getSelection().length > 0)
                    self.showActionTrigger("delete");
                else
                    self.hideActionTrigger("delete");
            }
        }
	}
}
class DicoTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    this.propertyName = "dictionnaries";
	}
	createTableItem($node, data, columns) {
        return new DicoTableItem($node, data, columns);
	}
}
class PTableItem extends PDBObject {

	constructor($node, data, columns) {
	    super($node, data);
	    this.data = data;
	    var self = this;
	    self.columns = columns;
	    $node.bind("click", function(event) {
            self.notifyObservers({
                name: "click",
                target: self,
                original: event
            });
	    });
	}
	load(data) {
        var self = this;
        $.each(self.columns, function(index, column) {
            var value = data[column];
            if (value == null)
                value = "";
            var $td = $("<td>"+value+"</td>");
            self.node.append($td);
        });
	}
	isSelected() {
	    return this.node.hasClass("active");
	}
	setSelected() {
	    this.node.addClass("active");
	}
	setUnselected() {
	    this.node.removeClass("active");
	}
	toggleSelected() {
	    this.node.toggleClass("active");
	}
}

class DicoTableItem extends PTableItem {

	constructor($node, data, columns) {
	    super($node, data, columns);
	}
	load(data) {
        var self = this;
        $.each(self.columns, function(index, column) {
            var value = data[column];
            if (value == null)
                value = "";
            var $td = $("<td></td>");
            if (column == "name") {
                $td.html('<div class="form-check"><input class="form-check-input" type="checkbox" value=""><label class="form-check-label" for="">'+value+'</label></div>');
                var id = $td.find(".form-check-input").uniqueId().attr("id");
                $td.find(".form-check-label").attr("for", id);
            } else
                $td.text(value);
            self.node.append($td);
        });
	}
}

class SwitchPanel extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	    this.panels = {};
	    this.currentPanel = null;
	}
	getPanel(name) {
	    return this.panels[name];
	}
	addPanel(name, panel) {
	    this.panels[name] = panel;
	}
	switchTo(name) {
	    var panel = this.panels[name];
	    if (this.currentPanel)
	        this.currentPanel.node.addClass("hidden");
	    this.currentPanel = panel;
	    if (this.currentPanel)
	        this.currentPanel.node.removeClass("hidden");
	}
}

class EditorPanel extends SwitchPanel {

	constructor($node, view) {
	    super($node, view);
	    this.addPanel("textEditor", new TextEditor(this.node.find(".text-editor"), view));
	    this.addPanel("corpusEditor", new CorpusEditor(this.node.find(".corpus-editor"), view));
	    this.addPanel("textSelectionsEditor", new TextSelectionsEditor(this.node.find(".text-selections-editor"), view));
	}
}

class TextEditor extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	}
	load(data) {
        var self = this;
        this.data = data;
        prospero.ajax("renderObject", this.data, function(data) {
            // load text
            var $text = $(".text-container", self.node);
            $text.empty();
            var text = data.object.text;
            text = prospero.escapeHtml(text);
            text = text.replace(/\n/g, "<br>");
            $text.html(text);
            // load meta datas
            var $cartouche = $(".cartouche", self.node);
            $cartouche.empty();
            $.each(data.object.requiredDatas, function(index, metaData) {
                var name = metaData.name.charAt(0).toUpperCase() + metaData.name.slice(1)
                var value = prospero.escapeHtml(metaData.value);
                var $item = $('<div class="cartouche_item"><label>'+name+'</label>'+value+'</div>');
                $cartouche.append($item);
            });
            $.each(data.object.metaDatas, function(index, metaData) {
                var name = metaData.name.charAt(0).toUpperCase() + metaData.name.slice(1)
                var value = prospero.escapeHtml(metaData.value);
                var $item = $('<div class="cartouche_item"><label>'+name+'</label>'+value+'</div>');
                $cartouche.append($item);
            });
        });
	}
}
class CorpusEditor extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	}

	load(data) {
        var self = this;
        this.data = data;
        prospero.ajax("renderObject", this.data, function(data) {
            $("[property-name]", self.node).text(data.object.name);
            var $cartoucheFixed = $(".cartouche-fixed", self.node);
            $("[property-author]", $cartoucheFixed).text(data.object.author);
            var $cartouche = $(".cartouche-metaDatas", self.node);
            $cartouche.empty();
            $.each(data.object.metaDatas, function(index, metaData) {
                var name = metaData.name.charAt(0).toUpperCase() + metaData.name.slice(1)
                var value = prospero.escapeHtml(metaData.value);
                var $item = $('<div class="cartouche_item"><label>'+name+'</label>'+value+'</div>');
                $cartouche.append($item);
            });
        });
	}
}
class TextSelectionsEditor extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	}

	load(data) {
        var self = this;
        this.data = data;
        prospero.ajax("renderObject", this.data, function(data) {
            var $text = $(".text-container", self.node);
            $text.empty();
            $text.text(data.object.text);
        });
	}
}
class StateButton extends PObject {

	constructor($node) {
	    super($node);
	    var self = this;
	    $(".state-button-state", self.node).bind("click", function() {
	        var action = $(this).text().trim();
	        self.notifyObservers({name: "click", action: action});
	    });

	    $(".dropdown-item", self.node).bind("click", function() {
	        var action = $(this).text().trim();
	        $(".state-button-state", self.node).text(action);
	        self.notifyObservers({name: "click", action: action});
	    });
	}
}