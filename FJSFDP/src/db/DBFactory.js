namespace('fjs.db');
/**
 * Database providers factory
 * @param {window} globalObject
 * @constructor
 */
fjs.db.DBFactory = function(globalObject) {
    /**
     * @enum {fjs.db.IDBProvider}
     * @private
     */
    this._dbRegister = {
        'indexedDB':  fjs.db.IndexedDBProvider
        , 'webSQL': fjs.db.WebSQLProvider
        , 'localStorage': fjs.db.LocalStorageDbProvider
    };
    this.globalObject = globalObject;
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
    var dbs = fjs.fdp.CONFIG.DB.dbProviders;
    for(var i=0; i<dbs.length; i++) {
        if(this._dbRegister[dbs[i]].check(this.globalObject)) {
            return new this._dbRegister[dbs[i]](this.globalObject);
        }
    }
};
