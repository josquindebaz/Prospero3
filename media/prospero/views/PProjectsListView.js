class PProjectsListView extends PObject {

	constructor($node, view) {
	    super($("body"));
	    var self = this;
	    self.view = view;
	    self.currentProject = null;
	    self.initLines();
	    self.initInfosModal();
	    self.bindSearch();
	    self.bindSort();
	    self.bindScroll($(".main_content", self.node));
	    self.pagination = self.node.data("pagination");
        self.setData(prospero.interface.getPageData());
	}
	setData(data) {
	    var self = this;
	    self.data = data;
	    if (data.search)
	        self.node.find(".search_form .search_input").val(data.search);
	    if (data.currentProjectId != null) {
	        var project = prospero.getPDBObject({model:"Project", id:data.currentProjectId})
	        if (project) {
	            self.currentProject = project;
	            project.node.addClass("active");
	        }
	    }
	    self.currentProject = prospero.get(self.node.find(".list-projects tr.active"));
	    if (self.currentProject)
	        self.initProjectInfos(self.node.find(".project-infos"));
	    return this;
	}
	clearPagination() {
	    this.pagination = {
            frameSize : 30,
            page : 0,
            end : false
        };
	}
	initProjectInfos($projectInfos) {
        this.projectInfos = new PProjectPanel($projectInfos, this);
	}
	initInfosModal() {
	    var self = this;
	    $(".project-infos-container", self.node)
	    .mouseleave(
            function () {
                if ($("tr.active:hover").length == 0) {
                    self.closeInfos();
                }
            }
        );
	}
	initLines() {
	    var self = this;
	    self.node.find(".list-projects tbody tr:not(.ready)", self.node).each(function(index, value) {
	        var $line = $(value);
            new PDBObject($line);
            $line.bind("click", function() {
                if (!$line.hasClass("active")) {
                    self.node.find(".list-projects tbody tr.active", self.node).removeClass("active");
                    $line.addClass("active");
                    var project = prospero.get($line);
                    prospero.interface.setCurrentProjectId(project.identity.id);
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
            $line.addClass("ready");
	    });
	}
	loadLines(clearLines) {
        var self = this;
        var renderData = {
            pagination : self.pagination,
            viewData : self.data,
            renderType : "list"
        }
        prospero.ajax("searchInProjects", renderData, function(data) {
            var $projects = prospero.nodes(data.html);
            if (clearLines)
                self.node.find(".list_wrapper").empty();
            self.node.find(".list_wrapper").append($projects);
            self.initLines();
            self.pagination = data.pagination;
            self.isLoadingItems = false;
        });
	}
	bindSort() {
        var self = this;
        self.sortChoice = new PRadioInput($(".project-sorting", self.node));
        self.sortChoice.addObserver(function(event) {
            var $input = $(event.original.target);
            self.sortChoice.node.find(".sort_item").removeClass("active");
            $input.closest(".sort_item").addClass("active");
            console.log("change", $input.data("value"));
	        self.data.sort = $input.data("value");
	        self.clearPagination();
	        self.loadLines(true);
        })
	}
	bindSearch() {
	    var self = this;
	    self.node.find(".search_form .btn").bind("click", function(event) {
	        event.preventDefault();
	        var $text = self.node.find(".search_form .search_input");
	        console.log("search", );
	        self.data.search = $text.val().trim();
	        self.clearPagination();
	        self.loadLines(true);
	    });
	}
	bindScroll($scrolled) {
        var self = this;
        self.isLoadingItems = false;
        $scrolled[0].addEventListener('scroll', function(event) {
            var element = event.target;
            var scrollRate = (element.scrollTop + element.clientHeight) /element.scrollHeight;
            if (!self.isLoadingItems && !self.pagination.end && scrollRate > 0.8) {
                self.isLoadingItems = true;
                self.loadLines(false);
            }
        });
	}
	closeInfos() {
	    $(".project-infos-container", self.node).removeClass("visible")
	}
	openInfos(project) {
	    var self = this;
	    if (project && self.currentProject != project) {
            self.currentProject = project;
            self.loadProjectInfos(true, function() {
                self.showModalInfos();
            });
            /*
            var renderData = {
                project: self.currentProject.identity,
                setCurrentProject: true
            }
            prospero.ajax("renderProjectInfos", renderData, function(data) {
                prospero.interface.setUserData(data.userData);
                var $projectInfosContainer = $(".project-infos-container", self.node);
                var $projectInfos = prospero.nodes(data.html);
                $projectInfosContainer.empty();
                $projectInfosContainer.append($projectInfos);
                self.initProjectInfos($projectInfos);
                self.showModalInfos();
            });
            */
	    } else
	        self.showModalInfos();
	}
	loadProjectInfos(setCurrentProject, callback) {
	    var self = this;
	    var renderData = {
	        project: self.currentProject.identity,
	        setCurrentProject: setCurrentProject == true
	    }
        prospero.ajax("renderProjectInfos", renderData, function(data) {
            prospero.interface.setUserData(data.userData);
            var $projectInfosContainer = $(".project-infos-container", self.node);
            var $projectInfos = prospero.nodes(data.html);
            $projectInfosContainer.empty();
            $projectInfosContainer.append($projectInfos);
            self.initProjectInfos($projectInfos);
            if (callback)
                callback();
        });
	}
	showModalInfos() {
        var self = this;
        var $modal = self.node.find(".listing_modale_wrapper");
        if (self.defaultModalTop == null)
            self.defaultModalTop = parseInt($modal.css("top").split("px")[0]);
        else
            $modal.css("top", self.defaultModalTop+"px");
        //$modal[0].top = self.defaultModalTop;
        var lineBound = self.node.find(".list-projects tbody tr.active")[0].getBoundingClientRect();
        var modalBound = $modal[0].getBoundingClientRect();
        console.log("lineBound", lineBound);
        console.log("modalBound", modalBound);
        var positionOk = modalBound.top < lineBound.y && lineBound.y < modalBound.bottom;
        if (!positionOk) {
            var diff = lineBound.bottom - modalBound.bottom - 10;
            $modal.css("top", self.defaultModalTop + diff + "px");
            console.log("change position", $modal[0].top + diff);
        }
	    var $projectInfosContainer = $(".project-infos-container", self.node);
	    $projectInfosContainer.addClass("visible");
	}
}