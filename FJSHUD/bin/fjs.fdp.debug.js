/**
 * Created by vovchuk on 10/29/13.
 */
namespace("fjs.db");
/**
 * Wrapper class for <a href="https://developer.mozilla.org/ru/docs/IndexedDB">indexedDB</a> <br/>
 * This class implements IDBProvider interface (common interface to work with all client side storages)
 * @constructor
 * @implements fjs.db.IDBProvider
 */
fjs.db.IndexedDBProvider = function() {
    /**
     * @type {indexedDB}
     * @private
     */
    this.indexedDB = self['indexedDB'] || self['mozIndexedDB'] || self['webkitIndexedDB'] || self['msIndexedDB'];
    /**
     *
     * @type {IDBTransaction}
     * @private
     */
    this.IDBTransaction = self['IDBTransaction'] || self['webkitIDBTransaction'] || self['msIDBTransaction'];
    /**
     * @type {IDBKeyRange}
     * @private
     */
    this.IDBKeyRange = self['IDBKeyRange'] || self['webkitIDBKeyRange'] || self['msIDBKeyRange'];
    /**
     * Database object
     * @type {IDBDatabase}
     */
    this.db = null;
    /**
     * @type {Object}
     * @private
     */
    this.tables = {};

    this.state = -1;

};

/**
 * Returns true if you can use IndexedDB in this browser
 * @returns {boolean}
 */
fjs.db.IndexedDBProvider.check= function() {
    return !!(self['indexedDB'] || self['mozIndexedDB'] || self['webkitIndexedDB'] || self['msIndexedDB']);
};
/**
* Opens connection to storage
* @param {string} name Database name
* @param {number} version Database version
* @param {function(IDBDatabase)} callback - Handler function to execute when database was ready
*/
fjs.db.IndexedDBProvider.prototype.open = function(name, version, callback) {
    this.state = 0;
    var request = this.indexedDB.open(name, version), context = this;
    request.onerror = function(event) {
        fjs.utils.Console.error("Error: can't open indexedDB ("+name+", "+version+")", event);
        callback(null);
    };
    var onError = function(event) {
        fjs.utils.Console.error("Database error: " + event.target.errorCode, event);
        callback(null);
    };
    request.onsuccess = function() {
        context.db = request.result;
        context.db.onerror = onError;
        context.state = 1;
        if(callback) {
            callback(context.db);
        }
    };

    request.onupgradeneeded = function(e) {
        var db = context.db = e.target.result;
        e.target.transaction.onerror = db.onerror = onError;
        for(var i=0; i<db.objectStoreNames.length; ) {
            db.deleteObjectStore(db.objectStoreNames[0]);
        }
        for(var key in context.tables) {
            if(context.tables.hasOwnProperty(key)) {
                /**
                 * @type {{key:string, indexes:Array}}
                 */
                var table = context.tables[key];
                context.createTable(key, table.key, table.indexes);
            }
        }
    };
};

/**
 * Declare table for creation (table will be created after only after Db version change)
 * @param {string} name Table name
 * @param {string} key Primary key
 * @param {Array} indexes Table indexes
 */
fjs.db.IndexedDBProvider.prototype.declareTable = function(name, key, indexes) {
    var table = this.tables[name] = {'key':key, 'indexes':indexes};
    if(fjs.utils.Browser.isIE() && indexes) {
        table.multipleIndexes = this.IEDeclareMultipleIndexes(indexes);
    }
};

/**
 * Creates table
 * @param {string} name Table name
 * @param {string} key Primary key
 * @param {Array} indexes Table indexes
 * @protected
 */
fjs.db.IndexedDBProvider.prototype.createTable = function(name, key, indexes) {
    /**
     * @type {IDBObjectStore}
     */
    var objectStore = this.db.createObjectStore(name, {keyPath: key});
    if(indexes) {
        for(var i=0; i< indexes.length; i++) {
            if(Object.prototype.toString.call(indexes[i]) == "[object Array]") {
                if(fjs.utils.Browser.isIE()) {
                    objectStore.createIndex(indexes[i].join(","), indexes[i].join(","), { unique: false });
                }
                else {
                    objectStore.createIndex(indexes[i].join(","), indexes[i], { unique: false });
                }
            }
            else {
                objectStore.createIndex(indexes[i], indexes[i], { unique: false });
            }
        }
    }
};

/**
 * Declares multiple indexes for IE <br>
 * Workaround to fix IE issue with multiple indexes
 * @param {Array} indexes
 * @private
 */
fjs.db.IndexedDBProvider.prototype.IEDeclareMultipleIndexes = function(indexes) {
    var multipleIndexes = {};
    for(var i=0; i<indexes.length; i++) {
        if(Object.prototype.toString.call(indexes[i]) == "[object Array]") {
            multipleIndexes[indexes[i].join(",")] = indexes[i];
        }
    }
    return multipleIndexes;
};
/**
 * Creates multiples indexes for IE
 * Workaround to fix IE issue with multiple indexes
 * @param {string} tableName
 * @param item
 * @private
 */
fjs.db.IndexedDBProvider.prototype.IEApplyMultipleIndexesForItem = function(tableName, item) {
    /**
     * @type {*}
     */
    var indexes = this.tables[tableName].multipleIndexes;
    for(var key in indexes) {
        if(indexes.hasOwnProperty(key)) {
            var index = indexes[key];
            var fields = [];
            for(var i=0; i<index.length; i++) {
                var val = item[index[i]]!=null ? item[index[i]] : "";
                fields.push(val);
            }
            item[key] = fields.join(",");
        }
    }
};
/**
 * @param {string} tableName
 * @param item
 * @private
 */
fjs.db.IndexedDBProvider.prototype.IEClearMultipleIndexesForItem = function(tableName, item) {
    /**
     * @type {*}
     */
    var indexes = this.tables[tableName].multipleIndexes;
    for(var key in indexes) {
        if(indexes.hasOwnProperty(key)) {
            delete item[key];
        }
    }
};

/**
 * Inserts one row to the database table
 * @param {string} tableName Table name
 * @param {*} item Item to insert
 * @param {Function} callback - Handler function to execute when row added
 */
fjs.db.IndexedDBProvider.prototype.insertOne = function(tableName, item, callback) {
    var trans = this.db.transaction([tableName], "readwrite");
    /**
     * @type {IDBObjectStore}
     */
    var store = trans.objectStore(tableName);
    if(fjs.utils.Browser.isIE()) {
        this.IEApplyMultipleIndexesForItem(tableName, item);
    }
    var request = store.put(item);

    request.onsuccess = function(e) {
        if(callback) {
            callback(e);
        }
    };
    request.onerror = this.db.onerror;
};

/**
 * Inserts array of rows to the database table
 * @param {string} tableName Table name
 * @param {Array} items Array of items to insert
 * @param {Function} callback Handler function to execute when all rows added
 */
fjs.db.IndexedDBProvider.prototype.insertArray = function(tableName, items, callback) {
    var trans = this.db.transaction([tableName], "readwrite");
    var store = trans.objectStore(tableName);
    var count = items.length;
    for(var i=0; i<items.length; i++) {
        var item = items[i];
        if(fjs.utils.Browser.isIE()) {
           this.IEApplyMultipleIndexesForItem(tableName, item);
        }
    var request = store.put(item);
        request.onsuccess = function(e) {
            count--;
            if(callback && count==0) {
                callback(e);
            }
        };
        request.onerror = this.db.onerror;
    }
};

/**
 * Deletes row by primary key
 * @param {string} tableName Table name
 * @param {string} key Primary key
 * @param {Function} callback Handler function to execute when row deleted
 */
fjs.db.IndexedDBProvider.prototype.deleteByKey = function(tableName, key, callback) {
        var request, tran = this.db.transaction([tableName], "readwrite")
            .objectStore(tableName);
        if(key!=null) {
            request = tran.delete(key);
        }
        else {
            request = tran.clear();
        }
        request.onsuccess = function(e) {
            if(callback) {
                callback(e);
            }
        }
};

/**
 * Selects all rows from table
 * @param {string} tableName Table name
 * @param {Function} itemCallback Handler function to execute when one row selected
 * @param {function(Array)} allCallback Handler function to execute when all rows selected
 */
fjs.db.IndexedDBProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {
    var context =this;
    var trans = this.db.transaction([tableName], "readwrite");
    var store = trans.objectStore(tableName);
    var keyRange = this.IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);
    var rows=[];

    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;

        if(!!result == false) {
            if(allCallback) {
                allCallback(rows);
            }
            return;
        }
        var row = result.value;
        if(fjs.utils.Browser.isIE()) {
            context.IEClearMultipleIndexesForItem(tableName, row);
        }
        rows.push(row);

        if(itemCallback) {
            itemCallback(row);
        }
        result.continue();
    };
    cursorRequest.onerror = this.db.onerror;
};

/**
 * Selects rows by index
 * @param {string} tableName Table name
 * @param {*} rules Map key->value
 * @param {Function} itemCallback Handler function to execute when one row selected
 * @param {function(Array)} allCallback Handler function to execute when all rows selected
 */
fjs.db.IndexedDBProvider.prototype.selectByIndex = function(tableName, rules, itemCallback, allCallback) {
    var context =this;
    var keys = [];
    var values = [];
    for(var key in rules) {
        if(rules.hasOwnProperty(key)) {
            keys.push(key);
            values.push(rules[key]);
        }
    }
    if(values.length==1) {
        values = values[0];
    }
    else if(fjs.utils.Browser.isIE()) {
        values = values.join(",");
    }
    var trans = this.db.transaction([tableName], "readwrite");
    var store = trans.objectStore(tableName);
    var index = store.index(keys.join(","));

    var singleKeyRange = this.IDBKeyRange['only'](values);
    var cursorRequest = index.openCursor(singleKeyRange);
    var rows=[];
    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;

        if(!!result == false) {
            if(allCallback) {
                allCallback(rows);
            }
            return;
        }
        var row = result.value;
        if(fjs.utils.Browser.isIE()) {
            context.IEClearMultipleIndexesForItem(tableName, row);
        }
        rows.push(row);

        if(itemCallback) {
            itemCallback(row);
        }
        result.continue();
    };
    cursorRequest.onerror = this.db.onerror;
};

/**
 * Selects row by primary key
 * @param {string} tableName Table name
 * @param {string} key Primary key
 * @param {Function} callback Handler function to execute when one row selected
 */
fjs.db.IndexedDBProvider.prototype.selectByKey = function(tableName, key, callback) {
    var context = this;
    var transaction = this.db.transaction([tableName]);
    var store = transaction.objectStore(tableName);
    var request = store.get(key);
    request.onerror = this.db.onerror;
    request.onsuccess = function() {
        var row = request.result;
        if(fjs.utils.Browser.isIE()) {
            context.IEClearMultipleIndexesForItem(tableName, row);
        }
        callback(row);
    };
};

/**
 * Clears database (drops all tables)
 * @param {Function} callback Handler function to execute when all tables removed.
 */
fjs.db.IndexedDBProvider.prototype.clear = function(callback) {
    var count = this.db.objectStoreNames.length;
    for(var i=0; i<this.db.objectStoreNames.length; i++) {
        var clearTransaction = this.db.transaction([this.db.objectStoreNames[i]], "readwrite");
        var request = clearTransaction.objectStore(this.db.objectStoreNames[i]).clear();
        request.onsuccess = function(e) {
            count--;
            if(callback && count==0) {
                callback(e);
            }
        };
        request.onerror = this.db.onerror;
    }
};

/**
 * Deletes row by index
 * @param {string} tableName Table name
 * @param {Object} rules Map key->value
 * @param {Function} callback Handler function to execute when rows deleted.
 */
fjs.db.IndexedDBProvider.prototype.deleteByIndex = function(tableName, rules, callback) {
    var context =this;
    var keys = [];
    var values = [];
    for(var key in rules) {
        if(rules.hasOwnProperty(key)) {
            keys.push(key);
            values.push(rules[key]);
        }
    }
    if(values.length==1) {
        values = values[0];
    }
    else if(fjs.utils.Browser.isIE()) {
        values = values.join(",");
    }
    var trans = this.db.transaction([tableName], "readwrite");
    var store = trans.objectStore(tableName);
    var index = store.index(keys.join(","));
    var singleKeyRange = this.IDBKeyRange['only'](values);
    var cursorRequest = index.openCursor(singleKeyRange);
    var rows=[];

    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(!!result == false) {
            if(callback) {
                callback(rows);
            }
        }
        else {
            var row = result.value;
            if(fjs.utils.Browser.isIE()) {
                context.IEClearMultipleIndexesForItem(tableName, row);
            }
            rows.push(row);
            result.delete();
            result.continue();
        }
    };
    cursorRequest.onerror = this.db.onerror;
};namespace("fjs.db");
/**
 * Wrapper class for <a href="http://en.wikipedia.org/wiki/Web_SQL_Database">WebSQL</a> <br/>
 * This class implements IDBProvider interface (common interface to work with all client side storages)
 * @constructor
 * @implements fjs.db.IDBProvider
 */
fjs.db.WebSQLProvider = function() {
    /**
     * Database object
     * @type {Database}
     */
    this.db = null;
    /**
     * @type {Object}
     * @private
     */
    this.tables = {};
};
/**
 * Returns true if you can use WebSQL in this browser
 * @return {boolean}
 */
fjs.db.WebSQLProvider.check = function() {
    return typeof (self.openDatabase) !== 'undefined';
};

/**
 * Opens connection to storage
 * @param {string} name Database name
 * @param {string} version Database version
 * @param {function(fjs.db.IDBProvider)} callback - Handler function to execute when database was ready
 */
fjs.db.WebSQLProvider.prototype.open = function(name, version, callback) {
    var dbSize = 4*1024*1024, context = this;

    try {
        var db = this.db = self.openDatabase(name, "", name, dbSize);
    }
    catch(e) {
        fjs.utils.Console.error(e);
        callback(null);
        return;
    }
    if(db.version==='') {
        for(var i in context.tables) {
            if(context.tables.hasOwnProperty(i)) {
                /**
                 * @type {{key:string, indexes:Array}}
                 */
                var table = context.tables[i];

                context.createTable(i, table.key, table.indexes);
                fjs.utils.Console.log(i+" table created");
            }
        }
        callback(this);
    }
    else if(db.version!==version) {
        db.changeVersion(db.version, version, function(){
            context.clear(function(){
                for(var i in context.tables) {
                    if(context.tables.hasOwnProperty(i)) {
                        /**
                         * @type {{key:string, indexes:Array}}
                         */
                        var table = context.tables[i];
                        context.createTable(i, table.key, table.indexes);
                    }
                }
                callback(this);
            });
        });
    }
    else {
        callback(this);
    }
};
/**
 * Creates table
 * @param {string} name Table name
 * @param {string} key Primary key
 * @param {Array} indexes Table indexes
 * @protected
 */
fjs.db.WebSQLProvider.prototype.createTable = function(name, key, indexes) {
    this.db.transaction(function(tx) {
        var query = 'CREATE TABLE IF NOT EXISTS ';
        query += name + '(' + key + ' TEXT PRIMARY KEY';
        query += (indexes.length > 0 ? ', ' + indexes.join(" TEXT, ") + " TEXT": '');
        query += ', data TEXT)';
        tx.executeSql(query);
        if(indexes) {
            for(var i=0; i<indexes.length; i++) {
                //TODO: multiple indexes
                var _query = "CREATE INDEX "+name+"_"+indexes[i]+"_idx ON "+ name +" ("+indexes[i]+")";
                tx.executeSql(_query);
            }
        }
    });
};

/**
 * Declare table for creation (table will be created after only after Db version change)
 * @param {string} name Table name
 * @param {string} key Primary key
 * @param {Array} indexes Table indexes
 */
fjs.db.WebSQLProvider.prototype.declareTable = function(name, key, indexes) {
    var _indexes = [];
    if(indexes) {
        for(var i=0; i<indexes.length; i++) {
            if(Object.prototype.toString.call(indexes[i]) != "[object Array]") {
                _indexes.push(indexes[i]);
            }
            else {
                for(var j=0; j<indexes[i].length; j++) {
                    var ind = indexes[i][j];
                    if(indexes.indexOf(ind)<0) {
                        _indexes.push(ind);
                    }
                }
            }
        }
    }
    this.tables[name] = {'key':key, 'indexes':_indexes};
};

/**
 * Inserts one row to the database table
 * @param {string} tableName Table name
 * @param {*} item Item to insert
 * @param {Function} callback - Handler function to execute when row added
 */
fjs.db.WebSQLProvider.prototype.insertOne = function(tableName, item, callback) {

    /**
     * @type {{key:string, indexes: Array}}
     */
    var table = this.tables[tableName];
    this.db.transaction(function(tx){
        var query = "INSERT OR REPLACE INTO "
            + tableName + "("
            + table.key + ", "
            + (table.indexes && table.indexes.length ? (table.indexes.join(", ") + ", ") : "")
            + "data) VALUES ('"
            + item[table.key] +"', '";
        if(table.indexes) {
            for(var i=0; i<table.indexes.length; i++) {
                query += item[table.indexes[i]]+"', '";
            }
        }
        query+=fjs.utils.JSON.stringify(item)+"')";
        tx.executeSql(query, [],  callback, function(e){throw (new Error(e))});
    });
};

/**
 * Inserts array of rows to the database table
 * @param {string} tableName Table name
 * @param {Array} items Array of items to insert
 * @param {Function} callback Handler function to execute when all rows added
 */
fjs.db.WebSQLProvider.prototype.insertArray = function(tableName, items, callback) {
    /**
     * @type {{key:string, indexes: Array}}
     */
    var table = this.tables[tableName];
    var count = items.length;

    this.db.transaction(function(tx){
        var _query = "INSERT OR REPLACE INTO "
            + tableName + "("
            + table.key + ", "
            + (table.indexes && table.indexes.length ? (table.indexes.join(", ") + ", ") : "")
            + "data) VALUES ('";
        for(var j = 0; j<items.length; j++) {
            var item = items[j];
            var query = _query + item[table.key] +"', '";
            if(table.indexes) {
                for(var i=0; i<table.indexes.length; i++) {
                    query += item[table.indexes[i]]+"', '";
                }
            }
            query+=fjs.utils.JSON.stringify(item)+"')";
            tx.executeSql(query, [],  function() {
                count--;
                if(callback && count==0) {
                    callback();
                }
            }, function(e){
                throw (new Error(e))
            });
        }
    });
};

/**
 * Deletes row by primary key
 * @param {string} tableName Table name
 * @param {string} key Primary key
 * @param {Function} callback Handler function to execute when row deleted
 */
fjs.db.WebSQLProvider.prototype.deleteByKey = function(tableName, key, callback) {
        /**
         * @type {{key:string, indexes: Array}}
         */
        var table = this.tables[tableName];
        this.db.transaction(function(tx){
            var query = "DELETE FROM " + tableName;
                if(key!=null) {
                    query+= " WHERE " + table.key + " = '" + key +"'";
                }
            tx.executeSql(query, [],  callback, function(e){throw (new Error(e))});
        });
};


/**
 * Selects all rows from table
 * @param {string} tableName Table name
 * @param {?function(Object)} itemCallback Handler function to execute when one row selected
 * @param {?function(Array)} allCallback Handler function to execute when all rows selected
 */
fjs.db.WebSQLProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {
    this.db.transaction(function(tx){
        var query = "SELECT data FROM " + tableName;

        tx.executeSql(query, [], function(tr, result){
            /**
             * @type {Array}
             */
            var arr = [];
            if(result.rows) {
                for(var i=0; i<result.rows.length; i++) {
                    var item = result.rows.item(i).data;
                    item = JSON.parse(item);
                    arr.push(item);
                    if(itemCallback)
                    itemCallback(item);
                }
                if(allCallback)
                allCallback(arr);
            }
        }, function(e){throw (new Error(e))});
    });
};
/**
 * Selects rows by index
 * @param {string} tableName Table name
 * @param {*} rules Map key->value
 * @param {Function} itemCallback Handler function to execute when one row selected
 * @param {function(Array)} allCallback Handler function to execute when all rows selected
 */
fjs.db.WebSQLProvider.prototype.selectByIndex = function(tableName, rules, itemCallback, allCallback) {
    var query = "SELECT data FROM " + tableName + " WHERE ";
    var rulesArr = [];
    for(var key in rules) {
        if(rules.hasOwnProperty(key)) {
            rulesArr.push(key+"='"+rules[key]+"'");
        }
    }
    query += rulesArr.join(" AND ");
    this.db.transaction(function(tx){

        tx.executeSql(query, [], function(tr, result){
            /**
             * @type {Array}
             */
            var arr = [];
            if(result.rows) {
                for(var i=0; i<result.rows.length; i++) {
                    var item = result.rows.item(i).data;
                    item = JSON.parse(item);
                    arr.push(item);
                    if(itemCallback)
                    itemCallback(item);
                }
                if(allCallback)
                allCallback(arr);
            }
        }, function(e){throw (new Error(e))});
    });
};

/**
 * Selects row by primary key
 * @param {string} tableName Table name
 * @param {string} key Primary key
 * @param {Function} callback Handler function to execute when one row selected
 */
fjs.db.WebSQLProvider.prototype.selectByKey = function(tableName, key, callback) {
    var context = this;
    this.db.transaction(function(tx){
        var keyField = context.tables[tableName].key;
        var query = "SELECT data FROM " + tableName + " WHERE " + keyField+"='"+key+"'";
        tx.executeSql(query, [], function(tr, result){
            if(result.rows) {
                var item = result.rows.item(0);
                if(item && item.data) {
                    item = JSON.parse(item.data);
                    callback(item);
                }
                else {
                    callback(null);
                }
            }
        }, function(e){throw (new Error(e))});
    });
};

/**
 * Clears database (drops all tables)
 * @param {Function} callback Handler function to execute when all tables removed.
 */
fjs.db.WebSQLProvider.prototype.clear = function(callback) {
    var _query = "DELETE FROM ", count= 0, context = this;

    this.db.transaction(function(tx){
        for(var tableName in context.tables) {
            count++;
            var query = _query + tableName;
            tx.executeSql(query, [],  function() {
                count--;
                if(callback && count==0) {
                    callback();
                }
            }, function(e){
                throw (new Error(e))
            });
        }
    });
};

/**
 * Deletes row by index
 * @param {string} tableName Table name
 * @param {Object} rules Map key->value
 * @param {Function} callback Handler function to execute when rows deleted.
 */
fjs.db.WebSQLProvider.prototype.deleteByIndex = function(tableName, rules, callback) {
    this.db.transaction(function(tx){
        var query = tableName;
        if(rules!=null) {
            query+= " WHERE ";
            var rulesArr = [];
            for(var key in rules) {
                if(rules.hasOwnProperty(key)) {
                    rulesArr.push(key+"='"+rules[key]+"'");
                }
            }
            query += rulesArr.join(" AND ");
        }
        tx.executeSql('SELECT data FROM ' + query, [], function(tr, result){
            var arr = [];
            if(result.rows) {
                for(var i=0; i<result.rows.length; i++) {
                    var item = result.rows.item(i).data;
                    item = JSON.parse(item);
                    arr.push(item);
                }
                tx.executeSql('DELETE FROM ' + query, [],  callback(arr), function(e){throw (new Error(e))});
            }
        }, function(e){throw (new Error(e))});
    });
};




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
    this.state = -1;
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
    var ls = fjs.utils.LocalStorage;
    try {
        var tableName, context = this;
        this.state = 0;
        this.dbInfo = fjs.utils.JSON.parse(ls.get("DB_" + name));
        if (this.dbInfo) {
            if (version > this.dbInfo.version) {
                for (var i = 0; i < this.dbInfo.tables.length; i++) {
                    tableName = this.dbInfo.tables[i];
                    ls.remove(tableName);
                }
                this.dbInfo.tables = null;
                this.dbInfo.version = version;
                this.createTables();
                ls.set("DB_" + name, fjs.utils.JSON.stringify(this.dbInfo));
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
                name: name,
                version: version
            };
            this.createTables();
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
fjs.db.LocalStorageDbProvider.check = function() {
    return fjs.utils.LocalStorage.check();
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
    fjs.utils.LocalStorage.set(_tableName, fjs.utils.JSON.stringify(this.dbData[_tableName]));
    if(callback)
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
    fjs.utils.LocalStorage.set(_tableName, fjs.utils.JSON.stringify(this.dbData[_tableName]));
    if(callback)
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
 * Returns all rows from table
 * @param {string} tableName
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.LocalStorageDbProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {
    tableName = this.getLSTableName(tableName);
    var arr = [];
    var items = this.dbData[tableName];
    var count=0;
    for(var key in items) {
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
 * Returns rows by index
 * @param {string} tableName
 * @param {*} rule Map key->value
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.LocalStorageDbProvider.prototype.selectByIndex = function(tableName, rule, itemCallback, allCallback) {
    var arr = [], indexes = [], indexKeys=[], _tableName = this.getLSTableName(tableName), ids=[], index, indexKey, context = this, count=0;
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
        fjs.utils.LocalStorage.set(_tableName, fjs.utils.JSON.stringify(this.dbData[_tableName]));
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
namespace('fjs.db');
/**
 * Database providers factory.<br/>
 * It checks the capabilities of browsers and creates database providers.
 * @constructor
 */
fjs.db.DBFactory = function(config) {
    if (!this.constructor.__instance)
        this.constructor.__instance = this;
    else return this.constructor.__instance;

    this.config = config;
    /**
     * @enum {fjs.db.IDBProvider}
     * @private
     */
    this._dbRegister = {
        'indexedDB':  fjs.db.IndexedDBProvider
        , 'webSQL': fjs.db.WebSQLProvider
        , 'localStorage': fjs.db.LocalStorageDbProvider
    };

    this.currentDB = null;
    this.currentDBIndex = -1;
};

/**
 * Selects and returns the most appropriate database provider.
 * @param {fjs.db.IDBProvider?} oldDB Previous database if it failed.
 * @returns {fjs.db.IDBProvider|undefined}
 */
fjs.db.DBFactory.prototype.getDB = function(oldDB) {
    /**
     * priority of databases
     * @type {Array}
     */
    if(!this.currentDB || oldDB) {
        var dbs = this.config.DB.dbProviders;
        for(var i=this.currentDBIndex+1; i<dbs.length; i++) {
            if (this._dbRegister[dbs[i]].check()) {
                this.currentDB = new this._dbRegister[dbs[i]]();
                this.currentDBIndex = i;
                break;
            }
        }
    }
    return this.currentDB;
};
namespace("fjs.fdp.model");
/**
 * Wrapper class for data entries received form FDP server. <br>
 * It sets the basic structure of entry model, and provides a mechanism for update entry.
 * @param {Object} obj
 * @constructor
 */
fjs.fdp.model.EntryModel = function(obj) {
    this.xef001id = null;
    this.xef001iver = null;
    this.xpid = null;
    this.fill(obj);
};
/**
 * Fills entry model with new parameters, returns map of changes or null if no changes
 * @param {Object} obj - input fdp changes
 * @returns {Object|null} Map of changes
 */
fjs.fdp.model.EntryModel.prototype.fill = function(obj) {
    var changes = {};
    var changesCount = 0;
    if(obj) {
        for(var i in obj) {
            if(obj.hasOwnProperty(i)) {
                if(this[i]!=obj[i]) {
                    this[i] = obj[i];
                    changes[i] = this[i];
                    changesCount++;
                }
            }
        }
    }
    if(changesCount) {
        if(!changes['xpid']) {
            changes['xpid'] = this.xpid;
        }
        return changes;
    }
    else return null;
};namespace("fjs.fdp.model");
/**
 * Base proxy model. <br/>
 * It combines joined feeds, monitors and collect changes and sends changed fields only.
 * @param {Array.<string>} feeds - List of joined feeds (parent feed first)
 * @param {fjs.fdp.SyncManager} syncManager - Synchronization manager
 * @constructor
 */
fjs.fdp.model.ProxyModel = function(feeds, syncManager) {
    var context = this;
    /**
     * @type {Object}
     */
    this.items ={};
    this.keepEntries={};
    this.changes=null;
    this.feeds = feeds;
    this.feedName = feeds[0];
    this.listeners = [];
    this.feedFields = {};

    this.sm = syncManager;
    /**
     * @type {boolean}
     * @private
     */
    this._attached = false;
    var onSyncEvent = function(data) {
        context.onSyncEvent(data);
    };

    /**
     * Adds listeners to sync manager. <br>
     * That action initiates synchronization for this feeds
     * @private
     */
    this.attach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.addFeedListener(this.feeds[i], onSyncEvent);
        }
    };

    /**
     * Removes listeners from sync manager <br>
     * That action ends syncronization for this feeds
     * @private
     */
    this.detach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.removeFeedListener(this.feeds[i], onSyncEvent);
        }
    };
};


/**
 * Adds event handler function to feed changes
 * @param {Function} listener - Event handler, method to execute when fdp data changed.
 */
fjs.fdp.model.ProxyModel.prototype.addListener = function(listener) {
    var index = this.listeners.indexOf(listener);
    if(index < 0) {
        this.listeners.push(listener);
        var changes = this.createFullChange();
        if(changes) {
            listener({feed: this.feedName, changes:changes});
        }
        if(!this._attached) {
            this.attach();
            this._attached = true;
        }
    }
    else {
        fjs.utils.Console.warn("Trying to add duplicated listener");
    }
};

/**
 * Removes listener function from feed
 * @param {Function} listener Event handler, method to execute when fdp data changed.
 */
fjs.fdp.model.ProxyModel.prototype.removeListener = function(listener) {
    var index = this.listeners.indexOf(listener);
    if(index >- 1) {
        this.listeners.splice(index, 1);
        if(this.listeners.length == 0) {
            this.detach();
            this._attached = false;
        }
    }
    else {
        fjs.utils.Console.warn("Trying to remove unexisted listener");
    }
};

/**
 * Sends event to listeners
 * @param {Object} event Event object ({feed:string, changes:{xpid:entry}})
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.fireEvent = function(event) {
    var clonedArray = this.listeners.slice(0);
    for(var i=0; i<clonedArray.length; i++) {
        if(this.listeners.indexOf(clonedArray[i])>-1) {
            clonedArray[i](event);
        }
    }
};
/**
 * Creates a template object for change
 * @returns {{xpid:string, entry:{}}}
 * @private
 */
fjs.fdp.model.ProxyModel.prototype.createChange = function(xpid) {
    if(!this.changes) {
        this.changes = {};
    }
    var _changes = this.changes[xpid];
    if(!_changes) {
        _changes = this.changes[xpid] = {xpid:xpid, entry:{}};
    }
    return _changes;
};

/**
 * Creates changes object with all existed items.
 * @returns {Object | null}
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.createFullChange = function() {
    var _changes = {}, entriesCount=0;
    for(var key in this.items) {
        if(this.items.hasOwnProperty(key)) {
            _changes[key] = {xpid:key, entry:this.items[key], type:'change'};
            entriesCount++;
        }
    }
    if(entriesCount>0)
    return _changes;
    else return null;
};

/**
 * Applies changes form fdp 'push' entry, and updates changes object.
 * @param {string} xpid XPID of changed entry
 * @param {Object} changes Object with FDP changes.
 * @param {string} feedName Feed name
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.fillChange = function(xpid, changes, feedName) {
    this.collectFields(feedName, changes);
    var _changes = this.createChange(xpid);
    if(_changes.type!='delete') {
        _changes.type = 'change';
        for (var key in changes) {
            if (changes.hasOwnProperty(key)) {
                if (this.fieldPass(feedName, key, true)) {
                    _changes.entry[key] = changes[key];
                }
            }
        }
    }
    else {
        fjs.utils.Console.error('Change for deleted entry');
    }
    return _changes;
};
/**
 * Applies changes form fdp 'delete' entry, and updates changes object.
 * @param xpid XPID of deleted entry
 * @param feedName Feed name
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.fillDeletion= function(xpid, feedName) {
    var _changes = this.createChange(xpid);
    if(feedName==this.feedName) {
        _changes.type = 'delete';
        _changes.entry = null;
    }
    else {
        if(_changes.type == 'delete') return _changes;
        _changes.type = 'change';
        var nullValues = this.feedFields[feedName];
        if(nullValues) {
            if(this.items[xpid]) {
                for (var key in nullValues) {
                    if(nullValues.hasOwnProperty(key)) {
                        if(key in this.items[xpid]) {
                            delete this.items[xpid][key];
                            _changes.entry[key] = nullValues[key];
                        }
                    }
                }
            }
            else {
                fjs.utils.Console.error('Trying to remove unexisted element:', xpid);
            }
            if(fjs.utils.JSON.isEmpty(_changes.entry)) {
                delete this.changes[xpid];
                _changes = null;
                if(fjs.utils.JSON.isEmpty(this.changes)) {
                    this.changes = null;
                }
            }
        }
    }
    return _changes;
};

/**
 * @param {string} feedName
 * @param {string} fieldName
 * @param {string} saveXpid
 * @returns {boolean}
 * @private
 */
fjs.fdp.model.ProxyModel.prototype.fieldPass = function(feedName, fieldName, saveXpid) {
    if(feedName!=this.feedName) {
        return fieldName!=feedName+'_xef001id'
        && fieldName!=feedName+'_xef001iver'
        && fieldName!=feedName+'_xef001type'
        && fieldName!=feedName+'_xpid'
        && fieldName!=feedName+'_source'
        && (fieldName!='xpid' || saveXpid)
    }
    else {
        return (fieldName!='xpid' || saveXpid) && fieldName!='xef001id' && fieldName!='xef001iver' && fieldName!='xef001type' && fieldName!='source';
    }
};
/**
 * Collects field names from joined feeds, then to remove them if joined feed entry deleted
 * @param {string} feedName Feed name
 * @param {Object} entry FDP Feed entry
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.collectFields = function(feedName, entry) {
    if(feedName != this.feedName && !this.feedFields[feedName]) {
        this.feedFields[feedName] = {};
        for(var key in entry) {
            if(entry.hasOwnProperty(key)) {
                if(this.fieldPass(feedName, key, false)) {
                    this.feedFields[feedName][key] = null;
                }
            }
        }
    }
};
/**
 * Updates field names for joined feed as (feedName+"_"+fieldName)
 * @param {Object} entry
 * @param {string} feedName
 * @param {string} xpid
 * @returns {Object}
 * @private
 */
fjs.fdp.model.ProxyModel.prototype.prepareEntry = function(entry, feedName, xpid) {
    var preparedEntry = {}, key;
    var prefix = (feedName!=this.feedName ? (feedName + "_") : "");
        for(key in entry) {
            if (entry.hasOwnProperty(key)) {
                preparedEntry[prefix + key] = entry[key];
            }
        }
    preparedEntry.xpid = xpid;
    return preparedEntry;
};
/**
 * Handler of that entry has changed
 * @param {Object} event - Event object
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.onEntryChange = function(event) {
    /**
     * @type {fjs.fdp.model.EntryModel}
     */
    var item = this.items[event.xpid];
    var _entry = this.prepareEntry(event.entry, event.feed, event.xpid);
    if(!item) {
        var _change = this.fillChange(event.xpid, _entry, event.feed);
        if(_change.type != 'delete') {
            this.items[event.xpid] = new fjs.fdp.model.EntryModel(_entry);
        }
    }
    else {
        var changes = item.fill(_entry);
        if(changes)
        this.fillChange(event.xpid, changes, event.feed);
    }
    this.keepEntries[event.xpid] = event;
};
/**
 * Handler of that entry has deleted
 * @param {Object} event Event object
 */
fjs.fdp.model.ProxyModel.prototype.onEntryDeletion = function(event) {
    if(event.feed == this.feedName) {
        delete this.items[event.xpid];
    }
    this.fillDeletion(event.xpid, event.feed);
};
/**
 * Keep entry event.
 * @param {Object} event keep entry event object
 */
fjs.fdp.model.ProxyModel.prototype.onEntryKeep = function(event) {
    this.keepEntries[event.xpid] = event;
};


/**
 * Source complete event.
 * @param {Object} event source complete event object
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.onSourceComplete = function(event) {
    if(event.syncType==fjs.fdp.SyncManager.syncTypes.FULL || event.syncType==fjs.fdp.SyncManager.syncTypes.KEEP) {
        for(var key in this.items) {
            if(this.items.hasOwnProperty(key) && event.sourceId == this.items[key].source && !this.keepEntries[key]) {
                var _event = {eventType: fjs.fdp.SyncManager.eventTypes.ENTRY_DELETION, feed:event.feed, xpid: key, entry: null};
                this.onEntryDeletion(_event);
            }
        }
    }
    this.keepEntries = {};
};

/**
 * Clears all data for feed
 */
fjs.fdp.model.ProxyModel.prototype.clear = function() {
    this.changes = {};
    for(var xpid in this.items) {
        if(this.items.hasOwnProperty(xpid)) {
            this.changes[xpid] = {type:'delete', entry:null, xpid:xpid};
            delete this.items[xpid];
        }
    }
    this.onSyncComplete();
};

/**
 * Handler of SyncManager events
 * @param {Object} event Event object
 * @protected
 */
fjs.fdp.model.ProxyModel.prototype.onSyncEvent = function(event) {
    var eventTypes = fjs.fdp.SyncManager.eventTypes;
    switch(event.eventType) {
        case eventTypes.CLEAR:
            this.clear();
            break;
        case eventTypes.SYNC_START:
            break;
        case eventTypes.FEED_START:
            break;
        case eventTypes.SOURCE_START:
            break;
        case eventTypes.ENTRY_CHANGE:
            this.onEntryChange(event);
            break;
        case eventTypes.ENTRY_DELETION:
            this.onEntryDeletion(event);
            break;
        case eventTypes.ENTRY_KEEP:
            this.onEntryKeep(event);
            break;
        case eventTypes.SOURCE_COMPLETE:
            this.onSourceComplete(event);
            break;
        case eventTypes.FEED_COMPLETE:
            break;
        case eventTypes.SYNC_COMPLETE:
            this.onSyncComplete(event);
            break;
    }
};
/**
 * Sync iteration ends.
 * @private
 */
fjs.fdp.model.ProxyModel.prototype.onSyncComplete = function() {
    if(this.changes) {
        this.fireEvent({feed:this.feedName, changes:this.changes});
    }
    this.changes= null;
};

/**
 * Sends action to FDP server
 * @param {string} feedName Feed name
 * @param {string} actionName Action name
 * @param {Object} data Request parameters ({'key':'value',...})
 */
fjs.fdp.model.ProxyModel.prototype.sendAction = function(feedName, actionName, data){
    this.sm.sendAction(feedName, actionName, data);
};


namespace("fjs.fdp.model");
/**
 * Proxy model for client feeds
 * @param {Array.<string>} feeds List of joined feeds
 * @param {fjs.fdp.SyncManager} syncManager SynchronizationManager
 * @constructor
 * @extends fjs.fdp.model.ProxyModel
 */
fjs.fdp.model.ClientFeedProxyModel = function(feeds, syncManager) {
    fjs.fdp.model.ProxyModel.call(this, feeds, syncManager);
    var context = this;
    this.clientFeedName = feeds[feeds.length-1];

    var onSyncEvent = function(data) {
        context.onSyncEvent(data);
    };
    /**
     * Adds listeners to sync manager. <br>
     * That action initiates synchronization for this feeds
     * @private
     */
    this.attach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.addFeedListener(this.feeds[i], onSyncEvent, this.feeds[i]== this.clientFeedName);
        }
    };
    /**
     * Removes listeners from sync manager <br>
     * That action ends syncronization for this feeds
     * @private
     */
    this.detach = function() {
        for(var i = 0; i<this.feeds.length; i++) {
            this.sm.removeFeedListener(this.feeds[i], onSyncEvent, this.feeds[i]== this.clientFeedName);
        }
    };
};
fjs.fdp.model.ClientFeedProxyModel.extend(fjs.fdp.model.ProxyModel);

/**
 * Creates simulated FDP sync object
 * @param {string} syncType synchronization type ('full'|'lazy'|'keep')
 * @param {fjs.fdp.model.EntryModel} entry model item.
 * @returns {Object}
 * @private
 */
fjs.fdp.model.ClientFeedProxyModel.prototype.createSyncData = function(syncType, entry) {
    var syncData = {};
    entry.xef001type = syncType;
    syncData[this.clientFeedName] = {
        "": {
            "items":[entry]
            , xef001type: "L"
        }
    };
    return syncData;
};
/**
 * Sync iteration ends.
 * @private
 */
fjs.fdp.model.ClientFeedProxyModel.prototype.onSyncComplete = function() {
    if(this.changes) {
        this.fireEvent({feed:this.clientFeedName, changes:this.changes});
    }
    this.changes= null;
};

/**
 * Sends action to FDP server
 * @param {string} feedName Feed name
 * @param {string} actionName Action name ('push' or 'delete')
 * @param {Object} data Request parameters ({'key':'value',...})
 * @param {boolean} notBroadcast
 */
fjs.fdp.model.ClientFeedProxyModel.prototype.sendAction = function(feedName, actionName, data, notBroadcast) {
    if(actionName==='push' || actionName==='delete') {
        var syncData = this.createSyncData(actionName, data);
        this.sm.onClientSync(fjs.utils.JSON.stringify(syncData), notBroadcast);
    }
    else {
        fjs.fdp.model.ProxyModel.prototype.sendAction.call(this, this.feedName, actionName, data);
    }
};
/**
 * Handler of that entry has deleted
 * @param {Object} event Event object
 */
fjs.fdp.model.ClientFeedProxyModel.prototype.onEntryDeletion = function(event) {
    if(event.feed == this.feedName) {
        delete this.items[event.xpid];
    }
    this.fillDeletion(event.xpid, event.feed);
};

/**
 * Adds event handler function to feed changes
 * @param {Function} listener handler function
 */
fjs.fdp.model.ClientFeedProxyModel.prototype.addListener = function(listener) {
    var index = this.listeners.indexOf(listener);
    if(index<0) {
        this.listeners.push(listener);
        var changes = this.createFullChange();
        if(changes) {
            listener({feed: this.clientFeedName, changes:changes});
        }
        if(!this._attached) {
            this.attach();
            this._attached = true;
        }
    }
    else {
        fjs.utils.Console.warn("Trying to add duplicated listener");
    }
};

/**
 * Collects field names from joined feeds, then to remove them if joined feed entry deleted
 * @param {string} feedName Feed name
 * @param {Object} entry FDP Feed entry
 * @protected
 */
fjs.fdp.model.ClientFeedProxyModel.prototype.collectFields = function(feedName, entry) {
    if(feedName != this.feedName) {
        if(!this.feedFields[feedName]) {
            this.feedFields[feedName] = {};
        }
        for(var key in entry) {
            if(entry.hasOwnProperty(key)) {
                if(this.fieldPass(feedName, key, false)) {
                    this.feedFields[feedName][key] = null;
                }
            }
        }
    }
};

/**
 * Handler of that entry has changed
 * @param {Object} event - Event object
 * @protected
 */
fjs.fdp.model.ClientFeedProxyModel.prototype.onEntryChange = function(event) {
    /**
     * @type {fjs.fdp.model.EntryModel}
     */
    var item = this.items[event.xpid];
    var _entry = this.prepareEntry(event.entry, event.feed, event.xpid);
    if(!item) {
        if(event.feed==this.clientFeedName && this.clientFeedName!=this.feedName) {
            return;
        }
        var _change = this.fillChange(event.xpid, _entry, event.feed);
        if(_change.type != 'delete') {
            this.items[event.xpid] = new fjs.fdp.model.EntryModel(_entry);
        }
    }
    else {
        var changes = item.fill(_entry);
        if(changes)
            this.fillChange(event.xpid, changes, event.feed);
    }
    this.keepEntries[event.xpid] = event;
};namespace("fjs.fdp.model");
/**
 * Proxy model for client feeds
 * @param {Array.<string>} feeds List of joined feeds
 * @param {fjs.fdp.SyncManager} syncManager SynchronizationManager
 * @constructor
 * @extends fjs.fdp.model.ClientFeedProxyModel
 */
fjs.fdp.model.MyCallsClientProxyModel = function(feeds, syncManager) {
    fjs.fdp.model.ClientFeedProxyModel.call(this, feeds, syncManager);
    this.callLogByHTCallId = {};
};
fjs.fdp.model.MyCallsClientProxyModel.extend(fjs.fdp.model.ClientFeedProxyModel);


/**
 * Handler of that entry has changed
 * @param {Object} event - Event object
 * @protected
 */
fjs.fdp.model.MyCallsClientProxyModel.prototype.onEntryChange = function(event) {
    /**
     * @type {fjs.fdp.model.EntryModel}
     */
    var item = this.items[event.xpid];
    var _entry = this.prepareEntry(event.entry, event.feed, event.xpid);
    if(!item) {
        if(event.feed==this.clientFeedName && this.clientFeedName!=this.feedName) {
            return;
        }
        var _change = this.fillChange(event.xpid, _entry, event.feed);
        if(_change.type != 'delete') {
            this.items[event.xpid] = new fjs.fdp.model.EntryModel(_entry);
        }
    }
    else {
        var changes = item.fill(_entry);
        if(changes)
            this.fillChange(event.xpid, changes, event.feed);
    }
    this.keepEntries[event.xpid] = event;
};

/**
 * Handler of that entry has deleted
 * @param {Object} event Event object
 */
fjs.fdp.model.MyCallsClientProxyModel.prototype.onEntryDeletion = function(event) {
    if(event.feed == this.feedName) {
        var delItem = this.items[event.xpid];
        this.sendAction(this.clientFeedName, 'delete', {xpid: event.xpid}, true);
        if(delItem) {
            this.callLogByHTCallId[delItem.htCallId] = delItem['mycallsclient_callLog'];
            delete this.items[event.xpid];
        }
    }
    this.fillDeletion(event.xpid, event.feed);
};

/**
 * Sync iteration ends.
 * @private
 */
fjs.fdp.model.MyCallsClientProxyModel.prototype.onSyncComplete = function() {
    var itemsKeys = Object.keys(this.items);
    for(var i=0; i<itemsKeys.length; i++) {
        var key = itemsKeys[i], _htCallId = this.items[key].htCallId, callLog = this.callLogByHTCallId[_htCallId];
        if(callLog) {
            this.sendAction(this.clientFeedName, 'push', {callLog:callLog, xpid:key});
        }
    }
    if(this.changes) {
        this.fireEvent({feed:this.clientFeedName, changes:this.changes});
    }
    this.changes= null;
    this.callLogByHTCallId = {};
};(function() {
    namespace("fjs.fdp.transport");
    /**
     * Transport to communicate with FDP server <br>
     * Base class of all transports. <br>
     * All transports provide a single interface to work with FDP server it can be Ajax, WebSockets or LocalStorage synchronization.
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @constructor
     * @extends fjs.EventsSource
     * @abstract
     */
    fjs.fdp.transport.FDPTransport = function (ticket, node, url) {
        fjs.EventsSource.call(this);
        /**
         * Auth ticket
         * @type {string}
         */
        this.ticket = ticket;
        /**
         * Node ID
         * @type {string}
         */
        this.node = node;
        /**
         * FDP server URL
         * @type {string}
         */
        this.url = url;
    };
    fjs.fdp.transport.FDPTransport.extend(fjs.EventsSource);


    /**
     *  This method provides all actions to works with simple FDP syncronization.
     *  Exist 3 message types:
     *  <ul>
     *      <li>
     *          'action' - sends action to FDP server
     *      </li>
     *      <li>
     *          'synchronize' - starts syncronization for list of feeds
     *      </li>
     *      <li>
     *          'forget' - ends suncronization for feed
     *      </li>
     *  </ul>
     * @param {Object} message - Action message
     * @abstract
     */
    fjs.fdp.transport.FDPTransport.prototype.send = function (message) {

    };

    /**
     * Ends syncronization throws this transport
     * @abstract
     */
    fjs.fdp.transport.FDPTransport.prototype.close = function() {};
})();(function() {
    namespace("fjs.fdp.transport");
    /**
     * Base class of all FDPTransports based on AJAX.
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @param {string} type - Client type
     * @constructor
     * @extends fjs.fdp.transport.FDPTransport
     * @abstract
     */
    fjs.fdp.transport.AJAXTransport = function(ticket, node, url, type) {

        fjs.fdp.transport.FDPTransport.call(this, ticket, node, url);
        /**
         * Ajax provider
         * @type {fjs.ajax.IAjaxProvider}
         * @protected
         */
        this.ajax = null;



        this.type = type;
        /**
         * @type {Array.<string>}
         * @private
         */
        this._forgetFeeds = [];
        /**
         * @type {number}
         * @private
         */
        this._clientRegistryFailedCount = 0;
        /**
         * @private
         */
        this._currentVersioncache = null;

        /**
         * @private
         */
        this._currentRequest = null;
        /**
         * Versions servlet URL
         * @const {string}
         * @protected
         */
        this.VERSIONS_PATH = "/v1/versions";
        /**
         * Versionscache servlet URL
         * @const {string}
         * @protected
         */
        this.VERSIONSCACHE_PATH = "/v1/versionscache";
        /**
         * Client registry servlet URL
         * @const {string}
         * @protected
         */
        this.CLIENT_REGISRY_PATH = "/accounts/ClientRegistry";
        /**
         * Sync servlet URL
         * @const {string}
         * @protected
         */
        this.SYNC_PATH = "/v1/sync";

        this.SF_LOGIN_PATH = "/accounts/salesforce";


        /**
         * Transport is stoped
         * @type {boolean}
         * @protected
         */
        this.closed = false;

        /**
         * @type {number}
         * @private
         */
        this.versionsCacheFailedCount = 0;

        this.isNetworkProblem = true;

    };
    fjs.fdp.transport.AJAXTransport.extend(fjs.fdp.transport.FDPTransport);

    /**
     * Sends request use self ajax provider
     * @param {string} url Request URL
     * @param {Object} data Request data
     * @param {Function} callback Success handler
     * @abstract
     */
    fjs.fdp.transport.AJAXTransport.prototype.sendRequest = function (url, data, callback) {

    };

    fjs.fdp.transport.AJAXTransport.prototype.handleRequestErrors = function(request, isOk) {
        if(!isOk && request.status==0 && !request["aborted"]) {
            this.fireEvent('error', {type:'networkProblem'});
            this.isNetworkProblem = true;
            return;
        }
        else if(!isOk) {
            var event = {type:'requestError', requestUrl:request.url, message: (request.responseText || 'Request failed'), status:request.status};
            this.fireEvent('error', event);
            fjs.utils.Console.error(event);
        }
        if(this.isNetworkProblem) {
            this.fireEvent('message', {type:'connectionEstablished'});
            this.isNetworkProblem = false;
        }
    };

    /**
     *  This method provides all actions to works with simple FDP synchronization.
     *  Exist 3 message types:
     *  <ul>
     *      <li>
     *          'action' - sends action to FDP server
     *      </li>
     *      <li>
     *          'synchronize' - starts synchronisation for list of feeds
     *      </li>
     *      <li>
     *          'forget' - ends synchronization for feed
     *      </li>
     *  </ul>
     * @param {Object} message - Action message
     * @abstract
     */
    fjs.fdp.transport.AJAXTransport.prototype.send = function(message) {
        switch(message.type) {
            case 'action':
                this.sendAction(message.data.feedName, message.data.actionName, message.data.parameters);
                break;
            case 'loadNext':
                this.loadNext(message);
                break;
            case 'synchronize':
                this.requestVersions(message.data.versions);
                break;
            case 'forget':
                this._forgetFeed(message.data.feedName);
                break;
            case 'SFLogin':
                this.SFLogin(message.data);
                break;
        }
    };

    fjs.fdp.transport.AJAXTransport.prototype.SFLogin = function(data){
        var context = this;
        this._currentRequest = this.sendRequest(this.url+this.SF_LOGIN_PATH, data, function(xhr, data, isOk){
            try  {
            if(isOk) {
                  var _data = fjs.utils.JSON.parse(data), ticket, node;
                  if(_data && (ticket = _data["Auth"]) && (node = _data["node"])) {
                          context.fireEvent('message', {type: 'node', data: {nodeId: (context.node = node)}});
                          context.fireEvent('message', {type: 'ticket', data: {ticket: (context.ticket = ticket)}});
                  }
                  else {
                      context.fireEvent('error', {type:'authError', message:"Can't get ticket or node"});
                  }
              }
              else if(xhr.status == 403 || xhr.status == 401) {
                  context.fireEvent('error', {type:'authError', message:(data ? data.replace('Error=', '') : "Wrong auth data")});
              }
              context.handleRequestErrors(xhr, isOk);
            } catch (e) {
                context.fireEvent('error', {type:'authError', message:"Can't get ticket or node"});
            }
          });
    };

    fjs.fdp.transport.AJAXTransport.prototype.loadNext = function(message) {
        var _data = message.data, context = this;
        this._currentRequest = this.sendRequest(this.url+"/v1/history/"+_data.feedName, _data.data, function(xhr, data, isOk) {
            if(isOk) {
                data = fjs.utils.JSON.parse(data);
                var syncData = {};
                syncData[_data.feedName] = data;

                for (var key in data) {
                    if(data.hasOwnProperty(key)) {
                        data[key].filter = _data.data["sh.filter"];
                    }
                }
                context.fireEvent('message', {type: 'sync', data: syncData});
            }
            context.handleRequestErrors(xhr, isOk);
        });
    };

    /**
     * @param feedName
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype._forgetFeed = function(feedName) {
        if(this._forgetFeeds.indexOf(feedName)<0)  {
            this._forgetFeeds.push(feedName);
        }
    };

    /**
     * @param {string} data
     * @returns {Object}
     */
    fjs.fdp.transport.AJAXTransport.prototype.parseClientRegistryResponse= function(data) {
        var dataArr = data.split('\n');
        var result = {};
        for(var i=0; i<dataArr.length; i++) {
            if(dataArr[i].indexOf("=")>-1) {
                var itemArr = dataArr[i].split("=");
                var key = itemArr[0].trim();
                var val = itemArr[1].trim();
                if(key && val) {
                    result[key] = val;
                }
            }
        }
        return result;
    };



    /**
     * ClientRegistry request
     * @param callback
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.requestClientRegistry = function(callback) {
        /**
         * @type {fjs.fdp.transport.AJAXTransport}
         */
        var context = this;
        var url = this.url+this.CLIENT_REGISRY_PATH;
        this._currentRequest = this.sendRequest(url, {}, function(request, data, isOk) {
            if(isOk) {
                context._clientRegistryFailedCount = 0;
                var _data = context.parseClientRegistryResponse(data), node = _data["node"];
                if(node) {
                    context.fireEvent('message', {type:'node', data:{nodeId:(context.node = node)}});
                    callback(data);
                }
            }
            else {
                if(request.status == 403 || request.status == 401) {
                    callback(false);
                    context.fireEvent('error', {type:'authError', message:'Auth ticket wrong or expired'});
                }
                else {
                    if(context._clientRegistryFailedCount < 10) {
                        context._clientRegistryFailedCount++;
                        context.requestClientRegistry(callback);
                    }
                    else {
                        callback(false);
                    }
                }
            }
            context.handleRequestErrors(request, isOk);
        });
    };
    /**
     * Versionscache request
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.requestVersionscache = function() {
        var context = this;
        var url = this.url+this.VERSIONSCACHE_PATH;
        this._currentRequest = this._currentVersioncache = this.sendRequest(url, null, function(request, data, isOk) {
            if(isOk) {
                context._clientRegistryFailedCount = 0;
                var feeds = context.parseVersionsResponse(data);
                if(feeds) {
                    context.syncRequest(feeds);
                }
                else {
                    context.requestVersionscache();
                }
            }
            else {
                if(request.status == 401 || request.status == 403) {
                    context.requestClientRegistry(function(isOK) {
                        if(isOK) {
                            context.requestVersionscache();
                        }
                    });
                }
                else if(!request["aborted"]) {
                    if (context._clientRegistryFailedCount < 5) {
                        context.requestVersionscache();
                        context._clientRegistryFailedCount++;
                    }
                    else if (context._clientRegistryFailedCount >= 5) {
                        setTimeout(function () {
                            context.requestVersionscache();
                        }, 5000);
                    }
                }
            }
            context.handleRequestErrors(request, isOk);
        });
    };

    /**
     * Sync request
     * @param {Object} feeds
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.syncRequest = function(feeds) {
        var context = this, url = this.url+this.SYNC_PATH;
        this._currentRequest = this.sendRequest(url, feeds, function(xhr, data, isOK) {
            if(isOK) {
                data = fjs.utils.JSON.parse(data);
                context.fireEvent('message', {type: 'sync', data:data});
                context.requestVersionscache();
            }
            else {
                context.requestVersionscache();
            }
            context.handleRequestErrors(xhr, isOK);
        });
    };


    /**
     * @param {string} data
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.parseVersionsResponse = function(data) {
        //TODO: parse db and server versions;
        var params = data.split(";"), feeds = {}, feedsCount = 0, forgetFeedIndex;
        if(params) {
            var fdpTime = params[0];
            this.fireEvent("message", {type: "fdpTime", data: fdpTime});

            for(var i=2; i<params.length-1; i++) {
                if(params[i]) {
                    if((forgetFeedIndex = this._forgetFeeds.indexOf(params[i]))<0) {
                        feeds[params[i]] = "";
                    }
                    else {
                        this._forgetFeeds.splice(forgetFeedIndex, 1);
                    }
                    feedsCount++;
                }
            }
        }
        return feedsCount ? feeds : null;
    };

    /**
     * Versions request
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.requestVersions = function(versions) {
        var context = this;
        if(this._currentVersioncache!=null) {
            this.ajax.abort(this._currentVersioncache);
        }
        if(!this.node) {
            return this.requestClientRegistry(function(isOk) {
                if(isOk) {
                    context.requestVersions(versions);
                }
            });
        }

        var url = this.url+this.VERSIONS_PATH;

        this._currentVersioncache = this._currentRequest = this.sendRequest(url, versions, function(xhr, data, isOk) {
            if(isOk) {
                var feeds = context.parseVersionsResponse(data);
                if(feeds) {
                    context.syncRequest(feeds);
                }
                else {
                    context.requestVersionscache();
                }
            }
            else {
                if(xhr.status == 401 || xhr.status == 403) {
                    context.requestClientRegistry(function(isOk) {
                        if(isOk) {
                            context.requestVersions(versions);
                        }
                    });
                }
            }
            context.handleRequestErrors(xhr, isOk);
        });
    };
    /**
     * Sends action to FDP server
     * @param {string} feedName Feed name
     * @param {string} actionName Action name
     * @param {Object} parameters Request parameters ({'key':'value',...})
     */
    fjs.fdp.transport.AJAXTransport.prototype.sendAction = function(feedName, actionName, parameters) {
        var context = this;
        var data = {
            action:actionName
        };
        for(var key in parameters) {
            if(parameters.hasOwnProperty(key)) {
                data["a."+key] = parameters[key];
            }
        }
        this.sendRequest(this.url+"/v1/"+feedName, data, function(xhr, response, isOK){
            context.handleRequestErrors(xhr, isOK);
            if(isOK) {

            }
            else {
                if(xhr.status == 401 || xhr.status == 403) {
                    context.requestClientRegistry(function(isOK) {
                        if(isOK) {
                            context.sendAction(feedName, actionName, parameters);
                        }
                    });
                }
            }
        });
    };

    /**
     * Ends synchronization throws this transport
     * @abstract
     */
    fjs.fdp.transport.AJAXTransport.prototype.close = function() {
        this.closed = true;
        if(this._currentRequest) {
            this.ajax.abort(this._currentRequest);
        }
    };
})();(function() {
    namespace("fjs.fdp");
    /**
     * FDPTransport based on XHRAjax (XMLHTTPRequest)
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @param {string} type Client type
     * @constructor
     * @extends fjs.fdp.transport.AJAXTransport
     */
    fjs.fdp.transport.XHRTransport = function(ticket, node, url, type) {
        fjs.fdp.transport.AJAXTransport.call(this, ticket, node, url, type);
        /**
         * @type {fjs.ajax.XHRAjax}
         */
        this.ajax = new fjs.ajax.XHRAjax();
    };
    fjs.fdp.transport.XHRTransport.extend(fjs.fdp.transport.AJAXTransport);

    /**
     * Sends ajax request use XMLHTTPRequest
     * @param {string} url Request URL
     * @param {Object} data Request data
     * @param {Function} callback Success handler
     */
    fjs.fdp.transport.XHRTransport.prototype.sendRequest = function (url, data, callback) {
        if(this.closed) {
            return null;
        }
        if(fjs.utils.Browser.isSafari()) {
            url += (/\?/.test(url) ? '&safariNoCaсhe=' : '?safariNoCaсhe=') + Date.now();
        }
        data = data || {};
        data["t"] = this.type;
        data["alt"] = 'j';
        var headers = {Authorization: "auth="+this.ticket, node: this.node || ""};
        var xhr = this.ajax.send('post', url, headers, data, callback);
        xhr.url = url;
        return xhr;
    };
})();(function() {
    namespace("fjs.fdp");
    /**
     * FDPTransport based on XDRAjax (XDomainRequest)
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @param {string} type Client type
     * @constructor
     * @extends fjs.fdp.transport.AJAXTransport
     */

    fjs.fdp.transport.XDRTransport = function(ticket, node, url, type) {
        fjs.fdp.transport.AJAXTransport.call(this, ticket, node, url, type);
        /**
         * @type {fjs.ajax.XHRAjax}
         */
        this.ajax = new fjs.ajax.XDRAjax();
        this.iframeAjax = new fjs.ajax.IFrameAjax(url+"/v1/CrossDomain");
    };
    fjs.fdp.transport.XDRTransport.extend(fjs.fdp.transport.AJAXTransport);

    /**
     * Sends ajax request use XDomainRequest
     * @param {string} url Request URL
     * @param {Object} data Request data
     * @param {Function} callback Success handler
     */
    fjs.fdp.transport.XDRTransport.prototype.sendRequest = function (url, data, callback) {
        var context = this;
        if(this.closed) {
            return null;
        }
        data = data || {};
        data["t"] = this.type;
        data["alt"] = 'j';
        var headers = {Authorization: this.ticket, node:this.node};
        var xdr = this.ajax.send('post', url, headers, data, function(request, responseText, isOK){
            if(!isOK) {
                context.iframeAjax.send('post', url, headers, data, callback);
            }
            else {
                callback.apply(this, arguments);
            }
        });
        xdr.url = url;
        return xdr;
    };
})();(function() {
    namespace("fjs.fdp.transport");
    /**
     * FDPTransport based on IFrameAjax
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @param {string} type Client type
     * @param {string} iframeUrl Crossdomain page url
     * @constructor
     * @extends fjs.fdp.transport.AJAXTransport
     */
    fjs.fdp.transport.IFrameTransport = function(ticket, node, url, type, iframeUrl) {
        fjs.fdp.transport.AJAXTransport.call(this, ticket, node, url, type);
        /**
         * @type {fjs.ajax.XHRAjax}
         */
        this.ajax = new fjs.ajax.IFrameAjax(iframeUrl);
    };
    fjs.fdp.transport.IFrameTransport.extend(fjs.fdp.transport.AJAXTransport);

    /**
     * Sends request use self ajax provider
     * @param {string} url Request URL
     * @param {Object} data Request data
     * @param {Function} callback Success handler
     */
    fjs.fdp.transport.IFrameTransport.prototype.sendRequest = function (url, data, callback) {
        if(this.closed) {
            return null;
        }
        data = data || {};
        data["t"] = this.type;
        data["alt"] = 'j';
        var headers = {Authorization: "auth="+this.ticket, node:this.node};
        return this.ajax.send('post', url, headers, data, callback);
    };
})();(function(){
    namespace("fjs.fdp.transport");
    /**
     * This transport receives data form other tab via localStorage
     * @constructor
     * @extends fjs.fdp.transport.FDPTransport
     */
    fjs.fdp.transport.LocalStorageTransport = function() {
        var context = this;
        fjs.fdp.transport.FDPTransport.call(this);

        this.tabsSynchronizer = new fjs.api.TabsSynchronizer();

        this.onStorage = function(e) {
            if(e.key.indexOf('lsp_')>-1) {
                var eventType = e.key.replace('lsp_', '');
                context.fireEvent(eventType, fjs.utils.JSON.parse(e.newValue));
            }
        };

        if(fjs.utils.Browser.isIE11()) {
            this.tabsSynchronizer.addEventListener('lsp_message', this.onStorage);
            this.tabsSynchronizer.addEventListener('lsp_error', this.onStorage);
            this.tabsSynchronizer.addEventListener('lsp_clientSync', this.onStorage);
            this.tabsSynchronizer.addEventListener('lsp_action', this.onStorage);
        }
        else {
            window.addEventListener('storage', this.onStorage, false);
        }
    };
    fjs.fdp.transport.LocalStorageTransport.extend(fjs.fdp.transport.FDPTransport);

    /**
     *  This method provides all actions to works with simple FDP synchronization.
     *  Exist 3 message types:
     *  <ul>
     *      <li>
     *          'action' - sends action to FDP server
     *      </li>
     *      <li>
     *          'synchronize' - starts syncronization for list of feeds
     *      </li>
     *      <li>
     *          'forget' - ends suncronization for feed
     *      </li>
     *  </ul>
     * @param {Object} message - Action message
     * @abstract
     */
    fjs.fdp.transport.LocalStorageTransport.prototype.send = function (message) {
        if(fjs.utils.Browser.isIE11()) {
            this.tabsSynchronizer.setSyncValue('lsp_'+message.type, fjs.utils.JSON.stringify(message.data));
        }
        else {
            message.data.t = Date.now();
            fjs.utils.LocalStorage.set('lsp_' + message.type, fjs.utils.JSON.stringify(message.data));
        }
    };

    /**
     * Closes (destroy) this transport
     */
    fjs.fdp.transport.LocalStorageTransport.prototype.close = function() {
        window.removeEventListener('storage', this.onStorage, false);
        this.tabsSynchronizer.removeEventListener('lsp_message', this.onStorage);
        this.tabsSynchronizer.removeEventListener('lsp_error', this.onStorage);
        this.tabsSynchronizer.removeEventListener('lsp_clientSync', this.onStorage);
        this.tabsSynchronizer.removeEventListener('lsp_action', this.onStorage);
    };

    /**
     * Broadcasts message to all tabs using localStorage transport.
     * @param {string} messageType
     * @param {*} messageData
     * @static
     */
    fjs.fdp.transport.LocalStorageTransport.masterSend = function(messageType, messageData) {
        if(fjs.utils.Browser.isIE11()) {
            new fjs.api.TabsSynchronizer().setSyncValue('lsp_'+messageType, fjs.utils.JSON.stringify(messageData));
        }
        messageData.t = Date.now();
        fjs.utils.LocalStorage.set('lsp_'+messageType, fjs.utils.JSON.stringify(messageData));
    };
})();(function(){

    /**
     *
     * @constructor
     */
    fjs.fdp.transport.TransportFactory = function() {

    };
    /**
     * @param {string} ticket
     * @param {string} node
     * @param {string} url
     * @param {string } type
     * @returns {fjs.fdp.transport.FDPTransport}
     * @static
     */
    fjs.fdp.transport.TransportFactory.getTransport = function(ticket, node, url, type) {
        var is_main;
        if(!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization()) {
            return new fjs.fdp.transport.XHRTransport(ticket, node, url, type);
        }
        else {
            is_main = new fjs.api.TabsSynchronizer().isMaster;
        }
        if(is_main!=null) {
            if(!is_main) {
                return new fjs.fdp.transport.LocalStorageTransport();
            }
            else {
                this._getBrowserSpecifiedTransport(ticket, node, url, type);
            }
        }
        return this._getBrowserSpecifiedTransport(ticket, node, url, type);
    };
    /**
     * @private
     * @returns {fjs.fdp.transport.FDPTransport}
     */
    fjs.fdp.transport.TransportFactory._getBrowserSpecifiedTransport = function(ticket, node, url, type) {

        if(fjs.utils.Browser.isIE() && fjs.utils.Browser.getIEVersion() < 10) {
            return new fjs.fdp.transport.XDRTransport(ticket, node, url, type);
        }
        else {
            return new fjs.fdp.transport.XHRTransport(ticket, node, url, type);
        }
    };
    fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization = function() {
        return typeof window !== 'undefined' && window.document !== undefined || (self && self["web_worker"]);
    };
})();(function(){
    namespace("fjs.fdp");
    /**
     * <p>
     *     Synchronization manager. Main logic of synchronization with FDP server.
     * <p>
     * <p>
     *      It starts synchronization loop, receives required fdp data, sends actions to FDP server.
     * </p>
     * <b>Singleton</b>
     * @param {Object} config Properties object
     * @constructor
     * @extends fjs.EventsSource
     */
    fjs.fdp.SyncManager = function(config) {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;

        fjs.EventsSource.call(this);

        this.dbFactory = new fjs.db.DBFactory(config);
        this.db = this.dbFactory.getDB();
        this.syncs = [];

        this.runtimefeeds=['mycalldetails', 'mycalls'];
        /**
         * Current SyncManager state
         * @type {fjs.fdp.SyncManager.states|number}
         */
        this.status = sm.states.NOT_INITIALIZED;

        /**
         * @type {Object}
         * @private
         */
        this.config = config;

        /**
         * Transport to communicate with FDP server
         * @type {fjs.fdp.transport.FDPTransport}
         */
        this.transport = null;
        this.syncTimeoutId = null;

        /**
         * @dict
         * @private
         */
        this.versions = {};
        /**
         * @dict
         * @private
         */
        this.historyversions = {};
        /**
         * Auth ticket
         * @type {string}
         */
        this.ticket = null;
        /**
         * Node Id
         * @type {string}
         */
        this.node = null;
        /**
         * URl to FDP server
         * @type {string}
         */
        this.serverHost = this.config.SERVER.serverURL;

        this.type = this.config.CLIENT.type;
        /**
         * @type {Array}
         * @private
         */
        this.syncFeeds = [];
        /**
         * @type {Array}
         * @private
         */
        this.suspendFeeds=[];
        this.suspendActions = [];
        this.suspendClientSyncs = [];

        /**
         *
         * @type {Array}
         */
        this.suspendClientFeeds = [];
        /**
         * @type {Array}
         * @private
         */
        this.versionsFeeds = [];
        /**
         * @type {?number}
         * @private
         */
        this.versionsTimeoutId = null;

        this.feeds = [];

        /**
         *
         * @type {fjs.api.TabsSynchronizer}
         * @private
         */
        this.tabsSyncronizer = null;

        this.suspendLoginData = null;
    };

    fjs.fdp.SyncManager.extend(fjs.EventsSource);

    var sm = fjs.fdp.SyncManager;

    /**
     * <b>Enumerator</b> <br/> SyncManager states
     * @enum {number}
     */
    fjs.fdp.SyncManager.states = {
        /**
         * SyncManager not initialized. To start initialization you should call .init(ticket, node, callback) method;
         */
        'NOT_INITIALIZED':-1,
        /**
         * SyncManager is in the process of initialization;
         */
         'INITIALIZATION':0,
        /**
         * SyncManager initialized and ready to work.
         */
        'READY':1
    };

    /**
     * <b>Enumerator</b> <br/>
     * Sync manager event types
     * @enum {string}
     */
    fjs.fdp.SyncManager.eventTypes = {
        /**
         * Start of receiving (parsing) FDP sync data
         */
        'SYNC_START': 'syncStart',
        /**
         * End of receiving (parsing) FDP sync data
         */
        'SYNC_COMPLETE': 'syncComplete',
        /**
         * Start of parsing sync data for specified feed
         */
        'FEED_START': 'feedStart',
        /**
         * End of parsing data for specified feed
         */
        'FEED_COMPLETE': 'feedComplete',
        /**
         * Start of parsing data for specified data source
         */
        'SOURCE_START': 'sourceStart',
        /**
         * End of parsing data for specified data source
         */
        'SOURCE_COMPLETE': 'sourceComplete',
        /**
         * Entry was added or changed
         */
        'ENTRY_CHANGE': 'push',
        /**
         * Entry was deleted
         */
        'ENTRY_DELETION': 'delete',
        /**
         * Entry should be keeped
         */
        'ENTRY_KEEP': 'keep',

        'CLEAR': 'clear'
};

    /**
     * <b>Enumerator</b> <br/>
     * FDP sync types
     * @enum {string}
     */
    fjs.fdp.SyncManager.syncTypes = {
        /**
         * Full sync, need to remove all previous data entries
         */
        'FULL':'F',
        /**
         * Keep sync, need to remove previous data entries except with status 'keep'
         */
        'KEEP':'I',
        /**
         * Lazy sync, need apple received changes only
         */
        'LAZY':'L',
        /**
         * History sync, part fo feed history was downloaded
         */
        'HISTORY':'H'
    };



    /**
     * Initializes Synchronization Manager
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {Function} callback Method to execute when SyncManager initialized
     */
    fjs.fdp.SyncManager.prototype.init = function(ticket, node, callback) {
        var context = this;
        /**
         * @type {states}
         */
        this.status = sm.states.INITIALIZATION;
        this.ticket = ticket;
        this.node = node;

        if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization()) {
            this.tabsSyncronizer = new fjs.api.TabsSynchronizer();
            if(fjs.utils.Browser.isIE11()) {
                this.tabsSyncronizer.addEventListener('lsp_clientSync', function (e) {
                    context.onStorage(e)
                });
                this.tabsSyncronizer.addEventListener('lsp_message', function (e) {
                    context.onStorage(e)
                });
                this.tabsSyncronizer.addEventListener('lsp_error', function (e) {
                    context.onStorage(e)
                });
                this.tabsSyncronizer.addEventListener('lsp_action', function (e) {
                    context.onStorage(e)
                });
            }
            else {
                self.addEventListener('storage', function (e) {
                    context.onStorage(e)
                }, false);
            }
            this.tabsSyncronizer.addEventListener('master_changed', function(){
                context.onMasterChanged();
            });
        }
        this.transport = fjs.fdp.transport.TransportFactory.getTransport(this.ticket, this.node, this.serverHost, this.type);
        this.addTransportEvents();
        this.initDataBase(callback);
    };

    fjs.fdp.SyncManager.prototype.onMasterChanged = function() {
        this.transport.close();
        this.transport = fjs.fdp.transport.TransportFactory.getTransport(this.ticket, this.node, this.serverHost, this.type);
        this.addTransportEvents();
        clearTimeout(this.versionsTimeoutId);
        this.startSync(this.syncFeeds);
    };

    fjs.fdp.SyncManager.prototype.onStorage = function(e) {
        if(e.key.indexOf('lsp_')>-1) {
            var eventType = e.key.replace('lsp_', '');
            if(new fjs.api.TabsSynchronizer().isMaster) {
                var obj = fjs.utils.JSON.parse(e.newValue);
                if(eventType == "clientSync") {
                    this.onClientSync(obj.data);
                }
                else {
                    this.transport.send({type:eventType, data:obj});
                }
            }
        }
    };

    fjs.fdp.SyncManager.prototype.addTransportEvents = function() {
        var context = this;
        this.transport.addEventListener('message', function(e){
            if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && new fjs.api.TabsSynchronizer().isMaster) {
                fjs.fdp.transport.LocalStorageTransport.masterSend('message', e);
            }
            switch(e.type) {
                case 'sync':
                    context.onSync(e.data);
                    break;
                    context.fireEvent('node', e);
                    break;
                case 'ticket':
                    context.fireEvent('ticket', e);
                    context.startSync(context.syncFeeds);
                    break;
                case sm.eventTypes.CLEAR:
                    context.fireEvent(null, {eventType: sm.eventTypes.CLEAR});
                    break;
                default:
                    context.fireEvent(e.type, e);
                    break;
            }
        });
        this.transport.addEventListener('error', function(e){
            if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && new fjs.api.TabsSynchronizer().isMaster) {
                fjs.fdp.transport.LocalStorageTransport.masterSend('error', e);
            }
            switch(e.type) {
                default:
                    context.fireEvent(e.type, e);
            }
        });
    };

    /**
     * @param {Function} callback
     * @private
     */
    fjs.fdp.SyncManager.prototype.initDataBase = function(callback) {
        if(this.db) {
            /**
             * Open DB
             */
            this.openDB(callback);
        }
        else {
            this.finishInitialization(callback);
        }
    };

    fjs.fdp.SyncManager.prototype.openDB = function(callback) {
        var context = this;
        for(var i=0; i<this.config.DB.tables.length; i++) {
            var table = this.config.DB.tables[i];
            this.db.declareTable(table.name, table.key, table.indexes);
        }
        this.db.open(this.config.DB.name, this.config.DB.version, function(dbProvider){
            if(!dbProvider) {
                context.db = context.dbFactory.getDB(context.db);
                context.openDB(callback);
            }
            context.finishInitialization(callback);
            if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && context.tabsSyncronizer.isMaster) {
                context.db.deleteByKey('tabsync', null);
            };
        });
    }

    fjs.fdp.SyncManager.prototype.getDataForFeeds = function (feeds, callback) {
        var context = this;
        fjs.utils.Core.asyncForIn(feeds, function(key, value, next){
            context.getFeedData(value, function(data){
                context.fireEvent(data.feed, data);
                if(data.eventType == sm.eventTypes.FEED_COMPLETE) {
                    next();
                }
            });
        }, function(){
            callback();
        });
    };

    /**
     * @param {Function} callback
     * @private
     */
    fjs.fdp.SyncManager.prototype.finishInitialization = function(callback) {
        /**
         * @type {fjs.fdp.SyncManager}
         */
        var context = this;

        function endOfInit () {
            if(context.suspendFeeds.length>0) {
                context.startSync(context.suspendFeeds);
            }
            context.suspendFeeds = [];
            if(context.suspendClientSyncs.length>0) {
                for(var j=0; j<context.suspendClientSyncs.length; j++) {
                    context.onSync(context.suspendClientSyncs[j]);
                }
            }
            context.suspendClientSyncs = [];
            if(context.suspendActions.length>0) {
                for(var i=0; i<context.suspendActions.length; i++) {
                    context.transport.send(context.suspendActions[i]);
                }
            }

            context.suspendActions = [];
            context.suspendFeeds = [];
            context.suspendClientFeeds = [];
            context.status = sm.states.READY;
            callback();
        }

        if(this.suspendLoginData) {
            var _suspendLoginData = this.suspendLoginData;
            if(this.db) {
                this.db.clear(function () {
                    context.transport.send({type: 'SFLogin', data: _suspendLoginData});
                    endOfInit();
                });
            }
            else {
                context.transport.send({type: 'SFLogin', data: _suspendLoginData});
                endOfInit();
            }
            this.suspendLoginData=null;
        }
        else {
            if (this.suspendFeeds.length > 0) {
                this.fireEvent(null, {eventType: sm.eventTypes.SYNC_START});
                this.getDataForFeeds(this.suspendFeeds, function () {
                    if (context.suspendClientFeeds.length > 0) {
                        context.getDataForFeeds(context.suspendClientFeeds, function () {
                            context.fireEvent(null, {eventType:sm.eventTypes.SYNC_COMPLETE});
                            endOfInit();
                        });
                    }
                    else {
                        context.fireEvent(null, {eventType:sm.eventTypes.SYNC_COMPLETE});
                        endOfInit();
                    }
                });
            }
            else if (this.suspendClientFeeds.length > 0) {
                this.fireEvent(null, {eventType: sm.eventTypes.SYNC_START});
                this.getDataForFeeds(this.suspendClientFeeds, function () {
                    context.fireEvent(null, {eventType:sm.eventTypes.SYNC_COMPLETE});
                    endOfInit();
                });
            }
            else {
                endOfInit();
            }
        }
    };

    /**
     * @param {Array.<string>} feeds
     * @private
     */
    fjs.fdp.SyncManager.prototype.startSync = function(feeds) {
        var data = {};
        var  context=this;
        if(feeds) {
            fjs.utils.Core.asyncForIn(feeds, function(key, value, next){
                context.getVersions(value, data, function() {
                    next();
                });
            }, function(){
                context.transport.send({'type': 'synchronize', data: {versions: data}});
            });
        }
        else {
            new Error ("You must set feeds names array");
        }
    };


    /**
     * Saves versions
     * @param {string} feedName
     * @param {string} source
     * @param {string} version
     * @private
     */
    fjs.fdp.SyncManager.prototype.saveVersions = function(feedName, source, version) {
        if(this.db && version !== undefined && this.runtimefeeds.indexOf(feedName) < 0 &&  (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
            this.db.insertOne("versions", {"feedSource": feedName+"_"+source, "feedName":feedName, "source":source, "version":version});
        }
    };
    /**
     *
     * @param {string} feedName
     * @param {*} data
     * @param {Function} callback
     * @private
     */
    fjs.fdp.SyncManager.prototype.getVersions = function(feedName, data, callback) {
        var versionsArr = [];
        /**
         * @type {fjs.fdp.SyncManager}
         */
        var context = this;
        if(this.versions[feedName]) {
            setTimeout(function(){
                callback(data[feedName] = context.versions[feedName]);
            },0);
        }
        else {
            if (this.db && this.runtimefeeds.indexOf(feedName) < 0) {
                this.db.selectByIndex("versions", {"feedName": feedName}, function (item) {
                    versionsArr.push(item.source + "@" + item.version);
                }, function () {
                    context.versions[feedName] = data[feedName] = versionsArr.join(",");
                    callback(data[feedName]);
                });
            }
            else {
                setTimeout(function () {
                    callback(context.versions[feedName] = data[feedName] = "");
                }, 0);
            }
        }
    };

    fjs.fdp.SyncManager.prototype.lazySyncProcessItems = function(items, feedName, sourceId) {
        var entriesForSave = [];
        for (var j = 0; j < items.length; j++) {
            var entry = items[j];
            var etype = (entry["xef001type"] || sm.eventTypes.ENTRY_CHANGE) ;
            var xpid = entry.xpid = entry.xpid ? entry.xpid : (sourceId ? sourceId + "_" + entry["xef001id"] : entry["xef001id"]);
            delete entry["xef001type"];
            entry.source = sourceId;
            var event = {eventType: etype, feed:feedName, xpid: xpid, entry: entry};
            if(this.db) {
                switch (etype) {
                    case sm.eventTypes.ENTRY_CHANGE:
                        entriesForSave.push(event.entry);
                        break;
                    case sm.eventTypes.ENTRY_DELETION:
                        if((!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster))
                        this.db.deleteByKey(feedName, event.xpid, null);
                        break;
                    default:
                        fjs.utils.Console.error("Incorrect item change type: " + etype+" for Lazy sync");
                        break;
                }
            }
            this.fireEvent(feedName, event);
        }
        if(this.db && entriesForSave.length>0 && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
            this.db.insertArray(feedName, entriesForSave, null);
        }
    };

    fjs.fdp.SyncManager.prototype.fullSyncProcessItems = function(items, feedName, sourceId) {
        var context = this, entriesForSave=[];
            for (var j = 0; j < items.length; j++) {
                var entry = items[j];
                var etype = (entry["xef001type"] || sm.eventTypes.ENTRY_CHANGE) ;
                entry.source = sourceId;
                if(etype===sm.eventTypes.ENTRY_CHANGE) {
                    var xpid = entry.xpid = entry.xpid ? entry.xpid : (sourceId ? sourceId + "_" + entry["xef001id"] : entry["xef001id"]);
                    delete entry["xef001type"];
                    var event = {eventType: etype, feed: feedName, xpid: xpid, entry: entry};
                    entriesForSave.push(entry);
                    this.fireEvent(feedName, event);
                }
                else {
                    fjs.utils.Console.error("Incorrect item change type: " + etype+" for Full sync");
                }
            }
            if(this.db && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
                this.db.deleteByIndex(feedName, {'source': sourceId}, function () {
                    context.db.insertArray(feedName, entriesForSave, null);
                });
            }
    };

    fjs.fdp.SyncManager.prototype.keepSyncProcessItems = function(items, feedName, sourceId) {
        var entriesForSave = [], idsForKeep=[], idsForPush=[], context=this;
        for (var j = 0; j < items.length; j++) {
            var entry = items[j];
            var etype = (entry["xef001type"] || sm.eventTypes.ENTRY_CHANGE);
            var xpid = entry.xpid = entry.xpid ? entry.xpid : (sourceId ? sourceId + "_" + entry["xef001id"] : entry["xef001id"]);
            delete entry["xef001type"];
            entry.source = sourceId;
            var event = {eventType: etype, feed:feedName, xpid: xpid, entry: entry};
            if(this.db) {
                switch (etype) {
                    case sm.eventTypes.ENTRY_CHANGE:
                        entriesForSave.push(event.entry);
                        idsForPush.push(event.entry.xpid);
                        break;
                    case sm.eventTypes.ENTRY_KEEP:
                        idsForKeep.push(event.entry.xpid);
                        break;
                    default:
                        fjs.utils.Console.error("Incorrect item change type: " + etype+" for Keep sync");
                        break;
                }
            }
            this.fireEvent(feedName, event);
        }
        if(this.db && entriesForSave.length > 0 && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
            this.db.selectByIndex(feedName, {'source':sourceId}, function(item){
                if(idsForKeep.indexOf(item.xpid)<0 && idsForPush.indexOf(item.xpid)<0) {
                    context.db.deleteByKey(feedName, item.xpid, null);
                }
            },  function(){
                    context.db.insertArray(feedName, entriesForSave, null);
            });
        }
    };

    fjs.fdp.SyncManager.prototype.processFeedData = function(feedName, feedData) {

        var isSource = function(sourceId) {
            return sourceId != 'full'
       };

        this.fireEvent(feedName, {eventType: sm.eventTypes.FEED_START, feed:feedName});

        for(var sourceId in feedData) {
            if(feedData.hasOwnProperty(sourceId) && isSource(sourceId)) {
                var sourceData = feedData[sourceId];
                this.processSourceData(feedName, sourceId, sourceData);
            }
        }

        this.fireEvent(feedName, {eventType: sm.eventTypes.FEED_COMPLETE, feed:feedName});
    };


    fjs.fdp.SyncManager.prototype.processSourceData = function(feedName, sourceId, sourceData) {
        var ver = sourceData["xef001ver"];
        if(sourceData["filter"]) {
            this.saveHistoryVersions(feedName, sourceId, sourceData["filter"], sourceData["h_ver"]);
        }
        var items = sourceData["items"];
        var type = sourceData["xef001type"];
        this.fireEvent(feedName, {eventType: sm.eventTypes.SOURCE_START, syncType: type, feed:feedName, sourceId:sourceId});
        switch(type) {
            case sm.syncTypes.LAZY:
                this.lazySyncProcessItems(items, feedName, sourceId);
                break;
            case sm.syncTypes.FULL:
                this.fullSyncProcessItems(items, feedName, sourceId);
                break;
            case sm.syncTypes.KEEP:
                this.keepSyncProcessItems(items, feedName, sourceId);
                break;
            default:
                fjs.utils.Console.error("Unknown sync type: "+type);
                break;
        }
        this.fireEvent(feedName, {eventType: sm.eventTypes.SOURCE_COMPLETE, feed:feedName, sourceId:sourceId, syncType: type});
        this.saveVersions(feedName, sourceId, ver);
    };

    /**
     * @param {*} data
     * @private
     */
    fjs.fdp.SyncManager.prototype.onSync = function (data) {

        var _data = fjs.utils.JSON.parse(data), context = this;
        if(this.syncTimeoutId !=null) {
            clearTimeout(this.syncTimeoutId);
            this.syncTimeoutId = null;
        }
        this.syncs.push(_data);
        if(this.syncs.length==1) {
            this.fireEvent(null, {eventType: sm.eventTypes.SYNC_START});
            for(var i=0; i <this.syncs.length; i++) {
                for (var feedName in this.syncs[i]) {
                    if (this.syncs[i].hasOwnProperty(feedName)) {
                        var feedData = this.syncs[i][feedName];
                        this.processFeedData(feedName, feedData);
                    }
                }
            }
            context.syncs = [];
            this.syncTimeoutId = setTimeout(function(){
                context.fireEvent(null, {eventType: sm.eventTypes.SYNC_COMPLETE});
                context.syncTimeoutId = null;
            },100);
        }
        else {
            fjs.utils.Console.log("!!!!Double onSync!!", this.syncs[0],  _data);
        }
    };

    /**
     * Sends action to FDP server
     * @param {string} feedName Feed name
     * @param {string} actionName Action name
     * @param {Object} data Request parameters ({'key':'value',...})
     */
    fjs.fdp.SyncManager.prototype.sendAction = function(feedName, actionName, data) {
        data["action"] = actionName;
        var message = {type: "action", data: {feedName: feedName, actionName: actionName, parameters: data}};
        if(this.status!=sm.states.READY) {
               this.suspendActions.push(message);
        }
        else {
            this.transport.send(message);
        }
    };

    /**
     * Handler function to execute when client feed data has hanged.
     * @param {Object} message sync object (changes object)
     * @param {boolean} notBroadcast
     */
    fjs.fdp.SyncManager.prototype.onClientSync = function(message, notBroadcast) {
        if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && new fjs.api.TabsSynchronizer().isMaster) {
            fjs.fdp.transport.LocalStorageTransport.masterSend('message', {type:"sync", data:message});
        }
        else if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && !notBroadcast) {
            fjs.fdp.transport.LocalStorageTransport.masterSend('clientSync', {type:"clientSync", data:message});
        }
        if(!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster) {
            if(this.status!=1) {
                this.suspendClientSyncs.push(message);
            }
            else {
                this.onSync(message);
            }
        }
    };

    /**
     * Clears stored data and throw auth error
     * @private
     */
    fjs.fdp.SyncManager.prototype.getAuthTicket = function() {
        var context = this;
        if(this.state == sm.states.READY && this.db) {
            this.db.clear(function(){
                context.fireEvent("authError", {type:'authError', message:'Auth ticket wrong or expired'});
            });
        }
        else {
            context.fireEvent("authError", {type:'authError', message:'Auth ticket wrong or expired'});
        }
    };

    /**
     * Adds listener on feed. If feed does not synchronize, adds this feed to synchronization.
     * @param {string} feedName Feed name
     * @param {Function} listener Handler function to execute when feed data changed
     * @param {boolean=} isClient True if is client feed (optional)
     */
    fjs.fdp.SyncManager.prototype.addFeedListener = function(feedName, listener, isClient) {

        var context = this;

        if(this.feeds.indexOf(feedName)<0) {
            this.feeds.push(feedName);
        }

        this.superClass.addEventListener.apply(this, arguments);

        if(this.status != sm.states.READY ) {
            if(isClient) {
                if (this.suspendClientFeeds.indexOf(feedName) < 0) {
                    this.suspendClientFeeds.push(feedName);
                }
            }
            else {
                if(this.suspendFeeds.indexOf(feedName)<0) {
                    this.suspendFeeds.push(feedName);
                }
                if(this.syncFeeds.indexOf(feedName)<0) {
                    this.syncFeeds.push(feedName);
                }
            }
        }
        else if(this.syncFeeds.indexOf(feedName)<0) {
            if(!isClient) {
                this.syncFeeds.push(feedName);
                if (this.versionsFeeds.indexOf(feedName)<0) {
                    this.versionsFeeds.push(feedName);
                }
                if (this.versionsTimeoutId != null) {
                    clearTimeout(this.versionsTimeoutId);
                    this.versionsTimeoutId = null;
                }
                this.versionsTimeoutId = setTimeout(function () {
                    context.startSync(context.versionsFeeds);
                    context.versionsFeeds = [];
                    context.versionsTimeoutId = null;
                }, 100);
            }
            this.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_START, feed:feedName}, listener);
            this.getFeedData(feedName, function(data){
                if(data.eventType == sm.eventTypes.FEED_COMPLETE) {
                    context.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_COMPLETE, feed:feedName}, listener);
                }
                listener(data);
            });
        }
        else if(this.syncFeeds.indexOf(feedName) >= 0 && this.states==sm.READY) {
            this.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_START, feed:feedName}, listener);
            this.getFeedData(feedName, function(data){
                if(data.eventType == sm.eventTypes.FEED_COMPLETE) {
                    context.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_COMPLETE, feed:feedName}, listener);
                }
                listener(data);
            });
        }
    };

    /**
     * Removes listener from feed, if the number of listeners == 0, it stops synchronization for this feed.
     * @param {string} feedName
     * @param {Function} listener
     * @param {boolean=} isClient
     */
    fjs.fdp.SyncManager.prototype.removeFeedListener = function(feedName, listener, isClient) {
        var index;
        if(index = (this.feeds.indexOf(feedName)>=0)) {
            this.feeds.splice(index, 1);
        }
        this.superClass.removeEventListener.apply(this, arguments);
        if(!isClient) {
            if ((index = this.syncFeeds.indexOf(feedName)) > -1) {
                this.syncFeeds.splice(index, 1);
            }
            if (this.listeners[feedName] && this.listeners[feedName].length == 0) {
                this.transport.send({'type': 'forget', 'data': {'feedName': feedName}});
            }
        }
    };

    /**
     * Selects data for feed form database.
     * @param {string} feedName Feed name
     * @param {Function=} listener
     * @private
     */
    fjs.fdp.SyncManager.prototype.getFeedData = function(feedName, listener) {
        var context = this, data = {eventType:sm.eventTypes.FEED_START , syncType: "F", feed:feedName};
        this.fireEvent(feedName, data, listener);
        if(this.db ) {
            this.db.selectAll(feedName, function(item){
                    var data = {eventType: sm.eventTypes.ENTRY_CHANGE, feed:feedName, xpid: item.xpid, entry: item};
                    context.fireEvent(feedName, data, listener);
                }
                , function() {
                    var data = {eventType: sm.eventTypes.FEED_COMPLETE, feed:feedName};
                    context.fireEvent(feedName, data, listener);
                });
        }
        else {
            var entry = {eventType: sm.eventTypes.FEED_COMPLETE, feed:feedName};
            this.fireEvent(feedName, entry, listener);
        }
    };

    /**
     * Sends event to listeners
     *
     * @param {string} feedName Feed name
     * @param {*} data Event object
     * @param {Function} listener Handler function
     * @private
     */
    fjs.fdp.SyncManager.prototype.fireEvent = function(feedName, data, listener) {
        if(listener) {
            listener(data);
        }
        else if(feedName) {
            this.superClass.fireEvent.call(this, feedName, data);
        }
        else {
            for(var _feedName in this.listeners) {
                if(this.listeners.hasOwnProperty(_feedName)) {
                    if(this.feeds.indexOf(_feedName)>-1) {
                        this.superClass.fireEvent.call(this, _feedName, data);
                    }
                }
            }
        }
    };

    /**
     * Loads more items for feeds with dynamic loading
     * @param {string} feedName Feed name
     * @param {*} _filter Filter to load only specified data
     * @param {number} count Count of items
     */
    fjs.fdp.SyncManager.prototype.loadNext = function(feedName, _filter, count) {

        var filter = fjs.utils.JSON.stringify(_filter);
        var feedHVersions = this.historyversions[feedName];
        if(!feedHVersions){
            feedHVersions={};
            this.historyversions[feedName] = feedHVersions;
        }
        if(feedHVersions[filter]){
            this.processHistoryVersions(feedName, filter, count, feedHVersions[filter], function(){});
            return;
        }

        var context = this;
        var hVersions = [];
        this.fillHistoryVersions(feedName, filter, count, hVersions, function(){
            context.processHistoryVersions(feedName, filter, count, hVersions, function(){});
        });
    };

    /**
     * @param {string} feedName
     * @param {Object} filter
     * @param {number} count
     * @param {Array} _historyVersions
     * @param {Function} callback
     * @private
     */
    fjs.fdp.SyncManager.prototype.fillHistoryVersions = function (feedName, filter, count, _historyVersions, callback) {
        if (this.db) {
            var context = this;
            this.db.selectByIndex("historyversions", {"feedName": feedName, "filter": filter}, function (item) {
                _historyVersions.push(item["source"] + ":" + item["version"]);
            }, function () {
                if(_historyVersions.length==0){
                    context.fillEmptyHistoryVersionsFromFeed(feedName,_historyVersions, callback);
                } else {
                    callback();
                }
            });
        }
    };

    /**
     * @param {string} feedName
     * @param {Array} _historyVersions
     * @param {Function} callback
     * @private
     */
    fjs.fdp.SyncManager.prototype.fillEmptyHistoryVersionsFromFeed = function(feedName, _historyVersions, callback) {
        if(this.db) {
            //fill 0 versions for known sources
            this.db.selectByIndex("versions", {"feedName":feedName}, function(item) {
                _historyVersions.push(item["source"]+":0");
            }, callback);
        }
    };

    /**
     * @param {string} feedName
     * @param {Object} filter
     * @param {number} count
     * @param {Array} _historyVersions
     * @param {Function} callback
     * @private
     */
    fjs.fdp.SyncManager.prototype.processHistoryVersions = function(feedName, filter, count, _historyVersions, callback) {
        if(_historyVersions.length==0)
        {
            if(callback){
                callback(false);
            }
            return;
        }
        this.historyversions[feedName][filter]=_historyVersions;

        var _data = {"s.limit":count, "sh.filter": filter, "sh.versions": _historyVersions.join("@")};

        this.transport.send({type:"loadNext", data:{feedName:feedName, data:_data}});
        if(callback){
            callback(true);
        }
    };

    /**
     * Saves history versions
     * @param {string} feedName
     * @param {string} source
     * @param {string} filter
     * @param {string} version
     * @private
     */
    fjs.fdp.SyncManager.prototype.saveHistoryVersions = function(feedName, source, filter, version) {
        if(this.db && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
            this.db.insertOne("historyversions", {"feedSourceFilter": feedName+"_"+source+"_"+"filter", "feedName":feedName, "source":source, filter: filter, "version":version});
            var feedHVersions = this.historyversions[feedName];
            if(feedHVersions){
                delete feedHVersions[filter];
                if(!feedHVersions){
                    delete this.historyversions[feedName];
                }
            }
        }
    };

    /**
     * Saves versions
     * @param {string} feedName
     * @param {string} filter
     * @private
     */
    fjs.fdp.SyncManager.prototype.saveEmptyHistoryVersions = function(feedName, filter) {
        if(this.db && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
            this.db.insertOne("historyversions", {"feedName":feedName, filter: filter, "version":"-1"});
            delete this.historyversions[feedName];
        }
    };

    /**
     * Forgets auth info and call requestAuth method from the Auth Handler.
     */
    fjs.fdp.SyncManager.prototype.logout = function() {
        this.ticket = null;
        this.node = null;
        this.getAuthTicket();
        this.status = sm.states.NOT_INITIALIZED;
    };

    fjs.fdp.SyncManager.prototype.SFLogin = function(loginData) {
        var context = this;
        if(this.status == sm.states.READY && this.db) {
            this.db.clear(function(){
                context.fireEvent(null, {eventType: sm.eventTypes.CLEAR});
                for(var key in context.versions) {
                    if(context.versions.hasOwnProperty(key)) {
                        context.versions[key] = '';
                    }
                }
                if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && new fjs.api.TabsSynchronizer().isMaster) {
                    fjs.fdp.transport.LocalStorageTransport.masterSend('message', {type: sm.eventTypes.CLEAR});
                }
                context.transport.send({type:'SFLogin', data:loginData});
            });
        }
        else if(!this.db) {
            this.transport.send({type:'SFLogin', data:loginData});
        }
        else {
            this.suspendLoginData = loginData;
        }
    }
})();
namespace("fjs.fdp");

/**
 *
 *  It's main API object for works with FJSFDP.
 *  <br>
 *  <b>Singleton</b>
 * @param {string} authTicket Auth ticket
 * @param {string} node Node ID
 * @param {Object} config Application properties
 * @param {Function} callback Method to execute when FJSFDP initialized and ready to work
 * @constructor
 * @extends fjs.EventsSource
 */
fjs.fdp.DataManager = function(authTicket, node, config, callback) {
    //Singleton
    if (!this.constructor.__instance)
        this.constructor.__instance = this;
    else return this.constructor.__instance;

    var context = this;
    fjs.EventsSource.call(this);

    /**
     * Auth ticket
     * @type {string}
     */
    this.ticket = authTicket;

    /**
     * Node ID
     * @type {string}
     */
    this.node = node;
    /**
     * Application properties
     * @type {Object}
     */
    this.config = config;
    /**
     * @type {fjs.fdp.SyncManager}
     * @private
     */
    this.sm = new fjs.fdp.SyncManager(this.config);

    var proxyEventListener = function(e){
        context.fireEvent(e.type, e);
    };

    this.sm.init(this.ticket, this.node, function(){
        callback();
        context.sm.addEventListener("node", proxyEventListener);
        context.sm.addEventListener("ticket", proxyEventListener);
        context.sm.addEventListener("requestError", proxyEventListener);
        context.sm.addEventListener("authError", proxyEventListener);
        context.sm.addEventListener("networkProblem", proxyEventListener);
        context.sm.addEventListener("connectionEstablished", proxyEventListener);
        context.sm.addEventListener("fdpTime", proxyEventListener);
    });
    /**
     * @type {{}}
     * @private
     */
    this.proxies = {};
};

fjs.fdp.DataManager.extend(fjs.EventsSource);

/**
 * Adds listener on feed. If feed does not synchronize, adds this feed to synchronization.
 * @param {string} feedName Feed name
 * @param {Function} listener Handler function to execute when feed data changed
 */
fjs.fdp.DataManager.prototype.addFeedListener = function(feedName, listener) {
    var proxy = this.proxies[feedName];
    if(!proxy)  {
        proxy = this.proxies[feedName] = this.createProxy(feedName);
    }
    proxy.addListener(listener);
};

/**
 * Removes listener from feed, if the number of listeners == 0, it stops synchronization for this feed.
 * @param {string} feedName Feed name
 * @param {Function} listener Handler function to execute when feed data changed
 */
fjs.fdp.DataManager.prototype.removeFeedListener = function(feedName, listener) {
    var proxy = this.proxies[feedName];
    if(proxy)  {
        proxy.removeListener(listener);
    }
};

/**
 * Creates and returns ProxyModel for feed
 * @param {string} feedName Feed name
 * @returns {fjs.fdp.model.ProxyModel}
 * @private
 */
fjs.fdp.DataManager.prototype.createProxy = function(feedName) {
    switch(feedName) {
        case 'contacts':
            return new fjs.fdp.model.ProxyModel(['contacts', 'contactstatus', 'calls', 'calldetails', 'fdpImage', 'contactpermissions'], this.sm);
        case 'locations':
            return new fjs.fdp.model.ProxyModel(['locations', 'location_status'], this.sm);
        case 'mycalls':
            return new fjs.fdp.model.ProxyModel(['mycalls', 'mycalldetails'], this.sm);
        case 'conferences':
            return new fjs.fdp.model.ProxyModel(['conferences', 'conferencestatus', 'conferencepermissions'], this.sm);
        case 'sortings':
            return new fjs.fdp.model.ClientFeedProxyModel(['sortings'], this.sm);
        case 'mycallsclient':
            return new fjs.fdp.model.MyCallsClientProxyModel(['mycalls', 'mycalldetails', 'mycallsclient'], this.sm);
        case 'clientsettings':
            return new fjs.fdp.model.ClientFeedProxyModel(['clientsettings'], this.sm);
        case 'clientcalllog':
            return new fjs.fdp.model.ClientFeedProxyModel(['clientcalllog'], this.sm);
        default :
            return new fjs.fdp.model.ProxyModel([feedName], this.sm);
    }
};

/**
 * Forgets auth info and fire badAuth error.
 */
fjs.fdp.DataManager.prototype.logout = function() {
    this.sm.logout();
};
/**
 * Sends action to FDP server
 * @param {string} feedName Feed name
 * @param {string} actionName Action name
 * @param {Object} data Action data (request parameters).
 */
fjs.fdp.DataManager.prototype.sendAction = function(feedName, actionName, data) {
    var /** @type (fjs.fdp.model.ProxyModel) */ proxy = this.proxies[feedName];
    if(!proxy)  {
        fjs.utils.Console.warn("DataManager: sendAction: no proxy model for feed: " + feedName);
        return;
    }
    proxy.sendAction(feedName, actionName, data);
};

/**
 * Loads more items for feeds with dynamic loading
 * @param {string} feedName FeedName
 * @param {Object} filter Filter to load only specified data
 * @param {number} count Count of items
 */
fjs.fdp.DataManager.prototype.loadNext = function(feedName, filter, count) {
    if(!this.proxies[feedName]) {
        fjs.utils.Console.error("You don't listen this feed");
    }
    this.sm.loadNext(feedName, filter, count);
};

/**
 * Broadcasts message to listeners.
 * @param {string} eventType event type
 * @param {*} eventData event message object
 */
fjs.fdp.DataManager.prototype.fireEvent = function (eventType, eventData) {
    var _listeners = this.listeners[eventType], i;
    eventData.eventType = eventType;
    if(_listeners) {
        for (i = 0; i < _listeners.length; i++) {
            _listeners[i](eventData);
        }
    }
    var _listeners2 = this.listeners[""];
    if(_listeners2) {
        for (i = 0; i < _listeners2.length; i++) {
            _listeners2[i](eventData);
        }
    }
};
/**
 * Authenticates user by salesforce user data
 * @param {Object} loginData user info data
 */
fjs.fdp.DataManager.prototype.SFLogin = function(loginData) {
    this.sm.SFLogin(loginData);
};