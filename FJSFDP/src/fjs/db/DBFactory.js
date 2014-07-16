namespace('fjs.db');
/**
 * Database providers factory.<br/>
 * It checks the capabilities of browsers and creates database providers.
 * @constructor
 */
fjs.db.DBFactory = function(config) {
    if (!this.constructor.__instance)
        this.constructor.__instance = this;
    else return this.constructor.__instance;

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

    this.currentDB = null;
    this.currentDBIndex = -1;
};

/**
 * Selects and returns the most appropriate database provider.
 * @param {fjs.db.IDBProvider?} oldDB Previous database if it failed.
 * @returns {fjs.db.IDBProvider|undefined}
 */
fjs.db.DBFactory.prototype.getDB = function(oldDB) {
    /**
     * priority of databases
     * @type {Array}
     */
    if(!this.currentDB || oldDB) {
        var dbs = this.config.DB.dbProviders;
        for(var i=this.currentDBIndex+1; i<dbs.length; i++) {
            if (this._dbRegister[dbs[i]].check()) {
                this.currentDB = new this._dbRegister[dbs[i]]();
                this.currentDBIndex = i;
                break;
            }
        }
    }
    return this.currentDB;
};
