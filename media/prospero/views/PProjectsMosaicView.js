class PProjectsMosaicView extends PObject {

	constructor() {
	    super($("body"));
	    var self = this;
	    self.node.find(".project-card.add-project-card").bind("click", function() {
            var modalLock = modals.openNewProject();
            prospero.wait(modalLock, function() {
                if (modalLock.data.action == "create") {
                    urls.navigate(modalLock.data.projectUrl);
                }
            });
	    });
	    self.initProjectItems();
	    self.bindSearch();
	    self.bindSort();
	    self.bindScroll($(".main_content", self.node));
	    self.pagination = self.node.data("pagination");
	    //self.clearPagination();
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
	    self.currentProject = prospero.get(self.node.find(".project-card.active"));
	    if (self.currentProject)
	        self.initProjectInfos(self.node.find(".project-infos"));
	    return this;
	}
	initProjectInfos($projectInfos) {
        this.projectInfos = new PProjectPanel($projectInfos, this);
	}
	clearPagination() {
	    this.pagination = {
            frameSize : 30,
            page : 0,
            end : false
        };
	}
	initProjectItems() {
	    var self = this;
	    self.node.find(".project-card:not(.add-project-card):not(.ready)").each(function(index, value) {
	        var $bubble = $(value);
            new PDBObject($bubble);
            $bubble.bind("click", function() {
                if (!$bubble.hasClass(".active")) {
                    self.node.find(".project-card:not(.add-project-card)").removeClass("active");
                    $bubble.addClass("active");
                    self.setCurrentProject(prospero.get($bubble));
                }
            });
            $bubble.bind("dblclick", function() {
                urls.navigate($bubble.attr("href"));
            });
            $bubble.addClass("ready");
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
	        var renderData = {
	            pagination : self.pagination,
                viewData : self.data,
                renderType : "mosaic"
	        }
            prospero.ajax("searchInProjects", renderData, function(data) {
                var $projects = prospero.nodes(data.html);
                self.node.find(".project-card:not(.add-project-card)").remove();
                self.node.find(".mosaique_wrapper").append($projects);
                self.initProjectItems();
                self.pagination = data.pagination;
            });
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
	        var renderData = {
	            pagination : self.pagination,
                viewData : self.data,
                renderType : "mosaic"
	        }
            prospero.ajax("searchInProjects", renderData, function(data) {
                var $projects = prospero.nodes(data.html);
                self.node.find(".project-card:not(.add-project-card)").remove();
                self.node.find(".mosaique_wrapper").append($projects);
                self.initProjectItems();
                self.pagination = data.pagination;
            });
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
                console.log("LOAD !!");
                var renderData = {
                    pagination : self.pagination,
                    viewData : self.data,
                    renderType : "mosaic"
                }
                prospero.ajax("searchInProjects", renderData, function(data) {
                    var $projects = prospero.nodes(data.html);
                    self.node.find(".mosaique_wrapper").append($projects);
                    self.initProjectItems();
                    self.pagination = data.pagination;
                    self.isLoadingItems = false;
                });
            }
        });
	}
	setCurrentProject(project) {
	    var self = this;
	    self.currentProject = project;
	    prospero.interface.setCurrentProjectId(project.identity.id);
	    self.loadProjectInfos(true);
	}
	loadProjectInfos(setCurrentProject) {
	    var self = this;
	    var renderData = {
	        project: self.currentProject.identity,
	        setCurrentProject: setCurrentProject == true
	    }
        prospero.ajax("renderProjectInfos", renderData, function(data) {
            prospero.interface.setUserData(data.userData);
            var $projectInfosContainer = $(".project-infos-container");
            var $projectInfos = prospero.nodes(data.html);
            $projectInfosContainer.empty();
            $projectInfosContainer.append($projectInfos);
            self.initProjectInfos($projectInfos);
        });
	}
	load(data) {
        var self = this;
        var lock = $.Deferred();
        var $tbody = $("tbody", self.node);
        if (this.data) {
            this.data.property = this.propertyName;
            prospero.ajax("serializeTable", this.data, function(data) {
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