class PModal extends PObject {

	constructor($node) {
	    super($node)
	    this.uniqueId = this.uniqueId();
	}
	show() {
	    this.node.modal("show");
	}
	hide() {
	    this.node.modal("hide");
	}
}

class ApprovalModal extends PModal {

	constructor($node) {
	    super($node)
	}
	show(options) {
	    this.node.find(".modal-title").text(options.title);
	    this.node.find(".approval-text").text(options.text);
        this.node.find("[action-name=yes]").unbind("click").bind("click", function() {
            options.callback();
        });
	    super.show();
	}
}
class ImportModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		new McDropzone(
			this.node.find(".dropzone-panel"),
			{
				fileExtensions : "dic, col, fic, cat, txt, zip",
				fileChange : function(dropzone, file, loadEvent) {
				    self.setStateWorking();
					var formData = new FormData();
					formData.append('file', file, file.name);
					prospero.uploadFile(formData, function(uploadDone, data) {
						if (uploadDone) {
                            prospero.ajax(
                                "importData",
                                {
									filePath : data.filePath,
									project : prospero.get($(".project-view")).data,
									corpus : self.corpus ? self.corpus.identity : null
								},
                                function(data) {
                                    if (!data.serverError) {
                                        var lock = projectView.load();
                                        prospero.wait(lock, function() {
                                            if (self.corpus) {
                                                self.corpus = prospero.getPDBObject(self.corpus.identity, projectView.corporaTable.node); // reload
                                                var $corpus = self.corpus ? self.corpus.node : projectView.corporaTable.getItems().eq(0);
                                                projectView.corporaTable.setSelection($corpus);
                                            }
                                            self.hide();
                                        });
									} else {
									    self.setStateError(data.serverError);
									}
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
	setStateWorking() {
        this.node.find(".dropzone-panel").addClass("hidden");
        this.node.find(".close-button").addClass("hidden");
        this.node.find(".spinner-panel").removeClass("hidden");
	}
	setStateReady() {
        this.node.find(".dropzone-panel").removeClass("hidden");
        this.node.find(".close-button").removeClass("hidden");
        this.node.find(".spinner-panel").addClass("hidden");
        this.node.find(".error-feedback-pane").addClass("hidden");
	}
	setStateError(message) {
	    this.node.find(".error-feedback-pane .error-txt").text(message);
        this.node.find(".dropzone-panel").addClass("hidden");
        this.node.find(".close-button").removeClass("hidden");
        this.node.find(".spinner-panel").addClass("hidden");
        this.node.find(".error-feedback-pane").removeClass("hidden");
	}
	show() {
	    this.setStateReady();
        var txtCorpus = 'Un corpus "main" sera créé si des textes sont importés';
        var corpus = prospero.get(projectView.corporaTable.getSelection());
        if (corpus != null)
            txtCorpus = 'Les textes importés seront ajoutés au corpus courant "'+corpus.data.name+'"';
        else {
            corpus = prospero.get(projectView.corporaTable.getItems().eq(0));
            if (corpus != null)
                txtCorpus = 'Les textes importés seront ajoutés au corpus suivant : "'+corpus.data.name+'"';
        }
        var $txtCorpus = $(".txt-corpus", this.node);
        $txtCorpus.text(txtCorpus);
        this.corpus = corpus;
	    super.show();
	}
}
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
                            var lock = projectView.textTable.load(item.identity);
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
                                        var lock = projectView.textTable.load(item.identity);
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
class NewCorpusModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.corpusNameInput = new PTextInput(self.node.find(".corpus-name-input"));
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
		    console.log(self.corpusNameInput.getValue());
            prospero.ajax(
                "createCorpus",
                {
                    project : projectView.data,
                    fields : {
                        name : {
                            value: self.corpusNameInput.getValue(),
                            id: self.corpusNameInput.uniqueId()
                        }
                    }
                },
                function(data) {
                    if (!data.serverError) {
                        var lock = projectView.corporaTable.load(projectView.data);
                        prospero.wait(lock, function() {
                            var $corpusItem = projectView.corporaTable.getItem(data.corpus.identity)
                            projectView.corporaTable.setSelection($corpusItem);
                        });
                        self.hide();
                    } else {
                        var fields = data.serverError.fields;
                        $.each(fields, function(key, value) {
                            var field = prospero.get(self.node.find("#"+value.id));
                            field.setAsInvalid(value.error);
                        });
                    }
                }
            );
		});
	}
	show() {
	    this.corpusNameInput.setValue("");
	    super.show();
	}
}
class NewMetadataModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		self.dataNameInput = new PTextInput(self.node.find(".data-name-input"));
		self.dataTypeSelect = new PSelect($(".data-type-select", self.node));
		self.validateButton = new PButton(self.node.find("[action-name=create]"));
		self.validateButton.addObserver(function(event) {
		    console.log(self.dataNameInput.getValue());
            prospero.ajax(
                "createMetadata",
                {
                    corpus : self.corpus,
                    fields : {
                        name : {
                            value: self.dataNameInput.getValue(),
                            id: self.dataNameInput.uniqueId()
                        },
                        type : {
                            value: self.dataTypeSelect.getValue(),
                            id: self.dataTypeSelect.uniqueId()
                        }
                    }
                },
                function(data) {
                    if (!data.serverError) {
                        var corpusEditor = projectView.editorPanel.getPanel("corpusEditor");
                         corpusEditor.addMetadata(data.metadata);
                        self.hide();
                    } else {
                        var fields = data.serverError.fields;
                        $.each(fields, function(key, value) {
                            var field = prospero.get(self.node.find("#"+value.id));
                            field.setAsInvalid(value.error);
                        });
                    }
                }
            );
		});
	}
	show(corpusData) {
	    this.dataNameInput.setValue("");
	    this.corpus = corpusData;
	    super.show();
	}
}
class ExportModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
	    this.exportType = new PSelect($(".items-export-type", self.node));
	    this.exportChoice = new PRadioInput($(".items-export-choice", self.node));
		self.validateButton = new PButton(self.node.find("[action-name=export]"));
		self.validateButton.addObserver(function(event) {
            self.setStateWorking();
            prospero.ajax(
                "exportData",
                {
                    project : projectView.data,
                    context : self.contextData,
                    type : self.exportType.getValue(),
                    choice : self.exportChoice.getValue()
                },
                function(data) {
                    if (!data.serverError) {
                        urls.download(data.filePath);
                        self.hide();
                    } else {
                        self.setStateError(data.serverError);
                    }
                }
            );
		});
	}
	setStateReady(data) {
        var self = this;
        this.node.find(".error-feedback-pane").addClass("hidden");
        this.node.find(".close-button").removeClass("hidden");
        this.node.find(".spinner-panel").addClass("hidden");
        $.each(data, function(key, value) {
            self.exportChoice.setOptionEnabled(key, value != null);
        });
        var $option = this.exportChoice.getEnabledOptions().eq(0)
        this.exportChoice.setValue($option.attr("value"));
        this.contextData = data;
	}
	setStateWorking() {
        this.node.find(".dropzone-panel").addClass("hidden");
        this.node.find(".close-button").addClass("hidden");
        this.node.find(".spinner-panel").removeClass("hidden");
	}
	setStateError(message) {
        this.node.find(".error-feedback-pane .error-txt").text(message);
        this.node.find(".error-feedback-pane").removeClass("hidden");
        this.node.find(".close-button").removeClass("hidden");
        this.node.find(".spinner-panel").addClass("hidden");
	}
	show() {
        var selectedCorpus = prospero.get(projectView.corporaTable.getSelection(), true);
        selectedCorpus = $.map(selectedCorpus, function(elt) {return elt.identity});
        var selectedTexts = prospero.get(projectView.textTable.getSelection(), true);
        selectedTexts = $.map(selectedTexts, function(elt) {return elt.identity});
        var selectedDictionaries = prospero.get(projectView.dicoTable.getSelection(), true);
        selectedDictionaries = $.map(selectedDictionaries, function(elt) {return elt.identity});
        var data = {
            onlyCorpusTexts : selectedCorpus.length ? selectedCorpus : null,
            onlySelectedTexts : selectedTexts.length ? selectedTexts : null,
            onlySelectedDictionaries : selectedDictionaries.length ? selectedDictionaries : null
        }
        this.setStateReady(data);
	    super.show();
	}
}