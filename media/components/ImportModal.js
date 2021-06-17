class ImportModal extends PModal {

	constructor($node) {
	    super($node);
	    var self = this;
		new McDropzone(
			this.node.find(".dropzone-panel"),
			{
				fileExtensions : "dic, col, fic, cat, txt, zip",
				fileChange : function(dropzone, file, loadEvent) {
					self.node.find(".dropzone-panel").addClass("hidden");
					self.node.find(".close-button").addClass("hidden");
					self.node.find(".spinner-panel").removeClass("hidden");
					var formData = new FormData();
					formData.append('file', file, file.name);
					prospero.uploadFile(formData, function(uploadDone, data) {
						if (uploadDone) {
                            prospero.ajax(
                                "importData",
                                {
									filePath : data.filePath,
									project : prospero.get($(".project-view")).data
								},
                                function(data) {
                                    if (!data.serverError) {
									    self.hide();
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
}