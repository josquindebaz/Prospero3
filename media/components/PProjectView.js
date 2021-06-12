class PProjectView extends PObject {

	constructor($node, data) {
	    super($node);
	    this.data = data;
	    this.corporaTable = new PTable($(".corpora-table"));
	}
	load() {
	    this.corporaTable.load();
	}
}

class PTable extends PObject {

	constructor($node, data) {
	    super($node);
	    this.data = data;
	}
	load() {
        var self = this;
        prospero.ajax("renderTable", this.data, function(data) {
            var $tbody = $("tbody", self.node);
            $tbody.empty();
            $.each(data.table, function(index, line) {
                var $tr = $("<tr></tr>");
                $tbody.append($tr);
                $.each(line, function(index, value) {
                    var $td = $("<td>"+value+"</td>");
                    $tr.append($td);
                });
            });
        });
	}
}