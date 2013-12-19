/**
 * Created by vovchuk on 10/29/13.
 */
namespace("fjs.db");
/**
 *
 * @param {window} globalObj
 * @constructor
 * @implements fjs.db.IDBProvider
 */
fjs.db.IndexedDBProvider = function(globalObj) {
    /**
     * @type {window|*}
     * @private
     */
    this.globalObj = globalObj || window;
    /**
     * @type {indexedDB}
     * @private
     */
    this.indexedDB = globalObj.indexedDB || globalObj.mozIndexedDB || globalObj.webkitIndexedDB || globalObj.msIndexedDB;
    /**
     *
     * @type {IDBTransaction}
     * @private
     */
    this.IDBTransaction = globalObj.IDBTransaction || globalObj.webkitIDBTransaction || globalObj.msIDBTransaction;
    /**
     * @type {IDBKeyRange}
     * @private
     */
    this.IDBKeyRange = globalObj.IDBKeyRange || globalObj.webkitIDBKeyRange || globalObj.msIDBKeyRange;
    /**
     * @type {IDBDatabase}
     * @private
     */
    this.db = null;
    /**
     * @type {*}
     * @private
     */
    this.tables = {};
};

/**
 * @param {window} globalObj
 * @returns {boolean}
 */
fjs.db.IndexedDBProvider.check= function(globalObj) {
    return globalObj.indexedDB || globalObj.mozIndexedDB || globalObj.webkitIndexedDB || globalObj.msIndexedDB;
};
/**
 *
 * @param {string} name
 * @param {number} version
 * @param {function(IDBDatabase)} callback
 */
fjs.db.IndexedDBProvider.prototype.open = function(name, version, callback) {
    var request = this.globalObj.indexedDB.open(name, version), context = this;
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
 * @param {string} name
 * @param {string} key
 * @param {string} indexes
 */
fjs.db.IndexedDBProvider.prototype.declareTable = function(name, key, indexes) {
    this.tables[name] = {'key':key, 'indexes':indexes};
};

/**
 * @param {string} name
 * @param {string} key
 * @param {Array} indexes
 * @protected
 */
fjs.db.IndexedDBProvider.prototype.createTable = function(name, key, indexes) {
    /**
     * @type {IDBObjectStore}
     */
    var objectStore = this.db.createObjectStore(name, {keyPath: key});
    for(var i=0; i< indexes.length; i++) {
        objectStore.createIndex(indexes[i], indexes[i], { unique: false });
    }
};

/**
 * @param {string} tableName
 * @param {*} item
 * @param {Function} callback
 */
fjs.db.IndexedDBProvider.prototype.insertOne = function(tableName, item, callback) {
    var trans = this.db.transaction([tableName], "readwrite");
    var store = trans.objectStore(tableName);
    var request = store.put(item);

    request.onsuccess = function(e) {
        if(callback) {
            callback(e);
        }
    };
    request.onerror = this.db.onerror;
};

/**
 * @param {string} tableName
 * @param {Array} items
 * @param {Function} callback
 */
fjs.db.IndexedDBProvider.prototype.insertArray = function(tableName, items, callback) {
    var trans = this.db.transaction([tableName], "readwrite");
    var store = trans.objectStore(tableName);
    var count = items.length;
    for(var i=0; i<items.length; i++) {
    var request = store.put(items[i]);
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
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
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
 * @param {string} tableName
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.IndexedDBProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {
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
        rows.push(result.value);

        if(itemCallback) {
            itemCallback(result.value);
        }
        result.continue();
    };
    cursorRequest.onerror = this.db.onerror;
};

/**
 *
 * @param {string} tableName
 * @param {{key:string, value:*}} rule
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.IndexedDBProvider.prototype.selectByIndex = function(tableName, rule, itemCallback, allCallback) {

    var indexName = rule.key;
    var indexValue = rule.value;
    var trans = this.db.transaction([tableName], "readwrite");
    var store = trans.objectStore(tableName);
    var index = store.index(indexName);
    var singleKeyRange = IDBKeyRange.only(indexValue);
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
        rows.push(result.value);

        if(itemCallback) {
            itemCallback(result.value);
        }
        result.continue();
    };
    cursorRequest.onerror = this.db.onerror;
};
/**
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
 */
fjs.db.IndexedDBProvider.prototype.selectByKey = function(tableName, key, callback) {
    var transaction = this.db.transaction([tableName]);
    var objectStore = transaction.objectStore(tableName);
    var request = objectStore.get(key);
    request.onerror = this.db.onerror;
    request.onsuccess = function() {
        callback(request.result);
    };
};
/**
 * @param {Function} callback
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
