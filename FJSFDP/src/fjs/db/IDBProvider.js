namespace("fjs.db");

/**
 * Data base provider interface
 * @interface
 */
fjs.db.IDBProvider = function() {
};

/**
 * Opens connection to storage
 * @param {string} name - database name
 * @param {number} version - database version
 * @param {function} callback - database ready event handler
 */
fjs.db.IDBProvider.prototype.open = function(name, version, callback) {

};

/**
 * Checks if you can use this storage
 * @returns {boolean}
 */
fjs.db.IDBProvider.check = function() {
    return false;
};

/**
 * Creates table
 * @param {string} name - table name
 * @param {string} key - table primary key
 * @param {Array} indexes - table indexes
 * @protected
 */
fjs.db.IDBProvider.prototype.createTable = function(name, key, indexes) {

};

/**
 * Declare table for creation (table will be created after only after Db version change)
 * @param {string} name - table name
 * @param {string} key - primary key
 * @param {Array} indexes - table indexes
 */
fjs.db.IDBProvider.prototype.declareTable = function(name, key, indexes) {

};

/**
 * Inserts one row
* @param {string} tableName - table name
* @param {*} item - item to insert
* @param {Function=} callback - handler function to execute when row added
*/
fjs.db.IDBProvider.prototype.insertOne = function(tableName, item, callback) {

};

/**
 * Inserts array of rows
 * @param {string} tableName - table name
 * @param {Array} items - array of items to insert
 * @param {Function} callback - handler function to execute when all rows added
 */
fjs.db.IDBProvider.prototype.insertArray = function(tableName, items, callback) {

};

/**
* Deletes row by primary key
* @param {string} tableName - table name
* @param {string} key - primary key
* @param {Function} callback - handler function to execute when row deleted
*/
fjs.db.IDBProvider.prototype.deleteByKey = function(tableName, key, callback) {

};

/**
 * Deletes row by index
 * @param {string} tableName - table name
 * @param {*} rules - map key->value
 * @param {Function} callback - handler function to execute when rows deleted
 */
fjs.db.IDBProvider.prototype.deleteByIndex = function(tableName, rules, callback) {

};

/**
 * Selects all rows from table
 * @param {string} tableName - table name
 * @param {Function} itemCallback - handler function to execute when one row selected
 * @param {function(Array)} allCallback - handler function to execute when all rows selected
 */
fjs.db.IDBProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {

};

/**
 * Selects rows by index
 * @param {string} tableName - table name
 * @param {*} rules - map key->value
 * @param {Function} itemCallback - handler function to execute when one row selected
 * @param {function(Array)} allCallback - handler function to execute when all rows selected
 */
fjs.db.IDBProvider.prototype.selectByIndex = function(tableName, rules, itemCallback, allCallback) {

};



/**
 * Selects row by primary key
 * @param {string} tableName - table name
 * @param {string} key - primary key
 * @param {Function} callback - handler function to execute when one row selected
 */
fjs.db.IDBProvider.prototype.selectByKey = function(tableName, key, callback) {

};

/**
 * Clears database (drops all tables)
 * @param {Function} callback - handler function to execute when all tables removed
 */
fjs.db.IDBProvider.prototype.clear = function(callback) {

};
