namespace("fjs.db");
/**
 * @interface
 * @implements fjs.db.IDBProvider
 */
fjs.db.LocalStorageDbProvider = function() {
    /**
     *
     * @type {{name:string, version:number, tables:Object}}
     */
    this.dbInfo = null;
    /**
     * @type {Object}
     */
    this.tables = {};
    this.dbData = {};
    this.indexes = {};
};

/**
 * @param {string} tableName
 * @param {Array|Object} items
 * @private
 */
fjs.db.LocalStorageDbProvider.prototype.createIndexes = function(tableName, items) {
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


            for (var k in items) {
                if (items.hasOwnProperty(k)) {
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
    }
};



/**
 * Opens connection to storage
 * @param {string} name
 * @param {number} version
 * @param {function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.open = function(name, version, callback) {
    var tableName;
    this.dbInfo = fjs.utils.JSON.parse(self.localStorage.getItem("DB_"+name));
    if(this.dbInfo) {
        if(version>this.dbInfo.version) {
            for(tableName in this.dbInfo.tables) {
                if(this.dbInfo.tables.hasOwnProperty(tableName)) {
                    self.localStorage.removeItem(tableName);
                }
            }
            this.dbInfo.tables = null;
            this.dbInfo.version = version;
            this.createTables();
        }
        else {
            for(var k=0; k<this.dbInfo.tables.length; k++) {
                tableName = this.dbInfo.tables[k];
                   var tableData = this.dbData[tableName] = fjs.utils.JSON.parse(self.localStorage.getItem(tableName)) || {};
                   this.createIndexes(this.getRealTableName(tableName), tableData);
            }
        }
    }
    else {
        this.dbInfo = {
            name: name,
            version:version
        };
        this.createTables();
        self.localStorage.setItem("DB_"+name, fjs.utils.JSON.stringify(this.dbInfo));
    }
    setTimeout(callback, 0);
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

fjs.db.LocalStorageDbProvider.prototype.createTables = function() {
    if(this.tables) {
        this.dbInfo.tables = [];
        for(var tableName in this.tables) {
            if(this.tables.hasOwnProperty(tableName)) {
                this.dbInfo.tables.push(this.getLSTableName(tableName));
            }
        }
    }
};

fjs.db.LocalStorageDbProvider.prototype.getLSTableName = function(tableName) {
    return "DB_"+this.dbInfo.name+"_"+tableName;
};

fjs.db.LocalStorageDbProvider.prototype.getRealTableName = function(tableName) {
    return tableName.replace("DB_"+this.dbInfo.name+"_", "");
};

/**
 * Declare table for creation (table will be created after only after Db version change)
 * @param {string} name
 * @param {string} key
 * @param {Array} indexes
 */
fjs.db.LocalStorageDbProvider.prototype.declareTable = function(name, key, indexes) {
    this.tables[name] = {name:name, key:key, indexes:indexes};
};

/**
 * Inserts one row
 * @param {string} tableName
 * @param {*} item
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.insertOne = function(tableName, item, callback) {
    var _tableName = this.getLSTableName(tableName);
    this.createIndexes(tableName, [item]);
    this.dbData[_tableName][item[this.tables[tableName].key]] = item;
    self.localStorage.setItem(_tableName, fjs.utils.JSON.stringify(this.dbData[_tableName]));
    setTimeout(callback, 0);
};

/**
 * Inserts array of rows
 * @param {string} tableName
 * @param {Array} items
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.insertArray = function(tableName, items, callback) {
    var _tableName = this.getLSTableName(tableName);

    this.createIndexes(tableName, items);
        for(var i=0; i<items.length; i++) {
            var item = items[i];
            this.dbData[_tableName][item[this.tables[tableName].key]] = item;
        }
    self.localStorage.setItem(_tableName, fjs.utils.JSON.stringify(this.dbData[_tableName]));
    setTimeout(callback, 0);
};

/**
 * Deletes row by primary key
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.deleteByKey = function(tableName, key, callback) {
    tableName = this.getLSTableName(tableName);
    if(key!=null) {
        delete this.dbData[tableName][key];
        self.localStorage.setItem(tableName, fjs.utils.JSON.stringify(this.dbData[tableName]));
    }
    else {
        this.dbData[tableName] = {};
        this.indexes[tableName] = {};
        self.localStorage.setItem(tableName, fjs.utils.JSON.stringify(this.dbData[tableName]));
    }
    setTimeout(callback, 0);
};

/**
 * Returns all rows from table
 * @param {string} tableName
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.LocalStorageDbProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {
    tableName = this.getLSTableName(tableName);
    var arr = [];
    var items = this.dbData[tableName];
    for(var key in items) {
        if(items.hasOwnProperty(key)) {
            (function(k) {
                setTimeout(function(){
                        var item = items[k];
                        arr.push(item);
                        itemCallback(item);
                },0);
            })(key);
        }
    }
    setTimeout(function(){allCallback(arr)}, 0);
};

/**
 * Returns rows by index
 * @param {string} tableName
 * @param {*} rule Map key->value
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.LocalStorageDbProvider.prototype.selectByIndex = function(tableName, rule, itemCallback, allCallback) {
    var arr = [], indexes = [], indexKeys=[], _tableName = this.getLSTableName(tableName), ids=[], index, indexKey, context = this;
    if(rule) {
        for (var key in rule) {
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
        if(ids) {
            for (var i = 0; i < ids.length; i++) {
                (function(ind) {
                    setTimeout(function(){
                            var item = context.dbData[_tableName][ids[ind]];
                            arr.push(item);
                            itemCallback(item);

                    },0);
                })(i);
            }
        }
        setTimeout(function () {
            allCallback(arr)
        }, 0);
    }
    else {
        this.selectAll(tableName,itemCallback,allCallback);
    }
};

/**
 * Returns row by primary key
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.selectByKey = function(tableName, key, callback) {
    tableName = this.getLSTableName(tableName);
    var item = this.dbData[tableName][key];
    setTimeout(callback(item), 0);
};

/**
 * Clears database (drops all tables)
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.clear = function(callback) {
    for(var tableName in this.tables) {
        if(this.tables.hasOwnProperty(tableName)) {
            var _tableName = this.getLSTableName(tableName);
            self.localStorage.removeItem(_tableName);
            delete this.dbData[_tableName];
            delete this.indexes[_tableName];
        }
    }
    setTimeout(callback, 0);
};

/**
 * Deletes row by index
 * @param {string} tableName
 * @param {*} rules
 * @param {Function} callback
 */
fjs.db.LocalStorageDbProvider.prototype.deleteByIndex = function(tableName, rules, callback) {
    var arr = [], indexes = [], indexKeys=[], _tableName = this.getLSTableName(tableName), ids=[], index, indexKey;
    if(rules == null) {
        for(var k in this.dbData[_tableName]) {
            if(this.dbData[_tableName].hasOwnProperty(k)) {
                arr.push(this.dbData[_tableName][k]);
                delete this.dbData[_tableName][k];
            }
        }
        this.indexes[_tableName] = {};
        self.localStorage.setItem(_tableName, fjs.utils.JSON.stringify(this.dbData[_tableName]));
    }
    else {
        for (var key in rules) {
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
