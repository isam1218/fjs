/**
 * Created by vovchuk on 10/29/13.
 */
namespace("fjs.db");
/**
 *
 * @param {window} globalObj
 * @constructor
 */
fjs.db.IndexedDBProvider = function(globalObj) {
    fjs.db.DBProviderBase.call(this);
    this.globalObj = globalObj || window;
    this.indexedDB = globalObj.indexedDB || globalObj.mozIndexedDB || globalObj.webkitIndexedDB || globalObj.msIndexedDB;
    this.IDBTransaction = globalObj.IDBTransaction || globalObj.webkitIDBTransaction || globalObj.msIDBTransaction;
    this.IDBKeyRange = globalObj.IDBKeyRange || globalObj.webkitIDBKeyRange || globalObj.msIDBKeyRange;
    this.db = null;
};
fjs.db.IndexedDBProvider.extends(fjs.db.DBProviderBase);

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
 * @param {Number} version
 */
fjs.db.IndexedDBProvider.prototype.open = function(name, version, onsuccess, onupgraded) {
    var request = this.globalObj.indexedDB.open(name, version), context = this;
    request.onerror = function(event) {
        new Error("Error: can't open indexedDB ("+name+", "+version+")", event);
    };
    var onError = function(event) {
        new Error("Database error: " + event.target.errorCode);
    };
    request.onsuccess = function(event) {
        context.db = request.result;
        context.db.onerror = onError
        if(onsuccess) {
            onsuccess(context.db);
        }
    };

    request.onupgradeneeded = function(e) {
        var db = context.db = e.target.result;
        e.target.transaction.onerror = db.onerror = onError;
        for(var i=0; i<db.objectStoreNames.length; ) {
            db.deleteObjectStore(db.objectStoreNames[0]);
        };
        if(onupgraded) {
            onupgraded(context.db);
        }
    };
};

fjs.db.IndexedDBProvider.prototype.createTable = function(name, key) {
    return this.db.createObjectStore(name, {keyPath: key});

};

fjs.db.IndexedDBProvider.prototype.insert = function(tableName, item, callback) {
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

fjs.db.IndexedDBProvider.prototype.delete = function(tableName, key, callback) {
    var request = this.db.transaction([tableName], "readwrite")
        .objectStore(tableName)
        .delete(key);
    request.onsuccess = function(e) {
        if(callback) {
            callback(e);
        }
    }
};

fjs.db.IndexedDBProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {
    var trans = this.db.transaction([tableName], "readwrite");
    var store = trans.objectStore(tableName);

    // Get everything in the store;
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

fjs.db.IndexedDBProvider.prototype.selectByIndex = function(tableName, condition, itemCallback, allCallback) {

    var indexName = condition.key;
    var indexValue = condition.value;
    var trans = this.db.transaction([tableName], "readwrite");
    var store = trans.objectStore(tableName);
    var index = store.index(indexName);
    // Get everything in the store;
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

fjs.db.IndexedDBProvider.prototype.getItem = function(tableName, key, callback) {
    var transaction = this.db.transaction([tableName]);
    var objectStore = transaction.objectStore(tableName);
    var request = objectStore.get(key);
    request.onerror = this.db.onerror;
    request.onsuccess = function(event) {
        callback(request.result);
    };
};

fjs.db.IndexedDBProvider.prototype.createIndex = function(tableName, field, unique) {
    var trans = this.db.transaction([tableName], "readwrite");
    var store = trans.objectStore(tableName);
    store.createIndex(field, field, { unique: unique });
};

fjs.db.IndexedDBProvider.prototype.clear = function() {
    for(var i=0; i<this.db.objectStoreNames.length; i++) {
        var clearTransaction = this.db.transaction([this.db.objectStoreNames[i]], "readwrite");
        var clearRequest = clearTransaction.objectStore(this.db.objectStoreNames[i]).clear();
    };
};