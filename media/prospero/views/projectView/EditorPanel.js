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
	clear() {
	}
	setData(data) {
	    this.data = data;
	    return this;
	}
	reload() {
	    this.clear();
	    this.load();
	}
	load() {
        var self = this;
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
	clear() {
	    this.node.find(".cartouche-fixed .tags-input .dropdown").remove();
        this.node.find(".cartouche-fixed .tags-input select option:not(.option-placeholer)").remove();
        if (this.node.find(".cartouche-fixed .tags-input select option.option-placeholer").length == 0) {
            var $option = $('<option class="option-placeholer" selected disabled hidden value="">Choose a tag...</option>');
            this.node.find(".cartouche-fixed .tags-input select").append($option);
        }
	}
	setData(data) {
	    this.data = data;
	    return this;
	}
	reload() {
	    this.clear();
	    this.load();
	}
	load() {
        var self = this;
        prospero.ajax("renderObject", this.data, function(data) {
            prospero.initEditionWidgets($("h3.title", self.node), data.object.datas);
            prospero.initEditionWidgets($(".cartouche-fixed", self.node), data.object.datas);
            var $cartouche = $(".cartouche-metaDatas", self.node);
            var $cartoucheContainer = $cartouche.find(".cartouche-content")
            $cartoucheContainer.empty();
            $.each(data.object.metaDatas, function(index, metaData) {
                self.addMetadata(metaData, $cartoucheContainer);
            });
            prospero.sortable($cartoucheContainer, {
                placeholder: "metadata-sort-placeholder",
                start: function( event, ui ) {
                    $(ui.item).addClass("dnd-working");
                },
                update: function( event, ui ) {
                    var $item = $(ui.item);
                    var next = null;
                    var $next = $item.next();
                    if ($next.length > 0)
                        next = prospero.get($next).data
                    prospero.ajax(
                        "changeMetadataPosition",
                        {
                            item : prospero.get($item).data,
                            next : next
                        },
                        function(data) {
                        }
                    );
                },
                stop: function( event, ui ) {
                    $(ui.item).removeClass("dnd-working");
                }
            });
            $cartouche.find(".icon-add-metadata .icon-plus-circled").bind("click", function() {
                newMetadataModal.show(self.data);
            });
        });
	}
	addMetadata(metaData, $cartouche) {
	    if (!$cartouche)
	        $cartouche = $(".cartouche-metaDatas .cartouche-content", self.node);
        var labelName = metaData.name.charAt(0).toUpperCase() + metaData.name.slice(1)
        var $item = $('<div class="cartouche_item metadata-widget"><div class="icon-delete-metadata"><div class="icon-cancel-circled"></div></div><label>'+labelName+'</label></div>');
        var $editionWidget = prospero.createEditionWidgetHtml(metaData);
        $item.append($editionWidget);
        $cartouche.append($item);
        var widget = prospero.initEditionWidget($item, metaData);
        $item.find(".icon-delete-metadata .icon-cancel-circled").bind("click", function() {
            prospero.ajax("deleteObject", widget.data.identity, function(data) {
                widget.node.remove();
            });
        });
	}
}
class TextSelectionsEditor extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	}
	clear() {
	}
	setData(data) {
	    this.data = data;
	    return this;
	}
	reload() {
	    this.clear();
	    this.load();
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