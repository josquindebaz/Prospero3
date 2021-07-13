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
                        prospero.addMetadata(modalLock.data.metadata, self.metadataContainer);
                    }
                });
            });
            self.menu.addAction("createAssociatedData", "Create associated data", function() {
                console.log("createAssociativeData");
            });
        }
        self.metadataContainer = $(".cartouche-metaDatas .cartouche-content", self.node);
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
            prospero.initEditionWidgets($("h3.title", self.node), data.object.datas);
            prospero.initEditionWidgets($(".cartouche-fixed", self.node), data.object.datas);
            var $cartouche = $(".cartouche-metaDatas", self.node);
            self.metadataContainer.empty();
            $.each(data.object.metaDatas, function(index, metaData) {
                prospero.addMetadata(metaData, self.metadataContainer);
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