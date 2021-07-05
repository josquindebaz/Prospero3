class EditUserModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.form = new PForm(self.node.find(".modal-body"));
		self.form.addField("username", new PTextInput(self.node.find(".user-username-input")));
		self.form.addField("firstName", new PTextInput(self.node.find(".user-first_name-input")));
		self.form.addField("lastName", new PTextInput(self.node.find(".user-last_name-input")));
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
            prospero.ajax(
                "modifyUser",
                {
                    fields : self.form.serialize(),
                    identity : self.user.identity
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
	show(user) {
	    this.user = user;
	    this.form.clear();
	    this.form.getField("username").setValue(user.data.username);
	    this.form.getField("firstName").setValue(user.data.first_name);
	    this.form.getField("lastName").setValue(user.data.last_name);
	    super.show();
	}
}