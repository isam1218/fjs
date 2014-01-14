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
    this.sm = new fjs.fdp.SyncManager(this.db, this.ajax, fjs.fdp.CONFIG);
    this.sm.init(this.ticket, null, authHandler, function(){
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
        case 'locations':
            return new fjs.fdp.ProxyModel(['locations', 'location_status']);
        break;
        case 'mycalls':
            return new fjs.fdp.ProxyModel(['mycalls', 'mycalldetails']);
        break;
        case 'conferences':
            return new fjs.fdp.ProxyModel(['conferences', 'conferencestatus', 'conferencepermissions']);
        case 'sortings':
            return new fjs.fdp.ClientProxyModel(['sortings']);
        default :
            return new fjs.fdp.ProxyModel([feedName]);
    }
};

fjs.fdp.DataManager.prototype.logout = function() {
    this.sm.logout();
};
/**
 * @param {string} feedName
 * @param {string} actionName
 * @param {*} data
 */
fjs.fdp.DataManager.prototype.sendAction = function(feedName, actionName, data) {
    var /** @type (fjs.fdp.ProxyModel) */ proxy = this.proxies[feedName];
    if(!proxy)  {
        console.warn("DataManager: sendAction: no proxy model for feed: " + feedName);
        return;
    }
    proxy.sendAction(feedName, actionName, data);
};