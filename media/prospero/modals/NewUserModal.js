class NewUserModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.form = new PForm(self.node.find(".modal-body"));
		self.form.addField("thumbnail", new PUserDropzone(self.node.find(".thumbnail-field")));
		self.form.addField("username", new PTextInput(self.node.find(".username-field")));
		self.form.addField("first_name", new PTextInput(self.node.find(".first_name-field")));
		self.form.addField("last_name", new PTextInput(self.node.find(".last_name-field")));
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
                        self.hide({action: "create"});
                    } else {
                        self.form.setErrors(data.serverError);
                    }
                }
            );
		});
	}
	show() {
	    this.form.clear();
	    super.show();
	}
}