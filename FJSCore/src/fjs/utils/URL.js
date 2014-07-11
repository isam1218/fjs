namespace("fjs.utils");
/**
 * Helper static class to facilitate work with URL-strings and location
 * @constructor
 * @static
 */
fjs.utils.URL = function() {

};
/**
 * Returns origin of current page.
 * @returns {string}
 */
fjs.utils.URL.getOrigin = function() {
    return window.location.origin ||  (location.protocol+"//"+location.host + (/:/.test(location.host) ? '' : (location.port ? ":" + location.port : "")));
};
/**
 * Returns the file extension or '' by URL
 * @param {string} url - URL string
 * @returns {string}
 */
fjs.utils.URL.getFileExtension = function(url) {
    var _ext = /\.\w+($|\/$)/.exec(url);
    if(_ext != null)
    return (_ext.length > 0) ? _ext[0] : "";
    return "";
};

/**
 * Returns the file name or '' by URL
 * @param {string} url - URL string
 * @returns {string}
 */
fjs.utils.URL.getFileName = function(url) {
    return (url.lastIndexOf('/') != -1) ? url.substring(url.lastIndexOf('/') + 1).trim() : url.substring(
            url.lastIndexOf('\\') + 1).trim();
};


/**
 * Returns absolute url by relative
 * @param {string} href - Relative url
 * @returns {string}
 */
fjs.utils.URL.getAbsoluteURL = function(href) {
    var wrapperEl = document.createElement("div");
    wrapperEl.innerHTML = "<a href=\"" + encodeURI(href) + "\">x</a>";
    return wrapperEl.firstChild.href;
};



