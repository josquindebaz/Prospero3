class NewUserModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.form = new PForm(self.node.find(".modal-body"));
		self.form.addField("thumbnail", new PDropzone(self.node.find(".thumbnail-field")));
		self.form.addField("username", new PTextInput(self.node.find(".username-field")));
		self.form.addField("firstName", new PTextInput(self.node.find(".first_name-field")));
		self.form.addField("lastName", new PTextInput(self.node.find(".last_name-field")));
		self.form.addField("password", new PTextInput(self.node.find(".password-field")));
		self.form.addField("password2", new PTextInput(self.node.find(".password2-field")));
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
            prospero.ajax(
                "createUser",
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
	    this.form.getField("firstName").setValue("");
	    this.form.getField("lastName").setValue("");
	    this.form.clear();
	    super.show();
	}
}