class UrlUtils {
    
    buildUrlFromLocation() {
        var search = window.location.search;
        if (search.length > 0)
            search = search.substring(1);
        return new Url(window.location.origin, window.location.pathname, search);
    }
    changeCurrentUrl(url, pushHistory) {
        if (!pushHistory && window.history.replaceState) {
           //prevents browser from storing history with each change:
            window.history.replaceState(null, "", url.buildRelative());
        } else if (window.history.pushState) {
            window.history.pushState(null, "", url.buildRelative());
        }
    }
    reload() {
        window.location.reload();
    }
    navigate(url) {
        var $link = $("body a.url_navigate");
        if ($link.length == 0) {
            $link = $('<a class="url_navigate" style="display:none;"></a>');
            $("body").append($link);
        }
        $link.attr("href", url);
        $link[0].click();
    }
    download(url) {
        var segments = url.split("/");
        var fileName = segments[segments.length-1]
        var $link = $("body a.url_download");
        if ($link.length == 0) {
            $link = $('<a download="'+fileName+'" class="url_download" style="display:none;"></a>');
            $("body").append($link);
        }
        $link.attr("href", url);
        $link[0].click();
    }
}
class Url {

    constructor(origin, pathname, search) {
        this.origin = origin;
        this.pathname = pathname;
        this.search = search;
    }
    build() {
        return this.origin + this.buildRelative();
    }
    buildRelative() {
        var res = this.pathname;
        if (this.search)
            res = res + "?" + this.search;
        return res;
    }    
    setSearchFromObject(object) {
        var values = [];
        for (var key in object) {
            var value = object[key];
            if (value != null)
                values.push(key + "=" + encodeURIComponent(value));
        }        
        if (values.length > 0)
            this.search = values.join("&");
    }
    setSearchAsSerializedJson(object) {
        this.search = JSON.stringify(object);
        this.search = encodeURIComponent(this.search);        
    }
}
