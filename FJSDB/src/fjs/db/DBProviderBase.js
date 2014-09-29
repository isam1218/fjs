(function(){
  var _DBProviderBase =
/**
 * Data base provider interface
 * @constructor
 */
fjs.db.DBProviderBase = function() {
    this.state = fjs.db.DBProviderBase.DB_STATE_NOTINITILIZED;
    this.tables = {};
};
  _DBProviderBase.DB_STATE_NOTINITILIZED = -1;
  _DBProviderBase.DB_STATE_INITIALIZATION = 0;
  _DBProviderBase.DB_STATE_READY = 1;

/**
 * Opens connection to storage
 * @param {Object} config - database config
 * @param {function} callback - database ready event handler
 */
_DBProviderBase.prototype.open = function(config, callback) {

};

/**
 * Checks if you can use this storage
 * @returns {boolean}
 */
_DBProviderBase.check = function() {
    return false;
};

/**
 * Inserts one row
* @param {string} tableName - table name
* @param {*} item - item to insert
* @param {Function=} callback - handler function to execute when row added
*/
_DBProviderBase.prototype.insertOne = function(tableName, item, callback) {

};

/**
 * Inserts array of rows
 * @param {string} tableName - table name
 * @param {Array} items - array of items to insert
 * @param {Function} callback - handler function to execute when all rows added
 */
_DBProviderBase.prototype.insertArray = function(tableName, items, callback) {

};

/**
* Deletes row by primary key
* @param {string} tableName - table name
* @param {string} key - primary key
* @param {Function} callback - handler function to execute when row deleted
*/
_DBProviderBase.prototype.deleteByKey = function(tableName, key, callback) {

};

/**
 * Deletes row by index
 * @param {string} tableName - table name
 * @param {*} rules - map key->value
 * @param {Function} callback - handler function to execute when rows deleted
 */
_DBProviderBase.prototype.deleteByIndex = function(tableName, rules, callback) {

};

/**
 * Selects all rows from table
 * @param {string} tableName - table name
 * @param {Function} itemCallback - handler function to execute when one row selected
 * @param {function(Array)} allCallback - handler function to execute when all rows selected
 */
_DBProviderBase.prototype.selectAll = function(tableName, itemCallback, allCallback) {

};

/**
 * Selects rows by index
 * @param {string} tableName - table name
 * @param {*} rules - map key->value
 * @param {Function} itemCallback - handler function to execute when one row selected
 * @param {function(Array)} allCallback - handler function to execute when all rows selected
 */
_DBProviderBase.prototype.selectByIndex = function(tableName, rules, itemCallback, allCallback) {

};



/**
 * Selects row by primary key
 * @param {string} tableName - table name
 * @param {string} key - primary key
 * @param {Function} callback - handler function to execute when one row selected
 */
_DBProviderBase.prototype.selectByKey = function(tableName, key, callback) {

};

/**
 * Clears database (drops all tables)
 * @param {Function} callback - handler function to execute when all tables removed
 */
_DBProviderBase.prototype.clear = function(callback) {

};
})();

