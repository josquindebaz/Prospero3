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
                        self.hide({action: "export"});
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
	show(selectedCorpus, selectedTexts, selectedDictionaries) {
        selectedCorpus = $.map(selectedCorpus, function(elt) {return elt.identity});
        selectedTexts = $.map(selectedTexts, function(elt) {return elt.identity});
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