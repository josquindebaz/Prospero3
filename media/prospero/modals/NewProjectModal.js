class NewProjectModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.projectNameInput = new PTextInput(self.node.find(".project-name-input"));
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
		    console.log(self.projectNameInput.getValue());
            prospero.ajax(
                "createProject",
                {
                    fields : {
                        name : {
                            value: self.projectNameInput.getValue(),
                            id: self.projectNameInput.uniqueId()
                        }
                    }
                },
                function(data) {
                    if (!data.serverError) {
                        self.hide({action: "create", projectUrl: data.url});
                    }
                }
            );
		});
	}
	show() {
	    this.projectNameInput.setValue("");
	    super.show();
	}
}