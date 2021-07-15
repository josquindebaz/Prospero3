class NewAssociatedDataModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.form = new PForm(self.node.find(".modal-body"));

		//self.corpusNameInput = new PTextInput(self.node.find(".corpus-name-input"));
		self.exportType = new PSelect($(".associated-data-type", self.node));
		self.form.addField("exportType", self.exportType);
		self.exportType.addObserver(function() {
		    self.switchTo(self.exportType.getValue());
		})
		self.uriInput = new PTextInput(self.node.find(".new-associated-data-uri-input"));
		self.form.addField("uriInput", self.uriInput);
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
		    var fields = self.form.serialize();
		    console.log(fields);
		    if (fields.exportType.value == "file" && !fields.file.value) {
		        self.form.clear(["exportType"]);
		        self.form.setError("file", "You should upload a file");
		    } else if (fields.exportType.value == "uri" && !fields.uriInput.value) {
		        self.form.clear(["exportType"]);
		        self.form.setError("uriInput", "You should specify an uri");
		    } else {
                prospero.ajax(
                    "createAssociatedData",
                    {
                        text : self.text,
                        fields : fields
                    },
                    function(data) {
                        if (!data.serverError) {
                            self.hide({action: "create", associatedData: data.associatedData});
                        } else {
                            var fields = data.serverError;
                            $.each(fields, function(key, value) {
                                var field = prospero.get(self.node.find("#"+value.id));
                                field.setAsInvalid(value.error);
                            });
                        }
                    }
                );
		    }
		});
		self.file = new PDropzone($(".new-associated-data-file-input", self.node));
		self.form.addField("file", self.file);
		self.file.addObserver(function() {
		    var filePath = self.file.getValue();
		    var fileName = filePath.split("/");
		    fileName = fileName[fileName.length -1];
		    self.setStateFileUploaded(filePath, fileName);
		});
	}
	switchTo(panelName) {
	    var self = this;
	    if (panelName == "file") {
	        $(".uri-panel", self.node).addClass("hidden");
	        $(".file-panel", self.node).removeClass("hidden");
	    } else {
	        $(".file-panel", self.node).addClass("hidden");
	        $(".uri-panel", self.node).removeClass("hidden");
	    }
	}
	setStateWorking() {
        this.node.find(".dropzone-panel").addClass("hidden");
        this.node.find(".close-button").addClass("hidden");
        this.node.find(".spinner-panel").removeClass("hidden");
	}
	setStateFileUploaded(filePath, fileName) {
	    this.filePath = filePath;
        this.node.find(".fileName").text("uploaded file : " + fileName);
        this.node.find(".fileName").removeClass("hidden");
        this.node.find(".dropzone-panel").removeClass("hidden");
        this.node.find(".close-button").removeClass("hidden");
        this.node.find(".spinner-panel").addClass("hidden");
	}
	show(text) {
	    this.text = text;
        this.exportType.setValue("file");
        this.switchTo("file");
        this.node.find(".fileName").text("");
        this.node.find(".fileName").addClass("hidden");
        this.form.clear();
	    super.show();
	}
}