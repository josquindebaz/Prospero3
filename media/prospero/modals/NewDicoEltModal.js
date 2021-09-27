class NewDicoEltModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.dataNameInput = new PTextInput(self.node.find(".new-dico-elt-name-input"));
		self.dataTypeSelect = new PSelect($(".new-dico-elt-type-select", self.node));
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
		    console.log(self.dataNameInput.getValue());
            prospero.ajax(
                "createDicoElement",
                {
                    infos : self.infos,
                    fields : {
                        name : {
                            value: self.dataNameInput.getValue(),
                            id: self.dataNameInput.uniqueId()
                        },
                        type : {
                            value: self.dataTypeSelect.getValue(),
                            id: self.dataTypeSelect.uniqueId()
                        }
                    }
                },
                function(data) {
                    if (!data.serverError) {
                        self.hide({action: "create", metadata: data.metadata});
                    } else {
                        var fields = data.serverError.fields;
                        $.each(fields, function(key, value) {
                            var field = prospero.get(self.node.find("#"+value.id));
                            field.setAsInvalid(value.error);
                        });
                    }
                }
            );
		});
	}
	setStateReady() {
        this.dataNameInput.setValue("");
        if (this.infos.model == "PDictElement") {
            this.node.find(".new-dico-elt-type-select").addClass("hidden");
            this.node.find(".element-model-name").text("element");
            this.node.find(".element-model-value-name").text("Element value");
        } else if (this.infos.model == "Category") {
            this.node.find(".new-dico-elt-type-select").removeClass("hidden");
            this.node.find(".element-model-name").text("category");
            this.node.find(".element-model-value-name").text("Category name");
        } else if (this.infos.model == "PDictPackage") {
            this.node.find(".new-dico-elt-type-select").addClass("hidden");
            this.node.find(".element-model-name").text("package");
            this.node.find(".element-model-value-name").text("Package name");
        }
	}
	show(infos) {
	    this.infos = infos;
	    this.setStateReady();
        console.log(this.infos);
	    super.show();
	}
}