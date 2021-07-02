class PProjectsListView extends PObject {

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