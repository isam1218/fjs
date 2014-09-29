(function(){

  var _IndexedDBProvider =
/**
 * Wrapper class for <a href="https://developer.mozilla.org/ru/docs/IndexedDB">indexedDB</a> <br/>
 * This class implements DBProviderBase interface (common interface to work with all client side storages)
 * @constructor
 * @extends fjs.db.DBProviderBase
 */
fjs.db.IndexedDBProvider = function() {
    fjs.db.DBProviderBase.call(this);
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
};
fjs.core.inherits(_IndexedDBProvider, fjs.db.DBProviderBase);

  _IndexedDBProvider.failed = false;

/**
 * Returns true if you can use IndexedDB in this browser
 * @returns {boolean}
 */
_IndexedDBProvider.check= function() {
    return !!(self['indexedDB'] || self['mozIndexedDB'] || self['webkitIndexedDB'] || self['msIndexedDB']) && !_IndexedDBProvider.failed;
};
/**
* Opens connection to storage
* @param {Object} config Database config
* @param {function(fjs.db.DBProviderBase)} callback - Handler function to execute when database was ready
*/
_IndexedDBProvider.prototype.open = function(config, callback) {
    this.state = 0;

    var request = this.indexedDB.open(config.name, config.version), context = this;

    request.onerror = function(event) {
        fjs.utils.Console.error("Error: can't open indexedDB ("+config.name+", "+config.version+")", event);
      _IndexedDBProvider.failed = true;
        callback(null);
    };
    var onError = function(event) {
        fjs.utils.Console.error("Database error: " + event.target.errorCode, event);
      _IndexedDBProvider.failed = true;
        callback(null);
    };

    for(var i=0; i<config.tables.length; i++) {
        var table = config.tables[i];
        this.tables[table.name] = table;
        if (fjs.utils.Browser.isIE() && table.indexes) {
            table.multipleIndexes = this.IEDeclareMultipleIndexes(table.indexes);
        }
    }

    request.onsuccess = function() {
        context.db = request.result;
        context.db.onerror = onError;
        context.state = 1;
        if(callback) {
            callback(context);
        }
    };

    request.onupgradeneeded = function(e) {
        var db = context.db = e.target.result, i;
        e.target.transaction.onerror = db.onerror = onError;
        for(i=0; i<db.objectStoreNames.length; ) {
            db.deleteObjectStore(db.objectStoreNames[0]);
        }
        for(i=0; i<config.tables.length; i++) {
            var table = config.tables[i];
            context.createTable(table.name, table.key, table.indexes);
        }
    };
};

/**
 * Creates table
 * @param {string} name Table name
 * @param {string} key Primary key
 * @param {Array} indexes Table indexes
 * @protected
 */
_IndexedDBProvider.prototype.createTable = function(name, key, indexes) {
    /**
     * @type {IDBObjectStore}
     */
    var objectStore = this.db.createObjectStore(name, {keyPath: key});
    if(indexes) {
        for(var i=0; i< indexes.length; i++) {
            if(fjs.utils.Array.isArray(indexes[i])) {
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
 * @param {Array} indexes Table indexes
 * @private
 */
_IndexedDBProvider.prototype.IEDeclareMultipleIndexes = function(indexes) {
    var multipleIndexes = {};
    for(var i=0; i<indexes.length; i++) {
        if(fjs.utils.Array.isArray(indexes[i])) {
            multipleIndexes[indexes[i].join(",")] = indexes[i];
        }
    }
    return multipleIndexes;
};
/**
 * Creates multiples indexes for IE
 * Workaround to fix IE issue with multiple indexes
 * @param {string} tableName - table name
 * @param {object} item
 * @private
 */
_IndexedDBProvider.prototype.IEApplyMultipleIndexesForItem = function(tableName, item) {
    /**
     * @type {*}
     */
    var indexes = this.tables[tableName].multipleIndexes;
    var keys = Object.keys(indexes);
    for(var j=0; j<keys.length; j++) {
            var key = keys[j];
            var index = indexes[key];
            var fields = [];
            for(var i=0; i<index.length; i++) {
                var val = item[index[i]]!=null ? item[index[i]] : "";
                fields.push(val);
            }
            item[key] = fields.join(",");
    }
};
/**
 * @param {string} tableName
 * @param item
 * @private
 */
_IndexedDBProvider.prototype.IEClearMultipleIndexesForItem = function(tableName, item) {
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
_IndexedDBProvider.prototype.insertOne = function(tableName, item, callback) {
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
_IndexedDBProvider.prototype.insertArray = function(tableName, items, callback) {
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
_IndexedDBProvider.prototype.deleteByKey = function(tableName, key, callback) {
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
_IndexedDBProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {
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
_IndexedDBProvider.prototype.selectByIndex = function(tableName, rules, itemCallback, allCallback) {
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
_IndexedDBProvider.prototype.selectByKey = function(tableName, key, callback) {
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
_IndexedDBProvider.prototype.clear = function(callback) {
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
_IndexedDBProvider.prototype.deleteByIndex = function(tableName, rules, callback) {
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
};
})();
