/**
 * Inheritance function
 * @param {Function} superClass super class constructor
 */
Function.prototype.extend = function(superClass) {
    var F = new Function();
    F.prototype = superClass.prototype;
    this.prototype = new F();
    this.prototype.constructor = this;
    this.prototype.superClass = superClass.prototype;
    for( var i = 1; i < arguments.length; ++i )
    {
        var parent = arguments[i];
        for (var prop in parent.prototype)
        {
            if (!this.prototype[prop]) this.prototype[prop] = parent.prototype[prop];
        }
        this.prototype[parent.prototype['__class_name']] = parent.prototype;
    }

};

/**
 * Creates and returns namespace
 * @param {string} ns_name namespace string
 * @returns {Object}
 */
var namespace = function(ns_name) {
    var parts = ns_name.split(".");

    var ns = self[parts[0]] = self[parts[0]] || {};
    for ( var i = 1; i < parts.length; i++) {
        var p = parts[i];
        ns = ns[p] = ns[p] || {};
    }
    return ns;
};
