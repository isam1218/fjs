namespace("fjs.db");
/**
 * @interface
 */
fjs.db.IDBProvider = function() {
};

/**
 * Opens storage
 * @param {String} name
 * @param {Number} version
 */
fjs.db.IDBProvider.prototype.open = function(name, version) {
};
/**
 * Checks if you can use this storage
 * @param {window} globalObj
 * @returns {boolean}
 */
fjs.db.IDBProvider.check = function(globalObj) {
    return false;
};