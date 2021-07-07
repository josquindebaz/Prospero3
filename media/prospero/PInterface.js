class PInterface {

	constructor() {
	    this.pageData = $("body").data("page-data");
	    this.setCurrentProjectId(this.pageData.currentProjectId);
	}
	getPageData() {
	    return this.pageData;
	}
	setCurrentProjectId(projectId) {
	    var $sideBarLink = $(".side_container .sidebar-link-project");
	    if (projectId == "") {
	        $sideBarLink.bind("click", function() {
	            modals.openInfo("You should first select a project")
	        });
	    } else {
            $sideBarLink.unbind("click");
            $sideBarLink.attr("href", $sideBarLink.attr("base-href")+projectId);
	    }
	    this.pageData.currentProjectId = projectId;
	}
}
