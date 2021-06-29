class NewMetadataModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.dataNameInput = new PTextInput(self.node.find(".data-name-input"));
		self.dataTypeSelect = new PSelect($(".data-type-select", self.node));
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
		    console.log(self.dataNameInput.getValue());
            prospero.ajax(
                "createMetadata",
                {
                    corpus : self.corpus,
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
                        var corpusEditor = projectView.editorPanel.getPanel("corpusEditor");
                         corpusEditor.addMetadata(data.metadata);
                        self.hide();
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
	show(corpusData) {
	    this.dataNameInput.setValue("");
	    this.corpus = corpusData;
	    super.show();
	}
}