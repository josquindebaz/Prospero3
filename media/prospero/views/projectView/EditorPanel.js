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
            $("[property-name=name]", self.node).text(data.object.name);
            var $cartoucheFixed = $(".cartouche-fixed", self.node);
            var $authorWidget = $("[property-name=author]", $cartoucheFixed);
            //$authorWidget.val(data.object.author);
            var authorData = prospero.find(data.object.datas, "name", "author")
            new PASTextInput($authorWidget, authorData).setValue(authorData.value);
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
        var name = metaData.name.charAt(0).toUpperCase() + metaData.name.slice(1)
        var value = prospero.escapeHtml(metaData.value);
        var type = metaData.type;
        var $item = null;
        var widget = null;
        var iconDelete = '<div class="icon-delete-metadata"><div class="icon-cancel-circled"></div></div>';
        if (type == "String") {
            var editionWidgetCode = '<input class="edition-widget" value="'+value+'" />';
            $item = $('<div class="cartouche_item metadata-widget">'+iconDelete+'<label>'+name+'</label>'+editionWidgetCode+'</div>');
            $cartouche.append($item);
            widget = new PASTextInput($item, metaData);
        } else if (type == "Datetime") {
            var editionWidgetCode = '<input class="edition-widget" value="'+value+'" />';
            $item = $('<div class="cartouche_item metadata-widget">'+iconDelete+'<label>'+name+'</label>'+editionWidgetCode+'</div>');
            $cartouche.append($item);
            widget = new PASTextInput($item, metaData);
        } else if (type == "Text") {
            var editionWidgetCode = '<textarea class="edition-widget">'+value+'</textarea>';
            $item = $('<div class="cartouche_item metadata-widget">'+iconDelete+'<label>'+name+'</label>'+editionWidgetCode+'</div>');
            $cartouche.append($item);
            var widget = new PASTextarea($item, metaData);
            widget = widget.autosize();
        }
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