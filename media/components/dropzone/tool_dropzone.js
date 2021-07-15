/*****************************
 * file uploader for magicCms
 * @author BROTTIER Erwan - erwan@addictive-web.com - http://www.addictive-web.com 
 * @version 1.1
 * @date October 10, 2016
 * @category framework
 * @copyright (c) 2011-2015 contact@addictive-web.com (www.addictive-web.com)
 * @license CC Attribution-Share Alike 3.0 - http://creativecommons.org/licenses/by-sa/3.0/
 */

class McDropzone {

    
    /*
    parameters :
    {
        fileExtensions : "gif, PNG",
        fileChange : function(dropzone, file, loadEvent) {},
        enterExit : function(dropzone, isHover) {},
        badFile : function(dropzone, file) {}
    }
    */
    constructor($container, parameters) {
        var self = this;
        self.node = $container;
        Object.assign(self, parameters);        
        if (self.fileExtensions != null)
            self.fileExtensions = self.computeExtensions(self.fileExtensions);
		self.isHover = false;
		self.init();
	}
	hoverChange(hover) {
	    if (this.enterExit && this.isHover != hover) {
	        this.isHover = hover;
	        this.enterExit(this, this.isHover);
	    }
	}
    init() {
        var self = this;
        var position = self.node.css("position");
        if (position == "static")
            self.node.css("position", "relative");
        var acceptFiles = "*"; /*image/*";*/
        if (self.fileExtensions) {
            acceptFiles = "";
            $.each(self.fileExtensions, function(index, value) {
                acceptFiles = acceptFiles + "." + value+",";
            })
        }
        var $overlay = $('<div class="mc-dropzone"><input type="file" accept="'+acceptFiles+'" title=" " /></div>');
        self.node.append($overlay);
        var overlay = $overlay[0];
        
		var $fileInput = $overlay.find("input");
		overlay.addEventListener(
		    "dragover",
		    function (e) {
    		    self.hoverChange(true);
    		    e.preventDefault();
    		    e.stopPropagation();
    			var dleft = $overlay.offset().left;
    			var dright = $overlay.outerWidth() + dleft;
    			var dtop = $overlay.offset().top;
    			var dbottom = $overlay.outerHeight() + dtop;
    		    var x = e.pageX;
    		    var y = e.pageY;		    
    		    if (!(x < dleft || x > dright || y < dtop || y > dbottom)) {
    		        $fileInput.offset({ top: y - ($fileInput.outerHeight())/2, left: x - 20 });
    		    } else {
    		        $fileInput.offset({ top: -400, left: -400 });
    		    }		
    	    }, 
    	    true
    	);
		overlay.addEventListener(
		    "dragleave", 
		    function (e) {
    		    self.hoverChange(false);
    		    e.preventDefault();
    		    e.stopPropagation();
	        }, 
	        true
	    );
	    // does not work properly
		/*overlay.addEventListener("dragenter",function (e) {self.hoverChange(true);e.preventDefault();e.stopPropagation();},true);*/
	    overlay.addEventListener(
	        "drop", 
	        function (e) {
	        }, 
	        true
	    );			
	    $overlay.mousemove(function (e) {
		    var dleft = $overlay.offset().left;
		    var dright = $overlay.outerWidth() + dleft;
		    var dtop = $overlay.offset().top;
		    var dbottom = $overlay.outerHeight() + dtop;
	        var x = e.pageX;
	        var y = e.pageY;
	        if (!(x < dleft || x > dright || y < dtop || y > dbottom)) {
	            $fileInput.offset({ top: y - ($fileInput.outerHeight())/2, left: x - 20 });
	        } else {
	            $fileInput.offset({ top: -400, left: -400 });
	        }
	    });
	    if (self.enterExit) {
            $overlay
            .mouseenter(
                function (event) {
                    self.hoverChange(true);
                }
            )
            .mouseleave(
                function (event) {
                    self.hoverChange(false);
                }
            );	    
	    }
		// change event (file has been dropped)
	    $fileInput[0].addEventListener('change', function (e) {
	    	var input = $fileInput[0];
	    	var files = input.files;
	    	if (files.length > 0) {// On part du principe qu'il n'y qu'un seul fichier étant donné que l'on a pas renseigné l'attribut "multiple"
		    	var file = files[0];
		    	if (self.checkExtension(file.name)) {
    		        if (self.fileChange) {
    		        	var reader = new FileReader();				
    		        	reader.onload = function (loadEvent) {
    		        		self.fileChange(self, file, loadEvent);
                            input.value="";
    		        	}
    		        	reader.readAsDataURL(file);
    		        }
		    	} else if (self.badFile) {
		    	    self.badFile(self, file);
		    	}
	    	}
	    });
    }
    computeExtensions(value) {
        if (value) {
            var tab = [];
            $.each(value.split(","), function(index, value) {
                value = value.trim().toLowerCase();
                tab.push(value);
            })
            return tab;
        }
        return null;
    }
    checkExtension(fileName) {
        var self = this;
        if (self.fileExtensions == null)
            return true;
        else {
            var tab = fileName.split(".");
            if (tab.length == 1 && _.contains(self.fileExtensions, ""))
                return true;
            else if (tab.length > 1 && _.contains(self.fileExtensions, tab[tab.length - 1].trim().toLowerCase()))
                return true;
            return false;
        }
    }
}