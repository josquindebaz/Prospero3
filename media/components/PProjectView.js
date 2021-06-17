class PProjectView extends PObject {

	constructor($node, data) {
	    super($node);
	    this.data = data;
	    this.corporaTable = new CorporaTable($(".corpora-table"), this);
	    this.dicoTable = new DicoTable($(".dico-table"), this);
	    this.textTable = new TextTable($(".text-table"), this);
	    this.textPanel = new TextPanel($(".text-panel"), this);
	    $(".new-item-button").bind("click", function() {
	        importModal.show();
	    });
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
                    self.selectionChanged();
                });
                var values = line.values;
                $.each(self.columns, function(index, column) {
                    var $td = $("<td>"+values[column]+"</td>");
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
	selectionChanged() {
	    console.log(this, "selection changed");
	}
}

class CorporaTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    this.propertyName = "corpuses";
	}
	selectionChanged() {
	    console.log(this, "selection changed");
	    var item = prospero.get(this.getSelection());
	    this.view.textTable.load(item.data);
	}
}

class DicoTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    this.propertyName = "dictionnaries";
	}
	selectionChanged() {
	    console.log(this, "selection changed");
	    var item = prospero.get(this.getSelection());
	}
}

class TextTable extends PTable {

	constructor($node, view) {
	    super($node, view);
	    this.propertyName = "texts";
	}
	selectionChanged() {
	    console.log(this, "selection changed");
	    var item = prospero.get(this.getSelection());
	    this.view.textPanel.load(item.data);
	}
}

class PTableItem extends PObject {

	constructor($node, data) {
	    super($node);
	    this.data = data;
	    var self = this;
	    $node.bind("click", function() {
            self.setSelected();
	    });
	}
	setSelected() {
	    this.node.addClass("active");
	    this.notifyObservers({
	        type: "selectionChanged",
	        target: this
	    });
	}
}

class TextPanel extends PObject {

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