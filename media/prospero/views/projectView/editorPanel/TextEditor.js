class TextEditor extends PObject {

	constructor($node, view) {
	    super($node);
	    var self = this;
	    self.view = view;
	    self.menu = new PGenericMenu($(".generic-menu", self.node));
        if (prospero.interface.userIsOwner()) {
            self.menu.addAction("createDescriptiveData", "Create descriptive data", function() {
                var modalLock = modals.openNewMetadata(self.data);
                prospero.wait(modalLock, function() {
                    if (modalLock.data.action == "create") {
                        prospero.addMetadata(modalLock.data.metadata, self.metadataContainer, null, self.canWrite);
                    }
                });
            });
            self.menu.addAction("createAssociatedData", "Create associated data", function() {
                console.log("createAssociativeData");
                var modalLock = modals.openNewAssociatedData(self.data);
                prospero.wait(modalLock, function() {
                    if (modalLock.data.action == "create") {
                        self.addAssociatedData(modalLock.data.associatedData, self.canWrite);
                    }
                });
            });
        }
        self.metadataContainer = $(".cartouche-metaDatas", self.node);
        self.associatedDataContainer = $(".cartouche-associatedDatas", self.node);
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
                prospero.addMetadata(metaData, self.metadataContainer, null, self.canWrite);
            });
            self.associatedDataContainer.empty();
            $.each(data.object.associatedDatas, function(index, associatedData) {
                self.addAssociatedData(associatedData, self.canWrite);
            });
            if (self.canWrite) {
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
            }
        });
	}
	addAssociatedData(data, editable) {
        var self = this;
        var iconCode = '<div class="icon-doc-inv"></div>';
        if (data.type == "PUri")
            iconCode = '<div class="icon-link-ext-alt"></div>';
        var $item = $('<div class="cartouche_item metadata-widget"><div class="icon-delete-metadata"><div class="icon-cancel-circled"></div></div><a target="_blank" style="display: flex;" href="'+data.href+'">'+iconCode+data.value+'</a></div>');
        self.associatedDataContainer.append($item);
        if (editable) {
            $item.find(".icon-cancel-circled").bind("click", function() {
                var modalLock = modals.openApproval("Confirmation", "Do you really want to delete this associated data ?");
                prospero.wait(modalLock, function() {
                    if (modalLock.data.action == "yes") {
                        prospero.ajax("deleteObject", data.identity, function(data) {
                            $item.remove();
                        });
                    }
                });
            });
        }
	}
}