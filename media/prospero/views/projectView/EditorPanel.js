class EditorPanel extends SwitchPanel {

	constructor($node, view) {
	    super($node, view);
	    this.addPanel("textEditor", new TextEditor(this.node.find(".text-editor"), view));
	    this.addPanel("corpusEditor", new CorpusEditor(this.node.find(".corpus-editor"), view));
	    this.addPanel("textSelectionsEditor", new TextSelectionsEditor(this.node.find(".text-selections-editor"), view));
	}
}