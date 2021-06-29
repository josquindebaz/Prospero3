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