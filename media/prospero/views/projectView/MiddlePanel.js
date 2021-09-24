class MiddlePanel extends SwitchPanel {

	constructor($node, view) {
	    super($node, view);
	    this.addPanel("dicoEditor", new DicoEditor(this.node.find(".dico1-panel"), view));
	    this.addPanel("textTable", new TextTable(this.node.find(".text-table"), view));
	}
}