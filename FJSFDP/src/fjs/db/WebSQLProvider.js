namespace("fjs.db");
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




