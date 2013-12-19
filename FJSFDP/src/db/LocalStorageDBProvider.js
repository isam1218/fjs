namespace("fjs.db");
/**
 * @param {window} globalObject
 * @interface
 * @implements fjs.db.IDBProvider
 */
fjs.db.LocalStorageDbProvider = function(globalObject) {
    this.gloalObject = globalObject
};

/**
 * Opens storage
 * @param {string} name
 * @param {number} version
 * @param {function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.open = function(name, version, callback) {

};

/**
 * Checks if you can use this storage
 * @param {window} globalObj
 * @returns {boolean}
 */
fjs.db.LocalStorageDbProvider.check = function(globalObj) {
    return !!globalObj.localStorage;
};

/**
 * @param {string} name
 * @param {string} key
 * @param {Array} indexes
 * @protected
 */
fjs.db.LocalStorageDbProvider.prototype.createTable = function(name, key, indexes) {

};

/**
 *
 * @param {string} name
 * @param {string} key
 * @param {Array} indexes
 */
fjs.db.LocalStorageDbProvider.prototype.declareTable = function(name, key, indexes) {

};

/**
 * @param {string} tableName
 * @param {*} item
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.insertOne = function(tableName, item, callback) {

};

/**
 * @param {string} tableName
 * @param {Array} items
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.insertArray = function(tableName, items, callback) {

};

/**
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.deleteByKey = function(tableName, key, callback) {

};

/**
 * @param {string} tableName
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.LocalStorageDbProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {

};
/**
 *
 * @param {string} tableName
 * @param {{key:string, value:*}} rule
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.LocalStorageDbProvider.prototype.selectByIndex = function(tableName, rule, itemCallback, allCallback) {

};

/**
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.selectByKey = function(tableName, key, callback) {

};

/**
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.clear = function(callback) {

};
