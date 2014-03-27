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
     * @type {*}
     * @private
     */
    this.tables = {};
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
    var request = this.indexedDB.open(name, version), context = this;
    request.onerror = function(event) {
        new Error("Error: can't open indexedDB ("+name+", "+version+")", event);
    };
    var onError = function(event) {
        new Error("Database error: " + event.target.errorCode);
    };
    request.onsuccess = function() {
        context.db = request.result;
        context.db.onerror = onError;
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
            return;
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