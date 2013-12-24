namespace("fjs.db");
/**
 * @param {window} globalObject
 * @constructor
 * @implements fjs.db.IDBProvider
 */
fjs.db.WebSQLProvider = function(globalObject) {
    this.gloalObject = globalObject;
    /**
     * @type {Database}
     */
    this.db = null;
    this.tables = {};
};
/**
 * @param {window} globalObj
 * @return {boolean}
 */
fjs.db.WebSQLProvider.check = function(globalObj) {
    return typeof (globalObj.openDatabase) !== 'undefined';
};

/**
 * @param name
 * @param version
 * @param callback
 */
fjs.db.WebSQLProvider.prototype.open = function(name, version, callback) {
    var dbSize = 5 * 1024 * 1024, context = this;
    var db = this.db = this.gloalObject.openDatabase(name,"" ,name , dbSize, function(){
    });
    if(db.version==='') {
        for(var i in context.tables) {
            if(context.tables.hasOwnProperty(i)) {
                /**
                 * @type {{key:string, indexes:Array}}
                 */
                var table = context.tables[i];
                context.createTable(i, table.key, table.indexes);
                console.log(i+" table created");
            }
        }
        callback(db);
    }
    else if(db.version!==version) {
        db.changeVersion(db.version, version, function(){
            for(var i in context.tables) {
                if(context.tables.hasOwnProperty(i)) {
                    /**
                     * @type {{key:string, indexes:Array}}
                     */
                    var table = context.tables[i];
                    context.createTable(i, table.key, table.indexes);
                }
            }
            callback(db);
        });
    }
    else {
        callback(db);
    }
};
/**
 * @param {string} name
 * @param {string} key
 * @param {Array} indexes
 * @protected
 */
fjs.db.WebSQLProvider.prototype.createTable = function(name, key, indexes) {
    this.db.transaction(function(tx) {
        var query = 'CREATE TABLE IF NOT EXISTS ';
        query += name + '(' + key + ' TEXT PRIMARY KEY';
        query += indexes ? ', ' + indexes.join(" TEXT, ") + " TEXT": '' ;
        query += ', data TEXT)';
        tx.executeSql(query);
        if(indexes) {
            for(var i=0; i<indexes.length; i++) {
                var _query = "CREATE INDEX "+name+"_"+indexes[i]+"_idx ON "+ name +" ("+indexes[i]+")";
                tx.executeSql(_query);
            }
        }
    });
};

/**
 * @param {string} name
 * @param {string} key
 * @param {Array} indexes
 */
fjs.db.WebSQLProvider.prototype.declareTable = function(name, key, indexes) {
    this.tables[name] = {'key':key, 'indexes':indexes};
};

/**
 *
 * @param {string} tableName
 * @param {*} item
 * @param {Function} callback
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
            + (table.indexes ? table.indexes.join(", ") : "")
            + ", data) VALUES ('"
            + item[table.key] +"', '";
        if(table.indexes) {
            for(var i=0; i<table.indexes.length; i++) {
                query += item[table.indexes[i]]+"', '";
            }
        }
        query+=JSON.stringify(item)+"')";
        tx.executeSql(query, [],  callback, function(e){new Error(e)});
    });
};

/**
 *
 * @param {string} tableName
 * @param {Array} items
 * @param {Function} callback
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
            + (table.indexes ? table.indexes.join(", ") : "")
            + ", data) VALUES ('";
        for(var j = 0; j<items.length; j++) {
            var item = items[j];
            var query = _query + item[table.key] +"', '";
            if(table.indexes) {
                for(var i=0; i<table.indexes.length; i++) {
                    query += item[table.indexes[i]]+"', '";
                }
            }
            query+=JSON.stringify(item)+"')";
            tx.executeSql(query, [],  function() {
                count--;
                if(callback && count==0) {
                    callback();
                }
            }, function(e){new Error(e)});
        }
    });
};

    /**
     * @param {string} tableName
     * @param {string} key
     * @param {Function} callback
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
            tx.executeSql(query, [],  callback, function(e){new Error(e)});
        });
};


/**
 * @param {string} tableName
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
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
                    itemCallback(item);
                }
                allCallback(arr);
            }
        }, function(e){new Error(e)});
    });
};
/**
 *
 * @param {string} tableName
 * @param {{key:string, value:*}} rule
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.WebSQLProvider.prototype.selectByIndex = function(tableName, rule, itemCallback, allCallback) {
    this.db.transaction(function(tx){
        var query = "SELECT data FROM " + tableName + " WHERE " + rule.key+"='"+rule.value+"'";

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
                    itemCallback(item);
                }
                allCallback(arr);
            }
        }, function(e){new Error(e)});
    });
};

/**
 *
 * @param {string} tableName
 * @param {{key:string, value:*}} rule1
 * @param {{key:string, value:*}} rule2
 * @param {Function} itemCallback
 * @param {function(Array)} allCallback
 */
fjs.db.WebSQLProvider.prototype.selectByIndex2 = function(tableName, rule1, rule2, itemCallback, allCallback) {
    this.db.transaction(function(tx){
        var query = "SELECT data FROM " + tableName + " WHERE " + rule1.key+"='"+rule1.value+"' AND "+ rule2.key+"='"+rule2.value;

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
                    itemCallback(item);
                }
                allCallback(arr);
            }
        }, function(e){new Error(e)});
    });
};

/**
 * @param {string} tableName
 * @param {string} key
 * @param {Function} callback
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
        }, function(e){new Error(e)});
    });
};

fjs.db.WebSQLProvider.prototype.clear = function(callback) {
    this.db.transaction(function(tx){
        var query = "SELECT 'drop table ' || name || ';' FROM sqlite_master WHERE type = 'table' AND name NOT GLOB '_*'";
        tx.executeSql(query, [],  callback, function(e){new Error(e)});
    });
};




