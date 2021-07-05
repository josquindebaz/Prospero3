
class UserAutocomplete extends Autocomplete {

    constructor(field, options) {
        super(field, options);
    }
    doesItemContainsLookup(item, lookup) {
        lookup = lookup.toLowerCase();
        return this.doesContains(item.label, lookup)
            || this.doesContains(item.first_name, lookup)
            || this.doesContains(item.last_name, lookup);
    }
    doesContains(text, lookup) {
        return text.toLowerCase().indexOf(lookup) >= 0;
    }
    createItem(lookup, item) {
        lookup = lookup.toLowerCase();
        var username = (this.options.highlightTyped && this.doesContains(item.label, lookup)) ? this.buildHighlightText(lookup, item.label) : item.label;
        var first_name = (this.options.highlightTyped && this.doesContains(item.first_name, lookup)) ? this.buildHighlightText(lookup, item.first_name) : item.first_name;
        var last_name = (this.options.highlightTyped && this.doesContains(item.last_name, lookup)) ? this.buildHighlightText(lookup, item.last_name) : item.last_name;
        var $item = $('<div class="user-item dropdown-item" data-label="'+item.label+'" data-value="'+item.value+'"><div class="img_container"><img src="'+item.thumbnail+'" class="rounded-circle" alt=""></div><div class="txt_container"><div class="username">'+username+'</div><div class="first-and-last-name">'+first_name+' '+last_name+'</div></div></div>');
        //var $item = $('<button type="button" class="dropdown-item" data-label="'+item.label+'" data-value="'+item.value+'">'+label+'</button>')
        return $item[0];
        //return ce(`<button type="button" class="dropdown-item" data-label="${item.label}" data-value="${item.value}">${label}</button>`);
    }
    buildHighlightText(lookup, text) {
        var idx = text.toLowerCase().indexOf(lookup.toLowerCase());
        var className = Array.isArray(this.options.highlightClass) ? this.options.highlightClass.join(' ') : (typeof this.options.highlightClass == 'string' ? this.options.highlightClass : '');
        return text.substring(0, idx) + '<span class="'+className+'">'+text.substring(idx, idx + lookup.length)+'</span>' + text.substring(idx + lookup.length, text.length);
    }
}