namespace('fjs.db');
/**
 * @param {window} globalObject
 * @constructor
 */
fjs.db.DBFactory = function(globalObject) {
    /**
     * @enum {fjs.db.IDBProvider}
     * @private
     */
    this._dbReestr = {
        'indexedDB':  fjs.db.IndexedDBProvider
        , 'webSQL': fjs.db.WebSQLProvider
        , 'localStorage': fjs.db.LocalStorageDbProvider
    };
    this.globalObject = globalObject;
};

/**
 * @returns {fjs.db.IDBProvider|undefined}
 */
fjs.db.DBFactory.prototype.getDB = function() {
    /**
     * @type {Array}
     */
    var dbs = fjs.fdp.CONFIG.DB.dbProviders;
    for(var i=0; i<dbs.length; i++) {
        if(this._dbReestr[dbs[i]].check(this.globalObject)) {
            return new this._dbReestr[dbs[i]](this.globalObject);
        }
    }
};
