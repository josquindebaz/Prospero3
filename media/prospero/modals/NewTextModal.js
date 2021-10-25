class NewTextModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
	    this.creationChoice = new PRadioInput($(".text-creation-choice", self.node));
		this.creationChoice.addObserver(function() {
            var choice = self.creationChoice.getValue();
            self.switchToCreationChoice(choice);
		})
		self.textarea = new PTextarea(self.node.find(".text-creation-input"));
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
            prospero.ajax(
                "createText",
                {
                    text : self.textarea.getValue(),
                    corpus : self.corpus.identity
                },
                function(data) {
                    if (!data.serverError) {
                        self.hide({action: "create"});
                    }
                }
            );
		});
		new McDropzone(
			this.node.find(".dropzone-panel"),
			{
			    multiple: false,
				fileExtensions : "txt, pdf",
				fileChange : function(dropzone, files, loadEvent) {
					self.node.find(".dropzone-panel").addClass("hidden");
					self.node.find(".close-button").addClass("hidden");
					self.node.find(".spinner-panel").removeClass("hidden");
					var formData = new FormData();
					$.each(files, function(index, file) {
                        formData.append('file'+index, file, file.name);
					});
					prospero.uploadFile(formData, function(uploadDone, data) {
						if (uploadDone) {
                            prospero.ajax(
                                "createText",
                                {
									filePath : data.files[0].filePath,
									corpus : self.corpus.identity
								},
                                function(data) {
                                    self.hide({action: "create"});
                                }
                            );
						} else {
							console.log("upload fails", data);
						}
					});
				},
				enterExit : function(dropzone, isHover) {
					if (isHover)
						dropzone.node.find(".mc-dropzone-feedback").addClass("hover");
					else
						dropzone.node.find(".mc-dropzone-feedback").removeClass("hover");
				},
				badFile : function(dropzone, file) {
					$$.magicCms.showUserFeedback("Import only csv files");
				}
			}
		);
	}
	switchToCreationChoice(choice) {
        if (choice == "textarea") {
            this.textarea.setValue("");
            this.node.find(".text-creation-input").removeClass("hidden");
            this.node.find(".text-creation-dropezone").addClass("hidden");
        } else {
            this.node.find(".text-creation-input").addClass("hidden");
            this.node.find(".text-creation-dropezone").removeClass("hidden");
        }
	}
	setStateReady() {
        this.node.find(".close-button").removeClass("hidden");
        this.node.find(".spinner-panel").addClass("hidden");
        var $option = this.creationChoice.getEnabledOptions().eq(0)
        this.creationChoice.setValue($option.attr("value"));
        this.switchToCreationChoice("textarea");
        //this.node.find(".error-feedback-pane").addClass("hidden");
	}
	show(corpus) {
	    this.setStateReady();
        var txtCorpus = 'Le texte sera ajouté au corpus courant "'+corpus.data.name+'"';
        var $txtCorpus = $(".txt-corpus", this.node);
        $txtCorpus.text(txtCorpus);
        this.corpus = corpus;
	    super.show();
	}
}