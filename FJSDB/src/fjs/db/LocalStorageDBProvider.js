(function(){
var _LocalStorageDbProvider =
/**
 * @constructor
 * @extends fjs.db.DBProviderBase
 */
fjs.db.LocalStorageDbProvider = function() {
    fjs.db.DBProviderBase.call(this);
    /**
     * @type {{name:string, version:number, tables:Object}}
     * @private
     */
    this.dbInfo = null;
    /**
     * @type {Object}
     * @private
     */
    this.tables = {};
    /**
     * @type {Object}
     * @protected
     */
    this.dbData = {};
    /**
     * @type {Object}
     * @private
     */
    this.indexes = {};
};
fjs.core.inherits(_LocalStorageDbProvider, fjs.db.DBProviderBase);

  _LocalStorageDbProvider.failed = false;
/**
 * Creates table indexes
 * @param {string} tableName - table name
 * @param {Array|Object} items - indexes
 * @private
 */
_LocalStorageDbProvider.prototype.createIndexes = function(tableName, items) {
    var _tableName = this.getLSTableName(tableName);
    if(!this.dbData[_tableName])
        this.dbData[_tableName]={};
    if(this.tables[tableName].indexes && this.tables[tableName].indexes.length>0) {
        var tableIndexes = this.indexes[_tableName];
        if(!tableIndexes) {
            tableIndexes = this.indexes[_tableName] = {};
        }
        for(var i=0; i<this.tables[tableName].indexes.length; i++) {
            var index = this.tables[tableName].indexes[i], multipleIndex;
            if (fjs.utils.Array.isArray(index)) {
                multipleIndex = index;
                multipleIndex.sort();
                index = multipleIndex.join("_");
            }
            var tableIndex = tableIndexes[index];
            if (!tableIndex) {
                tableIndex = tableIndexes[index] = {};
            }

            var keys = Object.keys(items);

            for(var n=0; n<keys.length; n++) {
                    var k = keys[n];
                    var tableIndexKeys, _indexKey;
                    if (multipleIndex) {
                        var _index = [];
                        for (var j = 0; j < multipleIndex.length; j++) {
                            _index.push(items[k][multipleIndex[j]]);
                        }
                        _indexKey = _index.join("_");
                    }
                    else {
                        _indexKey = items[k][index];
                    }

                    tableIndexKeys = tableIndex[_indexKey];
                    if (!tableIndexKeys) {
                        tableIndexKeys = tableIndex[_indexKey] = [];
                    }
                    var key = items[k][this.tables[tableName].key];
                    var ind = tableIndexKeys.indexOf(key);
                    if (ind < 0) {
                        tableIndexKeys.push(key);
                    }
            }
        }
    }
};

/**
 * Opens connection to storage
 * @param {Object} config - Database config
 * @param {function} callback - database ready event handler
 */
_LocalStorageDbProvider.prototype.open = function(config, callback) {
    var ls = fjs.utils.LocalStorage;
    try {
        var tableName, context = this;
        this.state = 0;
        this.dbInfo = fjs.utils.JSON.parse(ls.get("DB_" + config.name));

        for(var j=0; j<config.tables.length; j++) {
                var table = config.tables[j];
                this.tables[table.name] = table;
        }
        if (this.dbInfo) {
            if (config.version > this.dbInfo.version) {
                for (var i = 0; i < this.dbInfo.tables.length; i++) {
                    tableName = this.dbInfo.tables[i];
                    ls.remove(tableName);
                }
                this.dbInfo.tables = null;
                this.dbInfo.version = config.version;
                this.createTables(config.tables);
                ls.set("DB_" + config.name, fjs.utils.JSON.stringify(this.dbInfo));
            }
            else {
                for (var k = 0; k < this.dbInfo.tables.length; k++) {
                    tableName = this.dbInfo.tables[k];
                    var tableData = this.dbData[tableName] = fjs.utils.JSON.parse(ls.get(tableName)) || {};
                    this.createIndexes(this.getRealTableName(tableName), tableData);
                }
            }
        }
        else {
            this.dbInfo = {
                name: config.name,
                version: config.version
            };
            this.createTables(config.tables);
            ls.set("DB_" + name, fjs.utils.JSON.stringify(this.dbInfo));
        }
        this.state = 1;
        if (callback)
            setTimeout(function () {
                callback(context);
            }, 0);
    }
    catch (e) {
        fjs.utils.Console.error("Error: can't create localStorage DB", e);
        if(callback) {
            setTimeout(function () {
                callback(null);
            }, 0);
        }
    }
};

/**
 * Returns true if you can use localStorage in this browser
 * @returns {boolean}
 */
_LocalStorageDbProvider.check = function() {
    return fjs.utils.LocalStorage.check() && !fjs.db.LocalStorageDbProvider.failed;
};

/**
 * Creates list of tables
 * @private
 */
_LocalStorageDbProvider.prototype.createTables = function(tables) {
    if(tables) {
        this.dbInfo.tables = [];
        for(var i=0; i<tables.length; i++) {
            this.dbInfo.tables.push(this.getLSTableName(tables[i].name));
        }
    }
};

/**
 * Converts table name to special format to use in localStorage
 * @param {string} tableName - table name
 * @returns {string}
 * @private
 */
_LocalStorageDbProvider.prototype.getLSTableName = function(tableName) {
    return "DB_"+this.dbInfo.name+"_"+tableName;
};

/**
 * Converts table name from special format
 * @param {string} tableName - table name
 * @returns {string}
 * @private
 */
_LocalStorageDbProvider.prototype.getRealTableName = function(tableName) {
    return tableName.replace("DB_"+this.dbInfo.name+"_", "");
};



/**
 * Inserts one row
 * @param {string} tableName - table name
 * @param {*} item - item to insert
 * @param {Function=} callback - handler function to execute when row added
 */
_LocalStorageDbProvider.prototype.insertOne = function(tableName, item, callback) {
    var _tableName = this.getLSTableName(tableName);
    this.createIndexes(tableName, [item]);
    this.dbData[_tableName][item[this.tables[tableName].key]] = item;
    fjs.utils.LocalStorage.set(_tableName, fjs.utils.JSON.stringify(this.dbData[_tableName]));
    if(callback)
    setTimeout(callback, 0);
};

/**
 * Inserts array of rows
 * @param {string} tableName - table name
 * @param {Array} items - array of items to insert
 * @param {Function} callback - handler function to execute when all rows added
 */
_LocalStorageDbProvider.prototype.insertArray = function(tableName, items, callback) {
    var _tableName = this.getLSTableName(tableName);

    this.createIndexes(tableName, items);
        for(var i=0; i<items.length; i++) {
            var item = items[i];
            this.dbData[_tableName][item[this.tables[tableName].key]] = item;
        }
    fjs.utils.LocalStorage.set(_tableName, fjs.utils.JSON.stringify(this.dbData[_tableName]));
    if(callback)
    setTimeout(callback, 0);
};

/**
 * Deletes row by primary key
 * @param {string} tableName - table name
 * @param {string} key - primary key
 * @param {Function} callback - handler function to execute when row deleted
 */
_LocalStorageDbProvider.prototype.deleteByKey = function(tableName, key, callback) {
    tableName = this.getLSTableName(tableName);
    if(key!=null && this.dbData[tableName]) {
        delete this.dbData[tableName][key];
        fjs.utils.LocalStorage.set(tableName, fjs.utils.JSON.stringify(this.dbData[tableName]));
    }
    else {
        this.dbData[tableName] = {};
        this.indexes[tableName] = {};
        fjs.utils.LocalStorage.set(tableName, fjs.utils.JSON.stringify(this.dbData[tableName]));
    }
    if(callback)
    setTimeout(callback, 0);
};

/**
 * Selects all rows from table
 * @param {string} tableName - table name
 * @param {Function} itemCallback - handler function to execute when one row selected
 * @param {function(Array)} allCallback - handler function to execute when all rows selected
 */
_LocalStorageDbProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {
    tableName = this.getLSTableName(tableName);
    var arr = [];
    var items = this.dbData[tableName];
    var count=0;
    var keys = Object.keys(items);
    for(var i=0; i<keys.length; i++){
      var key = keys[i];
        if(items.hasOwnProperty(key)) {
            count++;
            (function(k, count) {
                setTimeout(function(){
                    var item = items[k];
                    arr.push(item);
                    itemCallback(item);
                    --count;
                    if(count === 0) {
                        setTimeout(function(){allCallback(arr)}, 0);
                    }
                },0);
            })(key, count);
        }
    }
    if(count === 0) {
        setTimeout(function(){allCallback(arr)}, 0);
    }
};

/**
 * Selects rows by index
 * @param {string} tableName - table name
 * @param {*} rule - map key->value
 * @param {Function} itemCallback - handler function to execute when one row selected
 * @param {function(Array)} allCallback - handler function to execute when all rows selected
 */
_LocalStorageDbProvider.prototype.selectByIndex = function(tableName, rule, itemCallback, allCallback) {
    var arr = [], indexes = [], indexKeys=[], _tableName = this.getLSTableName(tableName), ids=[], index, indexKey, context = this, count=0;
    if(rule) {
        var keys = Object.keys(rule);
        for (var j=0; j<keys.length; j++) {
            var key = keys[j];
            if(rule.hasOwnProperty(key))
            indexes.push(key);
        }
        if (indexes.length > 1) {
            indexes.sort();
            index = indexes.join("_");
            for(var ind=0; ind<indexes.length; ind++) {
                indexKeys.push(rule[indexes[ind]]);
            }
            indexKey = indexKeys.join("_");
        }
        else if(indexes.length == 1){
            index = indexes[0];
            indexKey = rule[index];
        }
        ids = this.indexes[_tableName] && this.indexes[_tableName][index] && this.indexes[_tableName][index][indexKey];
        if(ids && ids.length>0) {
            for (var i = 0; i < ids.length; i++) {
                count++;
                (function(ind, count) {
                    setTimeout(function(){
                        var item = context.dbData[_tableName][ids[ind]];
                        arr.push(item);
                        itemCallback(item);
                        --count;
                        if(count == 0) {
                            setTimeout(function () {
                                allCallback(arr)
                            }, 0);
                        }
                    },0);
                })(i, count);
            }
        }
        else {
            setTimeout(function () {
                allCallback(arr);
            }, 0);
        }
    }
    else {
        this.selectAll(tableName,itemCallback,allCallback);
    }
};

/**
 * Selects row by primary key
 * @param {string} tableName - table name
 * @param {string} key - primary key
 * @param {Function} callback - handler function to execute when one row selected
 */
_LocalStorageDbProvider.prototype.selectByKey = function(tableName, key, callback) {
    tableName = this.getLSTableName(tableName);
    var item = this.dbData[tableName][key];
    setTimeout(callback(item), 0);
};

/**
 * Clears database (drops all tables)
 * @param {Function} callback - handler function to execute when all tables removed
 */
_LocalStorageDbProvider.prototype.clear = function(callback) {
    var keys = Object.keys(this.tables);
    for(var i=0; i<keys.length; i++) {
      var tableName = keys[i];
        if(this.tables.hasOwnProperty(tableName)) {
            var _tableName = this.getLSTableName(tableName);
            fjs.utils.LocalStorage.remove(_tableName);
            delete this.dbData[_tableName];
            delete this.indexes[_tableName];
        }
    }
    if(callback)
    setTimeout(callback, 0);
};

/**
 * Deletes row by index
 * @param {string} tableName - table name
 * @param {*} rules - map key->value
 * @param {Function} callback - handler function to execute when rows deleted
 */
_LocalStorageDbProvider.prototype.deleteByIndex = function(tableName, rules, callback) {
    var arr = [], indexes = [], indexKeys=[], _tableName = this.getLSTableName(tableName), ids=[], index, indexKey;
    if(rules == null) {
        var keys = Object.keys(this.dbData[_tableName]);
        for(var j = 0; j<keys.length; j++){
          var k = keys[j];
            if(this.dbData[_tableName].hasOwnProperty(k)) {
                arr.push(this.dbData[_tableName][k]);
                delete this.dbData[_tableName][k];
            }
        }
        this.indexes[_tableName] = {};
        fjs.utils.LocalStorage.set(_tableName, fjs.utils.JSON.stringify(this.dbData[_tableName]));
    }
    else {
        var keys = Object.keys(rules);

        for (var r = 0; r<keys.length; r++){
          var key = keys[r];
          if(rules.hasOwnProperty(key))
            indexes.push(key);
        }
        if (indexes.length > 1) {
            indexes.sort();
            index = indexes.join("_");
            for(var ind=0; ind<indexes.length; ind++) {
                indexKeys.push(rules[indexes[ind]]);
            }
            indexKey = indexKeys.join("_");
        }
        else if(indexes.length == 1){
            index = indexes[0];
            indexKey = rules[index];
        }
        ids = this.indexes[_tableName] && this.indexes[_tableName][index] && this.indexes[_tableName][index][indexKey];
        if(ids) {
            for (var i = 0; i < ids.length; i++) {
                var item = this.dbData[_tableName][ids[i]];
                arr.push(item);
                delete this.dbData[_tableName][ids[i]];
            }
        }
    }
    setTimeout(function(){callback(arr)}, 0);
};
})();
