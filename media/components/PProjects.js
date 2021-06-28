class PProjects extends PObject {

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
class PProjectListView extends PObject {

	constructor($node, view) {
	    super($node);
	    var self = this;
	    self.view = view;
	    self.currentProject = null;
	    self.node.find(".list-projects tbody tr", self.node).each(function(index, value) {
	        self.initLine($(value));
	    });
	    $(".project-infos-container", self.node)
	    .mouseleave(
            function () {
                if ($("tr.active:hover").length == 0) {
                    self.closeInfos();
                }
            }
        );
	}
	initLine($line) {
	    var self = this;
	    new PDBObject($line);
	    $line.bind("click", function() {
	        if (!$line.hasClass("active")) {
                self.node.find(".list-projects tbody tr.active", self.node).removeClass("active");
                $line.addClass("active");
                var project = prospero.get($line);
                self.openInfos(project);
	        }
	    });
        $line
        .mouseenter(
            function () {
                if ($line.hasClass("active"))
                    self.openInfos();
            }
        ).mouseleave(
            function () {
                if ($line.hasClass("active") && $(".project-infos-container:hover").length == 0) {
                    self.closeInfos();
                }
            }
        );
	    $line.bind("dblclick", function() {
	        urls.navigate($line.attr("href"));
	    });
	}
	closeInfos() {
	    $(".project-infos-container", self.node).removeClass("visible")
	}
	openInfos(project) {
	    var self = this;
	    var $projectInfosContainer = $(".project-infos-container", self.node);
	    if (project && self.currentProject != project) {
            self.currentProject = project;
            prospero.ajax("renderProjectInfos", self.currentProject.identity, function(data) {
                $projectInfosContainer.empty();
                var $projectInfos = $(data.html);
                $projectInfosContainer.append($projectInfos);
                var projectInfos = new PDBObject($projectInfos);
                $projectInfosContainer.addClass("visible");
            });
	    } else
	        $projectInfosContainer.addClass("visible");
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