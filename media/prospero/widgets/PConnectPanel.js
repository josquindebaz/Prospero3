class PConnectPanel extends PObject {

	constructor($node) {
	    super($node);
		var self = this;
		self.form = new PForm(self.node);
		self.form.addField("username", new PTextInput(self.node.find(".connection-panel-username")));
		self.form.addField("password", new PTextInput(self.node.find(".connection-panel-password")));
		var $logout = self.node.find(".connection-panel-logout");
		if ($logout.length > 0)
		    self.form.addField("logout", new PCheckInput($logout));
		self.validateButton = new PButton(self.node.find("[action-name=log]"));
		self.validateButton.addObserver(function(event) {
            event.original.preventDefault();
            event.original.stopPropagation();
            prospero.ajax(
                "connect",
                {
                    fields : self.form.serialize()
                },
                function(data) {
                    if (!data.serverError) {
                        urls.reload();
                    } else {
                        self.form.setErrors(data.serverError);
                    }
                }
            );
		});
	}
}