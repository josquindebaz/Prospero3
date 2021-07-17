class NewGroupModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.form = new PForm(self.node.find(".modal-body"));
		self.form.addField("thumbnail", new PUserDropzone(self.node.find(".thumbnail-field")));
		self.form.addField("username", new PTextInput(self.node.find(".username-field")));

	    self.acInput = new PAutoCompleteInput($node.find(".user-choice-field"));
        prospero.getUserData(function(userData) {
            userData = _.filter(userData, function(user){ return user.identity.id != prospero.interface.getUserData().anonymousUserId; });
            self.acInput.setData(userData);
        });
	    self.userList = new PUserList($node.find(".users-in-group"));
	    self.form.addField("users", self.userList);

	    self.acInput.addObserver(function(event) {
	        self.userList.addItem(event.item);
	    });
	    self.userList.addObserver(function(event) {
	        if (event.name == "addItem")
	            self.acInput.autoComplete.addHiddenId(event.item.identity.id);
	        else if (event.name == "removeItem")
	            self.acInput.autoComplete.removeHiddenId(event.item.identity.id);
	    });

		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
            prospero.ajax(
                "createGroup",
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
        this.acInput.clear();
	    super.show();
	}
}