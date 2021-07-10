$.fn.extend({
    replaceTag: function (newTagObj, keepProps) {
        var currentElem = this[0];
        var i, $newTag = $(newTagObj).clone();
        if (keepProps) {//{{{
            newTag = $newTag[0];
            newTag.className = currentElem.className;
            $.each(currentElem.attributes, function() {
                newTag.setAttribute(this.name, this.value);
            });
            //$.extend(newTag.classList, currentElem.classList);
            //$.extend(newTag.attributes, currentElem.attributes);
        }//}}}
        this.css("display", "none");
        $newTag.html(this.html());
        $newTag.insertAfter(this);
        this.remove();
        //this.wrapAll($newTag);
        //this.contents().unwrap();
        return $newTag;
    }
});