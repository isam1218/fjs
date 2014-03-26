namespace('fjs.db');
/**
 * Database providers factory.<br/>
 * It checks the capabilities of browsers and creates database providers.
 * @constructor
 */
fjs.db.DBFactory = function(config) {

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
};

/**
 * Selects and returns the most appropriate database provider.
 * @returns {fjs.db.IDBProvider|undefined}
 */
fjs.db.DBFactory.prototype.getDB = function() {
    /**
     * priority of databases
     * @type {Array}
     */
    var dbs = this.config.DB.dbProviders;
    for(var i=0; i<dbs.length; i++) {
        if(this._dbRegister[dbs[i]].check()) {
            return new this._dbRegister[dbs[i]]();
        }
    }
};
