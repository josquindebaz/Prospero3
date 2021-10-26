class CorpusEditor extends PObject {

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
        self.metadataContainer = $(".cartouche-metaDatas .cartouche-content", self.node);
        self.associatedDataContainer = $(".cartouche-associatedDatas", self.node);
        self.canWrite = prospero.interface.userCanWrite();
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
        prospero.ajax("serializeObject", this.data, function(data) {
            var observedWidgets = prospero.initEditionWidgets($("h3.title", self.node), data.object.datas, self.data, self.canWrite);
            var observedWidgets2 = prospero.initEditionWidgets($(".cartouche-fixed", self.node), data.object.datas, self.data, self.canWrite);
            observedWidgets.push.apply(observedWidgets, observedWidgets2);
            $.each(observedWidgets, function(index, widget) {
                widget.addObserver(function(event) {
                    if (event.name == "valueSaved") {
                        console.log("REFRESH");
                        var corpus = prospero.get(self.view.corporaTable.getSelection());
                        corpus.reload();
                    }
                });
            });
            var $cartouche = $(".cartouche-metaDatas", self.node);
            self.metadataContainer.empty();
            $.each(data.object.metaDatas, function(index, metaData) {
                prospero.addMetadata(metaData, self.metadataContainer, null, self.canWrite);
            });
            self.associatedDataContainer.empty();
            $.each(data.object.associatedDatas, function(index, associatedData) {
                self.addAssociatedData(associatedData, self.canWrite);
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