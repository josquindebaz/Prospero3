class TagsInput extends Tags {

    constructor($node, existingTags, tagsManager, objectIdentity, allowNew) {
        super($node[0], tagsManager, allowNew==true);
        var self = this;
        self.objectIdentity = objectIdentity;
        $.each(existingTags, function(index, id) {
            self.addItemProg(self.tagsManager.tags[id], id, true);
        });
    }
    addItem(text, value, phantom) {
        console.log("add item", text, value);
        var self = this;
        var $item = super.addItem(text, value);
        $item.find(".remove").bind("click", function() {
            self.removeItemProg(value);
        });
        if (phantom != true) {
            var data = {
                identity: self.objectIdentity,
                id: value,
                value: text
            };
            prospero.ajax("addTag", data, function(data) {
                if (data.newTag) {
                    console.log("TODO> new tag in tagsManager");
                }
            });
        }
    }
    removeItem(value, phantom) {
        console.log("remove item", value);
        var self = this;
        super.removeItem(value);
        if (phantom != true) {
            var data = {
                identity: self.objectIdentity,
                id: value
            };
            prospero.ajax("removeTag", data, function(data) {
                if (data.deletedTag) {
                    console.log("TODO> delete tag in tagsManager");
                }
            });
        }
    }
    removeItemProg(value, phantom) {
        this.removeItem(value, phantom);
        this.adjustWidth();
    }
    addItemProg(text, value, phantom) {
        this.addItem(text, value, phantom);
        this.adjustWidth();
    }
    buildSuggestions() {
        var $select = $(this.selectElement).find("select");
        $.each(this.tagsManager.tags, function(id, value) {
            var $option = $('<option value="'+id+'">'+value+'</option>');
            $select.append($option);
        });
        super.buildSuggestions();

    }
}