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
        var lock = $.Deferred();
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
                lock.resolve();
            });
        } else {
            $tbody.empty();
            lock.resolve();
        }
        return lock;
	}
	createTableItem($node, identity, columns) {
        return new PTableItem($node, identity, columns);
	}
	getItems() {
	    return $("tbody", this.node).children();
	}
	getItem(data) {
        return prospero.getPDBWidget(data, this.node);
	}
	setSelection($item) {
	    var item = prospero.get($item);
	    //item.setSelected();
        item.notifyObservers({
            name: "click",
            target: item,
            original: null
        });
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
			newCorpusModal.show();
	    });
	    this.addActionTrigger("delete", $(".icon_link.moins", self.node), function() {
	        var item = prospero.get(self.getSelection());
	        approvalModal.show({
	            title: "Confirmation",
	            text: "Do you really want to delete this corpus ?",
	            callback : function() {
                    prospero.ajax("deleteObject", item.identity, function(data) {
                        console.log("delete corpus", item.identity);
                        approvalModal.hide();
                        prospero.getPDBWidget(item.identity).remove();
                        self.notifyObservers({name: "selectionChanged"});
                    });
	            }
	        });
	    });
	}
	load(data) {
	    var lock = super.load(data);
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
class TextTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    var self = this;
	    this.propertyName = "texts";
	    this.addActionTrigger("create", $(".icon_link.plus", self.node), function() {
	        newTextModal.show({
	            title: "Create text",
	            text: "",
	            callback : function() {
                    prospero.ajax("createText", item.data, function(data) {
                        console.log("create text", item.data);
                        newTextModal.hide();
                        //prospero.getPDBWidget(item.data).remove();
                        //self.notifyObservers({name: "selectionChanged"});
                    });
	            }
	        });
	    });
	    this.addActionTrigger("delete", $(".icon_link.moins", self.node), function() {
	        var items = prospero.get(self.getSelection(), true);
	        var itemDatas = [];
	        $.each(items, function(index, item) {
	            itemDatas.push(item.identity);
	        });
	        var approvalText = items.length > 1 ? "Do you really want to delete these texts ?" : "Do you really want to delete this text ?";
	        approvalModal.show({
	            title: "Confirmation",
	            text: approvalText,
	            callback : function() {
                    prospero.ajax("deleteObject", itemDatas, function(data) {
                        console.log("delete text", items);
                        approvalModal.hide();
                        $.each(items, function(index, item) {
                            item.node.remove();
                        });
                        self.notifyObservers({name: "selectionChanged"});
                    });
	            }
	        });
	    });
	}
	load(data) {
	    var lock = super.load(data);
	    this.showActionTrigger("create");
	    this.hideActionTrigger("delete");
	    return lock;
	}
	receiveEvent(event) {
        var self = this;
        if (event.name == "click") {
            var item = event.target;
            var selectionChanged = false;
            if (event.original && event.original.ctrlKey) {
                //event.original.preventDefault();
                //document.getSelection().removeAllRanges();
                selectionChanged = true;
                item.toggleSelected()
            } else if (self.lastSelectedItem && event.original && event.original.shiftKey) {
                //event.original.preventDefault();
                //document.getSelection().removeAllRanges();
                var indexes = [];
                var $children = $("tbody", this.node).children();
                indexes.push($children.index(item.node));
                indexes.push($children.index(self.lastSelectedItem.node));
                indexes = _.sortBy(indexes);
                console.log("multi", indexes);
                var $selected = $children.slice(indexes[0], indexes[1]+1);
                selectionChanged = true;
                self.deselectAll();
                $selected.each(function(index, value) {
                    prospero.get($(value)).setSelected();
                });
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
            self.lastSelectedItem = item;
        }
	}
}
class DicoTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    var self = this;
	    this.propertyName = "dictionnaries";
	    this.addActionTrigger("delete", $(".icon_link.moins", self.node), function() {
	        var items = prospero.get(self.getSelection(), true);
	        var itemDatas = [];
	        $.each(items, function(index, item) {
	            itemDatas.push(item.identity);
	        });
	        var approvalText = items.length > 1 ? "Do you really want to delete these dictionaries ?" : "Do you really want to delete this dictionary ?";
	        approvalModal.show({
	            title: "Confirmation",
	            text: approvalText,
	            callback : function() {
                    prospero.ajax("deleteObject", itemDatas, function(data) {
                        console.log("delete text", items);
                        approvalModal.hide();
                        $.each(items, function(index, item) {
                            item.node.remove();
                        });
                        self.notifyObservers({name: "selectionChanged"});
                    });
	            }
	        });
	    });
	}
	createTableItem($node, data, columns) {
        return new DicoTableItem($node, data, columns);
	}
	receiveEvent(event) {
        var self = this;
        if (event.name == "click") {
            var item = event.target;
            var selectionChanged = false;
            if (event.original && event.original.ctrlKey) {
                selectionChanged = true;
                item.toggleSelected()
            } else if (self.lastSelectedItem && event.original && event.original.shiftKey) {
                var indexes = [];
                var $children = $("tbody", this.node).children();
                indexes.push($children.index(item.node));
                indexes.push($children.index(self.lastSelectedItem.node));
                indexes = _.sortBy(indexes);
                console.log("multi", indexes);
                var $selected = $children.slice(indexes[0], indexes[1]+1);
                selectionChanged = true;
                self.deselectAll();
                $selected.each(function(index, value) {
                    prospero.get($(value)).setSelected();
                });
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
            self.lastSelectedItem = item;
        }
	}
}
class PTableItem extends PDBObject {

	constructor($node, identity, columns) {
	    super($node, identity);
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
        this.data = data;
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
                var check = new PCheckInput($td.find("input"));
                check.addObserver(function(event) {
                    console.log("XXX C");
                });
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