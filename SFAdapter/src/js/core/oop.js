/**
 * Inheritance function
 * @param superClass
 */
Function.prototype.extends = function(superClass) {
    var F = new Function();
    F.prototype = superClass.prototype;
    this.prototype = new F();
    this.prototype.constructor = this;
    this.prototype.superClass = superClass.prototype;
};
/**
 *
 * @param {string} [ns_name]
 * @returns {*|{}}
 */
var namespace = function(ns_name) {
    var parts = ns_name.split(".");
    var ns = window[parts[0]] = window[parts[0]] || {};
    for ( var i = 1; i < parts.length; i++) {
        var p = parts[i];
        ns = ns[p] = ns[p] || {};
    }
    return ns;
};