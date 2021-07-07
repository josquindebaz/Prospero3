class ChangeRightsModal extends PModal {

	constructor($node, userData) {
	    super($node);
	    var self = this;
	    self.project = null;
	    self.rights = null;
	    self.form = new PForm(self.node.find(".modal-body"));
	    self.acInput = new PAutoCompleteInput($node.find(".user-choice-field"));
        self.acInput.setData(userData);
        self.userList = new PUserRightList($node.find(".users-in-group"), userData);
        self.form.addField("users", self.userList);
        self.acInput.addObserver(function(event) {
            var item = _.clone(event.item);
            item.right = {
                right : "Read"
            }
            self.userList.addItem(item);
        });
        self.userList.addObserver(function(event) {
            if (event.name == "addItem")
                self.acInput.autoComplete.addHiddenId(event.item.identity.id);
            else if (event.name == "removeItem")
                self.acInput.autoComplete.removeHiddenId(event.item.identity.id);
        });
		self.validateButton = new PButton(self.node.find("[action-name=save]"));
		self.validateButton.addObserver(function(event) {
            console.log(self.form.serialize())
            prospero.ajax(
                "changeRights",
                {
                    fields : self.form.serialize(),
                    identity : self.project
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
	show(project, rights) {
	    var self = this;
	    self.project = project;
	    self.rights = rights;
	    this.acInput.clear();
	    this.form.clear();
	    this.form.load({
	        users: rights
	    });
	    super.show();
	}
}