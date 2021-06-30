class NewCorpusModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.corpusNameInput = new PTextInput(self.node.find(".corpus-name-input"));
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
		    console.log(self.corpusNameInput.getValue());
            prospero.ajax(
                "createCorpus",
                {
                    project : projectView.data,
                    fields : {
                        name : {
                            value: self.corpusNameInput.getValue(),
                            id: self.corpusNameInput.uniqueId()
                        }
                    }
                },
                function(data) {
                    if (!data.serverError) {
                        var lock = projectView.corporaTable.reload(projectView.data);
                        prospero.wait(lock, function() {
                            var $corpusItem = projectView.corporaTable.getItem(data.corpus.identity)
                            projectView.corporaTable.setSelection($corpusItem);
                        });
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
	show() {
	    this.corpusNameInput.setValue("");
	    super.show();
	}
}