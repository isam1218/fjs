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