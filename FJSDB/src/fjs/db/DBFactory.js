(function(){
var _DBFactory =
/**
 * Database providers factory.<br/>
 * It checks the capabilities of browsers and creates database providers.
 * @constructor
 */
fjs.db.DBFactory = function(config) {
    //Singleton
    if (!this.constructor.__instance)
        this.constructor.__instance = this;
    else return this.constructor.__instance;

    this.config = config;

    /**
     * @enum {fjs.db.DBProviderBase}
     * @private
     */
    this._dbRegister = {
        'indexedDB':  fjs.db.IndexedDBProvider
        , 'webSQL': fjs.db.WebSQLProvider
        , 'localStorage': fjs.db.LocalStorageDbProvider
    };

    this.currentDB = null;
};

/**
 * Selects and returns the most appropriate database provider.
 * @param {function} callback Previous database if it failed.
 */
_DBFactory.prototype.getDB = function(callback) {

    var dbs = this.config.dbProviders, context = this;
    if(!this.currentDB) {
        fjs.core.asyncForIn(dbs, function (key, providerName, next) {
            if (context._dbRegister[providerName].check()) {
                var db = new context._dbRegister[providerName]();
                db.open(context.config, function (db) {
                    if (db) {
                        context.currentDB = db;
                        callback(db);
                    }
                    else {
                        next();
                    }
                });
            }
            else {
                next();
            }

        }, function () {
            if (!context.currentDB) {
                callback(null);
            }
        });
    }
    else {
        setTimeout(function(){callback(context.currentDB)},0);
    }
};
})();
