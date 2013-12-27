namespace("fjs.db");

/**
 * @param {window} globalObject
 * @interface
 */
fjs.db.IDBProvider = function(globalObject) {

};

/**
 * Opens storage
 * @param {string} name
 * @param {number} version
 * @param {function} callback
 */
fjs.db.IDBProvider.prototype.open = function(name, version, callback) {

};

/**
 * Checks if you can use this storage
 * @param {window} globalObj
 * @returns {boolean}
 */
fjs.db.IDBProvider.check = function(globalObj) {
    return false;
};

/**
 * @param {string} name
 * @param {string} key
 * @param {Array} indexes
 * @protected
 */
fjs.db.IDBProvider.prototype.createTable = function(name, key, indexes) {

};

/**
 * @param {string} name
 * @param {string} key
 * @param {Array} indexes
 */
fjs.db.IDBProvider.prototype.declareTable = function(name, key, indexes) {

};

/**
* @param {string} tableName
* @param {*} item
* @param {Function} callback
*/
fjs.db.IDBProvider.prototype.insertOne = function(tableName, item, callback) {

};

/**
 * @param {string} tableName
 * @param {Array} items
 * @param {Function} callback
 */
fjs.db.IDBProvider.prototype.insertArray = function(tableName, items, callback) {

};

/**
* @param {string} tableName
* @param {string} key
* @param {Function} callback
*/
fjs.db.IDBProvider.prototype.deleteByKey = function(tableName, key, callback) {

};
/**
 * @param {string} tableName
 * @param {*} rules
 * @param {Function} callback
 */
fjs.db.IDBProvider.prototype.deleteByIndex = function(tableName, rules, callback) {

};

/**
 * @param {string} tableName
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.IDBProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {

};
/**
 *
 * @param {string} tableName
 * @param {*} rules Map key->value
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.IDBProvider.prototype.selectByIndex = function(tableName, rules, itemCallback, allCallback) {

};



/**
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
 */
fjs.db.IDBProvider.prototype.selectByKey = function(tableName, key, callback) {

};

/**
 * @param {Function} callback
 */
fjs.db.IDBProvider.prototype.clear = function(callback) {

};
