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
	    $(".new-item-button").bind("click", function() {
	        importModal.show();
	    });
	}
	manageEvent(origin, event) {
	    var self = this;
	    console.log(origin, event);
	    if (origin == self.corporaTable) {
	        if (event.name == "selectionChanged") {
                var item = prospero.get(self.corporaTable.getSelection());
                self.textTable.load(item.data);
                console.log("open corpus infos pane");
                self.editorPanel.switchTo("corpusEditor");
                self.editorPanel.getPanel("corpusEditor").load(item.data);
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
	    this.columns = $node.find("thead th").map(function(value){
	        return $(this).attr("property-name")
	    }).get()
	}
	load(data) {
        var self = this;
        this.data = data;
        this.data.property = this.propertyName;
        prospero.ajax("renderTable", this.data, function(data) {
            var $tbody = $("tbody", self.node);
            $tbody.empty();
            $.each(data.table, function(index, line) {
                var $tr = $("<tr></tr>");
                $tbody.append($tr);
                new PTableItem($tr, line.identity).addObserver(function(event) {
                    self.receiveEvent(event);
                });
                var values = line.values;
                $.each(self.columns, function(index, column) {
                    var value = values[column];
                    if (value == null)
                        value = "";
                    var $td = $("<td>"+value+"</td>");
                    $tr.append($td);
                });
            });
        });
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
	    if (!$selected.length)
	        $selected = null;
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
	    this.propertyName = "corpuses";
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
            //}
            //if (selectionChanged)
                self.notifyObservers({name: "selectionChanged"});
        }
	}
}
class TextTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    this.propertyName = "texts";
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
            if (selectionChanged)
                self.notifyObservers({name: "selectionChanged"});
        }
	}
}
class DicoTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    this.propertyName = "dictionnaries";
	}
}
class PTableItem extends PObject {

	constructor($node, data) {
	    super($node);
	    this.data = data;
	    var self = this;
	    $node.bind("click", function(event) {
            self.notifyObservers({
                name: "click",
                target: self,
                original: event
            });
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