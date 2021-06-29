class PProjectMosaicView extends PObject {

	constructor($node, view) {
	    super($node);
	    var self = this;
	    self.view = view;
	    self.node.find(".project-card.add-project-card").bind("click", function() {
	        newProjectModal.show();
	    });
	    self.node.find(".project-card:not(.add-project-card)").each(function(index, value) {
	        self.initBubble($(value));
	    });
	    self.currentProject = null;
	    self.promptedProject = null;
	    self.timer = new CallbackTimer(this, 1000, function() {
	        if (self.currentProject) {
                self.promptedProject = self.currentProject;
                console.log("load !", self.currentProject);
                prospero.ajax("renderProjectInfos", self.currentProject.identity, function(data) {
                    var $projectInfosContainer = $(".project-infos-container");
                    $projectInfosContainer.empty();
                    var $projectInfos = $(data.html);
                    $projectInfosContainer.append($projectInfos);
                    var projectInfos = new PDBObject($projectInfos);
                    $projectInfos.find("[action-name=delete-project]").bind("click", function() {
                        approvalModal.show({
                            title: "Confirmation",
                            text: "Do you really want to delete this project ?",
                            callback : function() {
                                prospero.ajax("deleteObject", projectInfos.identity, function(data) {
                                    console.log("delete project", projectInfos.identity);
                                    self.promptedProject.node.remove();
                                    approvalModal.hide();

                                });
                            }
                        });
                    });
                });
	        }
	    })
	}
	initBubble($bubble) {
	    var self = this;
	    new PDBObject($bubble);
	    $bubble
        .mouseenter(
            function () {
                console.log("on", $bubble)
                self.timer.trigger();
                self.currentProject = prospero.get($bubble);
            }
        ).mouseleave(
            function () {
                console.log("off", $bubble)
                self.timer.trigger();
                self.currentProject = null;
            }
        );
	}
	load(data) {
        var self = this;
        var lock = $.Deferred();
        var $tbody = $("tbody", self.node);
        if (data) {
            this.data = data;
            this.data.property = this.propertyName;
            prospero.ajax("renderTable", this.data, function(data) {
                $tbody.empty();
                $.each(data.table, function(index, line) {
                    var $tr = $("<tr></tr>");
                    $tbody.append($tr);
                    var item = self.createTableItem($tr, line.identity, self.columns);
                    item.load(line.values);
                    item.addObserver(function(event) {
                        self.receiveEvent(event);
                    });
                });
                lock.resolve();
            });
        } else {
            $tbody.empty();
            lock.resolve();
        }
        return lock;
	}
}