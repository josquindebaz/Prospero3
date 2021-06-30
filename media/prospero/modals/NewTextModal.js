class NewTextModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.node.find(".text-creation-choice input").bind("click", function() {
            var $chosenRadio = self.node.find(".text-creation-choice input:checked");
            var choice = $chosenRadio.attr("value");
            if (choice == "textarea") {
                self.node.find(".text-creation-input").removeClass("hidden");
                self.node.find(".text-creation-dropezone").addClass("hidden");
            } else {
                self.node.find(".text-creation-input").addClass("hidden");
                self.node.find(".text-creation-dropezone").removeClass("hidden");
            }
		});
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
                        var item = prospero.get(projectView.corporaTable.getSelection());
                        if (item) {
                            var lock = projectView.textTable.reload(item.identity);
                            prospero.wait(lock, function() {
                                var $textItem = projectView.textTable.getItem(data.text.identity)
                                projectView.textTable.setSelection($textItem);
                            });
                        }
                        self.hide();
                    }
                }
            );
		});
		new McDropzone(
			this.node.find(".dropzone-panel"),
			{
				fileExtensions : "txt, pdf",
				fileChange : function(dropzone, file, loadEvent) {
					self.node.find(".dropzone-panel").addClass("hidden");
					self.node.find(".close-button").addClass("hidden");
					self.node.find(".spinner-panel").removeClass("hidden");
					var formData = new FormData();
					formData.append('file', file, file.name);
					prospero.uploadFile(formData, function(uploadDone, data) {
						if (uploadDone) {
                            prospero.ajax(
                                "createText",
                                {
									filePath : data.filePath,
									corpus : self.corpus.identity
								},
                                function(data) {
                                    var item = prospero.get(projectView.corporaTable.getSelection());
                                    if (item) {
                                        var lock = projectView.textTable.reload(item.identity);
                                        prospero.wait(lock, function() {
                                            var $textItem = projectView.textTable.getItem(data.text.identity)
                                            projectView.textTable.setSelection($textItem);
                                        });
                                    }
                                    self.hide();
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
	setStateReady() {
        this.textarea.setValue("");
        this.node.find(".close-button").removeClass("hidden");
        this.node.find(".spinner-panel").addClass("hidden");
        //this.node.find(".error-feedback-pane").addClass("hidden");
	}
	show() {
	    this.setStateReady();
        var corpus = prospero.get(projectView.corporaTable.getSelection());
        var txtCorpus = 'Le texte sera ajouté au corpus courant "'+corpus.data.name+'"';
        var $txtCorpus = $(".txt-corpus", this.node);
        $txtCorpus.text(txtCorpus);
        this.corpus = corpus;
	    super.show();
	}
}