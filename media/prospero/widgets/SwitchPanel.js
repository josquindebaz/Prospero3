class SwitchPanel extends PObject {

	constructor($node, view) {
	    super($node);
	    this.view = view;
	    this.panels = {};
	    this.currentPanel = null;
	}
	getPanel(name) {
	    return this.panels[name];
	}
	addPanel(name, panel) {
	    this.panels[name] = panel;
	}
	switchTo(name) {
	    var panel = this.panels[name];
	    if (this.currentPanel)
	        this.currentPanel.node.addClass("hidden");
	    this.currentPanel = panel;
	    if (this.currentPanel)
	        this.currentPanel.node.removeClass("hidden");
	}
}