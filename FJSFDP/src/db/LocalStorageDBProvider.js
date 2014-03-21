namespace("fjs.db");
/**
 * @interface
 * @implements fjs.db.IDBProvider
 */
fjs.db.LocalStorageDbProvider = function() {
};

/**
 * Opens connection to storage
 * @param {string} name
 * @param {number} version
 * @param {function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.open = function(name, version, callback) {

};

/**
 * Returns true if you can use localStorage in this browser
 * @returns {boolean}
 */
fjs.db.LocalStorageDbProvider.check = function() {
    return !!self.localStorage;
};

/**
 * Creates table (protected)
 * @param {string} name
 * @param {string} key
 * @param {Array} indexes
 * @protected
 */
fjs.db.LocalStorageDbProvider.prototype.createTable = function(name, key, indexes) {

};

/**
 * Declare table for creation (table will be created after only after Db version change)
 * @param {string} name
 * @param {string} key
 * @param {Array} indexes
 */
fjs.db.LocalStorageDbProvider.prototype.declareTable = function(name, key, indexes) {

};

/**
 * Inserts one row
 * @param {string} tableName
 * @param {*} item
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.insertOne = function(tableName, item, callback) {

};

/**
 * Inserts array of rows
 * @param {string} tableName
 * @param {Array} items
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.insertArray = function(tableName, items, callback) {

};

/**
 * Deletes row by primary key
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.deleteByKey = function(tableName, key, callback) {

};

/**
 * Returns all rows from table
 * @param {string} tableName
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.LocalStorageDbProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {

};

/**
 * Returns rows by index
 * @param {string} tableName
 * @param {*} rule Map key->value
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.LocalStorageDbProvider.prototype.selectByIndex = function(tableName, rule, itemCallback, allCallback) {

};

/**
 * Returns row by primary key
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.selectByKey = function(tableName, key, callback) {

};

/**
 * Clears database (drops all tables)
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.clear = function(callback) {

};

/**
 * Deletes row by index
 * @param {string} tableName
 * @param {*} rules
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.deleteByIndex = function(tableName, rules, callback) {

};
