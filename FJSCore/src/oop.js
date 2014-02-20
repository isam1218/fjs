/**
 * Inheritance function
 * @param {function} superClass super class constructor
 */
Function.prototype.extend = function(superClass) {
    var F = new Function();
    F.prototype = superClass.prototype;
    this.prototype = new F();
    this.prototype.constructor = this;
    this.prototype.superClass = superClass.prototype;
};

Function.prototype.multiple_extend = function(superClassName) {
    var superClass = namespace(superClassName);
    var F = new Function();
    F.prototype = superClass.prototype;
    var parentPrototype = new F();

    for(var prop in parentPrototype) {
        if(!this.prototype[prop]) {
            this.prototype[prop] = parentPrototype[prop];
        }
    }
    this.prototype[superClassName] = superClass.prototype;
    this.prototype.constructor = this;
    //this.prototype.super[superClassName] = superClass.prototype;
};

Function.prototype.multiple_extend2 = function(superClassNames) {
    var superClass;
    for(var i=0; i<superClassNames.length; i++) {
        var _class = namespace(superClassNames[i]);
        var F = new Function();
        F.prototype = _class.prototype;
        if(superClass) {
            var _prototype = superClass.prototype;
            superClass.prototype = new F();
            for(var prop in _prototype) {
                superClass.prototype[prop] = _prototype[prop];
            }
        }
        superClass = F;
        superClass.prototype.constructor = _class;
    }
    this.prototype = new superClass();
    this.prototype.constructor = this;
    this.prototype.superClass = superClass.prototype;
};

/**
 * Creates namespace
 * @param {string} ns_name namespace;
 * @returns {*|{}}
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
