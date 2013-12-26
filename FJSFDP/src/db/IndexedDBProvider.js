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
 * @param {Array|string} indexes
 */
fjs.db.IndexedDBProvider.prototype.declareTable = function(name, key, indexes) {
    var table = this.tables[name] = {'key':key, 'indexes':indexes};
    if(fjs.utils.Browser.isIE()) {
        table.multipleIndexes = this.IEDeclareMultipleIndexes(indexes);
    }
};

/**
 * @param {string} name
 * @param {string} key
 * @param {Array=} indexes
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
 * @param {Array} indexes
 * @private
 */
fjs.db.IndexedDBProvider.prototype.IEDeclareMultipleIndexes = function(indexes) {
    var multipleIndexes = {}
    for(var i=0; i<indexes.length; i++) {
        if(Object.prototype.toString.call(indexes[i]) == "[object Array]") {
            multipleIndexes[indexes[i].join(",")] = indexes[i];
        }
    }
    return multipleIndexes;
};
/**
 * @param {string} tableName
 * @param item
 * @constructor
 */
fjs.db.IndexedDBProvider.prototype.IEApplyMultipleIndexesForItem = function(tableName, item) {
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
 * @constructor
 */
fjs.db.IndexedDBProvider.prototype.IEClearMultipleIndexesForItem = function(tableName, item) {
    var indexes = this.tables[tableName].multipleIndexes;
    for(var key in indexes) {
        if(indexes.hasOwnProperty(key)) {
            delete item[key];
        }
    }
};

/**
 * @param {string} tableName
 * @param {*} item
 * @param {Function} callback
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
 * @param {string} tableName
 * @param {Array} items
 * @param {Function} callback
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
 *
 * @param {string} tableName
 * @param {*} rules Map key->value
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
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
    var singleKeyRange = IDBKeyRange.only(values);
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
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
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
