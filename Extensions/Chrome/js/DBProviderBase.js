/**
 * Created by vovchuk on 10/29/13.
 */

namespace("fjs.db");
/**
 * @constructor
 */
fjs.db.DBProviderBase = function() {

};

/**
 * Opens storage
 * @param {String} name
 * @param {Number} version
 */
fjs.db.DBProviderBase.prototype.open = function(name, version) {
    new Error("need override");
};
/**
 * Checks if you can use this storage
 * @param {window} globalObj
 * @returns {boolean}
 */
fjs.db.DBProviderBase.check = function(globalObj) {
    new Error("need override");
    return false;
};