class NewGroupModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.form = new PForm(self.node.find(".modal-body"));
		self.form.addField("username", new PTextInput(self.node.find(".user-username-input")));
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
            prospero.ajax(
                "createGroup",
                {
                    fields : self.form.serialize()
                },
                function(data) {
                    if (!data.serverError) {
                        var lock = settingsView.userTable.reload();
                        prospero.wait(lock, function() {
                            self.hide();
                        });
                    } else {
                        self.form.setErrors(data.serverError);
                    }
                }
            );
		});
	}
	show() {
	    this.form.getField("username").setValue("");
	    this.form.clear();
	    super.show();
	}
}