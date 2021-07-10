class PInterface {

	constructor() {
	    this.pageData = $("body").data("page-data");
	    this.userData = $("body").data("user-data");
	    this.setCurrentProjectId(this.pageData.currentProjectId);
	    this.connectPanel = new PConnectPanel($(".connection-panel"));
	}
	getPageData() {
	    return this.pageData;
	}
	getUserData() {
	    return this.userData;
	}
	setUserData(userData) {
	    this.userData = userData;
	}
	userIsOwner() {
	    return _.contains(this.userData.rights, "Owner");
	}
	userCanWrite() {
	    return _.contains(this.userData.rights, "Owner") || _.contains(this.userData.rights, "Write");
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
