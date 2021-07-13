class TextEditor extends PObject {

	constructor($node, view) {
	    super($node);
	    var self = this;
	    self.view = view;
	    self.menu = new PGenericMenu($(".generic-menu", self.node));
        if (prospero.interface.userIsOwner()) {
            self.menu.addAction("createDescriptiveData", "Create descriptive data", function() {
                console.log("createDescriptiveData");
                var modalLock = modals.openNewMetadata(self.data);
                prospero.wait(modalLock, function() {
                    if (modalLock.data.action == "create") {
                        prospero.addMetadata(modalLock.data.metadata, self.metadataContainer, self.canWrite);
                    }
                });
            });
            self.menu.addAction("createAssociatedData", "Create associated data", function() {
                console.log("createAssociativeData");
            });
        }
        self.metadataContainer = $(".cartouche-metaDatas", self.node);
        self.canWrite = prospero.interface.userCanWrite();
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
        prospero.ajax("serializeObject", this.data, function(data) {
            // load text
            var $text = $(".text-container", self.node);
            //$text.empty();
            prospero.initEditionWidgets($text, data.object.requiredDatas, self.data, self.canWrite);
            //var text = data.object.text;
            //text = prospero.escapeHtml(text);
            //text = text.replace(/\n/g, "<br>");
            //$text.html(text);
            // load datas
            prospero.initEditionWidgets($(".cartouche-fixed", self.node), data.object.requiredDatas, self.data, self.canWrite);
            self.metadataContainer.empty();
            $.each(data.object.metaDatas, function(index, metaData) {
                prospero.addMetadata(metaData, self.metadataContainer, self.data, self.canWrite);
            });
            prospero.sortable(self.metadataContainer, {
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
        });
	}
}