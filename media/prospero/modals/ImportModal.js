class ImportModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
	    var fileExtensions = "dic, col, fic, cat, txt, ctx,  zip";
		new McDropzone(
			this.node.find(".dropzone-panel"),
			{
				multiple: true,
				fileExtensions : fileExtensions,
				fileChange : function(dropzone, files, loadEvent) {
				    $(".error-feedback-pane").addClass("hidden");
				    self.setStateWorking();
					var formData = new FormData();
					$.each(files, function(index, file) {
                        formData.append('file'+index, file, file.name);
					});
					prospero.uploadFile(formData, function(uploadDone, data) {
						if (uploadDone) {
                            prospero.ajax(
                                "importData",
                                {
									files : data.files,
									project : prospero.get($(".project-view")).data,
									corpus : self.corpus ? self.corpus.identity : null
								},
                                function(data) {
                                    if (!data.serverError) {
                                        self.hide({action: "import"});
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
					$(".error-feedback-pane .error-txt").text("file "+file.name+" is not supported by the import process. Accepted extensions are : "+fileExtensions);
					$(".error-feedback-pane").removeClass("hidden");
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
	show(corpus) {
	    this.setStateReady();
        var txtCorpus = 'Corpus "main" will be created if some texts are imported';
        if (corpus != null)
            txtCorpus = 'Imported texts will be added to the following corpus : "'+corpus.data.name+'"';
        var $txtCorpus = $(".txt-corpus", this.node);
        $txtCorpus.text(txtCorpus);
        this.corpus = corpus;
	    super.show();
	}
}