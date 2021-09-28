class EditUserModal extends PModal {

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
		self.form.addField("isAdministrator", new PCheckInput(self.node.find(".isAdministrator-field")));
		self.validateButton = new PButton(self.node.find("[action-name=save]"));
		self.validateButton.addObserver(function(event) {
            prospero.ajax(
                "modifyUser",
                {
                    fields : self.form.serialize(),
                    identity : self.user.identity
                },
                function(data) {
                    if (!data.serverError) {
                        self.hide({action: "save"});
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
	    this.form.load(user.data);
	    super.show();
	}
}