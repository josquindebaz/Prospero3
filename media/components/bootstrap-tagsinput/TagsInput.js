class TagsInput extends Tags {

    constructor($node, existingTags, tagsManager, objectIdentity, allowNew, changeCallback) {
        super($node[0], tagsManager, allowNew==true);
        var self = this;
        self.changeCallback = changeCallback;
        self.node = $node;
        self.objectIdentity = objectIdentity;
        $.each(existingTags, function(index, id) {
            self.addItemProg(self.tagsManager.tags[id], id, true);
        });
    }
    addItem(text, value, phantom) {
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
                    self.tagsManager.addTag(data.newTag.id, data.newTag.value);
                }
                self.changeCallback("valueSaved");
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
                    self.tagsManager.removeTag(value);
                    self.node.parent().find("ul.dropdown-menu li a[data-value="+value+"]").parent().remove();
                }
                self.changeCallback("valueSaved");
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