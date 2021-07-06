class AffectGroupModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
	    self.group = null;
	    self.acInput = new PAutoCompleteInput($node.find(".user-choice-field"));
	    self.userList = new PUserList($node.find(".users-in-group"));
	    self.acInput.addObserver(function(event) {
	        self.userList.addItem(event.item);
	    });
	    self.userList.addObserver(function(event) {
	        if (event.name == "addItem")
	            self.acInput.autoComplete.addHiddenId(event.item.identity.id);
	        else if (event.name == "removeItem")
	            self.acInput.autoComplete.removeHiddenId(event.item.identity.id);
	    });
		/*self.form.addField("thumbnail", new PDropzone(self.node.find(".thumbnail-field")));
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
		});*/
	}
	show(group) {
	    var self = this;
	    self.group = group;
        self.acInput.clear();
	    self.userList.setData(group).load();
	    /*
	    this.form.getField("username").setValue("");
	    this.form.getField("firstName").setValue("");
	    this.form.getField("lastName").setValue("");
	    this.form.clear();
	    */
	    super.show();
	}
}