namespace("fjs.fdp");
/**
 * @param {string} authTicket
 * @param {string} node
 * @param {window} globalObject
 * @param {{requestAuth: Function, setNode: (function(string))}} authHandler
 * @param {Function} callback
 * @constructor
 */
fjs.fdp.DataManager = function(authTicket, node, globalObject, authHandler, callback) {
    //Singleton
    if (!this.constructor.__instance)
        this.constructor.__instance = this;
    else return this.constructor.__instance;
    this.ticket = authTicket;
    var dbFactory = new fjs.db.DBFactory(globalObject);
    this.db = dbFactory.getDB();
    this.ajax = new fjs.ajax.XHRAjax();
    /**
     * @type {fjs.fdp.SyncManager}
     */
    this.sm = new fjs.fdp.SyncManager(this.db, this.ajax);
    this.sm.init(this.ticket, null, fjs.fdp.CONFIG.SERVER.serverURL, authHandler, function(){
        callback();
    });
    this.proxies = {};
};

/**
 * @param {string} feedName
 * @param {Function} listener
 */
fjs.fdp.DataManager.prototype.addListener = function(feedName, listener) {
    var proxy = this.proxies[feedName];
    if(!proxy)  {
        proxy = this.proxies[feedName] = this.createProxy(feedName);
    }
    proxy.addListener(listener);
};

/**
 * @param {string} feedName
 * @param {Function} listener
 */
fjs.fdp.DataManager.prototype.removeListener = function(feedName, listener) {
    var proxy = this.proxies[feedName];
    if(proxy)  {
        proxy.removeListener(listener);
    }
};

/**
 * @param {string} feedName
 * @returns {fjs.fdp.ProxyModel}
 * @private
 */
fjs.fdp.DataManager.prototype.createProxy = function(feedName) {
    switch(feedName) {
        case 'contacts':
            return new fjs.fdp.ProxyModel(['contacts', 'contactstatus', 'calls', 'calldetails']);
        break;
        default :
            return new fjs.fdp.ProxyModel([feedName]);
    }
};