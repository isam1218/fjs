(function() {
  var _WebSQLProvider =
/**
 * Wrapper class for <a href="http://en.wikipedia.org/wiki/Web_SQL_Database">WebSQL</a> <br/>
 * This class implements DBProviderBase interface (common interface to work with all client side storages)
 * @constructor
 * @extends fjs.db.DBProviderBase
 */
fjs.db.WebSQLProvider = function() {
    fjs.db.DBProviderBase.call(this);
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
fjs.core.inherits(_WebSQLProvider, fjs.db.DBProviderBase);

  _WebSQLProvider.failed = false;
/**
 * Returns true if you can use WebSQL in this browser
 * @return {boolean}
 */
_WebSQLProvider.check = function() {
    return typeof (self.openDatabase) !== 'undefined' && !fjs.db.WebSQLProvider.failed;
};

/**
 * Opens connection to storage
 * @param {Object} config Database config
 * @param {function(fjs.db.DBProviderBase)} callback - Handler function to execute when database was ready
 */
_WebSQLProvider.prototype.open = function(config, callback) {
    var context = this;

    try {
        var db = this.db = self.openDatabase(config.name, "", config.name, config.size);
    }
    catch(e) {
        fjs.utils.Console.error(e);
        fjs.db.WebSQLProvider.failed = true;
        callback(null);
        return;
    }

    for(var i=0; i<config.tables.length; i++) {
        var table = config.tables[i], _indexes = [];
        if(table.indexes) {
            for(var j=0; j<table.indexes.length; j++) {
                if(!fjs.utils.Array.isArray(table.indexes[j])&&_indexes.indexOf(table.indexes[j])<0) {
                    _indexes.push(table.indexes[j]);
                }
                else {
                    for(var k=0; k<table.indexes[j].length; k++) {
                        var ind = table.indexes[j][k];
                        if(_indexes.indexOf(ind)<0) {
                            _indexes.push(ind);
                        }
                    }
                }
            }
        }
        this.tables[table.name] = {'name':table.name, 'key':table.key, 'indexes':_indexes};
    }
    var _dbVersion = db.version;
    if(_dbVersion!=config.version) {
      db.changeVersion(db.version, config.version, function() {
        if(_dbVersion!=='') {
          context.clear(function () {
            context.createTables(function () {
              callback(context);
            });
          });
        }
        else {
          context.createTables(function () {
            callback(context);
          });
        }
      });
    }
    else {
        callback(this);
    }
};
/**
 * Creates tables
 * @protected
 */
_WebSQLProvider.prototype.createTables = function(callback) {
    var context = this;
  var keys = Object.keys(context.tables);
  for(var i=0; i<keys.length; i++) {
    var tableName = keys[i];
    var table = context.tables[tableName];
    (function(table){
      context.db.transaction(function (tx) {
      var query = 'CREATE TABLE IF NOT EXISTS ';
      query += table.name + '(' + table.key + ' TEXT PRIMARY KEY';
      query += (table.indexes.length > 0 ? ', ' + table.indexes.join(" TEXT, ") + " TEXT" : '');
      query += ', data TEXT)';
      tx.executeSql(query, [], function () {
        console.log(table.name, arguments)
      }, function () {
        console.error(table.name, arguments)
      });
      if (table.indexes) {
        for (var j = 0; j < table.indexes.length; j++) {
          var _query = "CREATE INDEX " + name + "_" + table.indexes[j] + "_idx ON " + name + " (" + table.indexes[j] + ")";
          tx.executeSql(_query);
        }
      }
    });
    })(table);
  }
  setTimeout(callback,0);
};


/**
 * Inserts one row to the database table
 * @param {string} tableName Table name
 * @param {*} item Item to insert
 * @param {Function} callback - Handler function to execute when row added
 */
_WebSQLProvider.prototype.insertOne = function(tableName, item, callback) {

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
_WebSQLProvider.prototype.insertArray = function(tableName, items, callback) {
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
_WebSQLProvider.prototype.deleteByKey = function(tableName, key, callback) {
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
_WebSQLProvider.prototype.selectAll = function(tableName, itemCallback, allCallback) {
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
_WebSQLProvider.prototype.selectByIndex = function(tableName, rules, itemCallback, allCallback) {
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
_WebSQLProvider.prototype.selectByKey = function(tableName, key, callback) {
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
_WebSQLProvider.prototype.clear = function(callback) {
    var _query = "DELETE FROM ", count= 0, context = this;
    this.db.transaction(function(tx){
        for(var tableName in context.tables) {
            count++;
            var query = _query + tableName;
            tx.executeSql(query, [],  function() {
                count--;
                if(callback && count==0) {
                  setTimeout(callback,0);
                }
            }, function(e){
              count--;
              if(callback && count==0) {
                setTimeout(callback,0);
              }
              console.error(e);
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
_WebSQLProvider.prototype.deleteByIndex = function(tableName, rules, callback) {
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
})();



