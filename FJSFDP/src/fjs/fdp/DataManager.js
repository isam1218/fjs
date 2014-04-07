namespace("fjs.fdp");

/**
 *
 *  It's main API object for works with FJSFDP.
 *  <br>
 *  <b>Singleton</b>
 * @param {string} authTicket Auth ticket
 * @param {string} node Node ID
 * @param {Object} config Application properties
 * @param {Function} callback Method to execute when FJSFDP initialized and ready to work
 * @constructor
 * @extends fjs.EventsSource
 */
fjs.fdp.DataManager = function(authTicket, node, config, callback) {
    //Singleton
    if (!this.constructor.__instance)
        this.constructor.__instance = this;
    else return this.constructor.__instance;

    var context = this;
    fjs.EventsSource.call(this);

    /**
     * Auth ticket
     * @type {string}
     */
    this.ticket = authTicket;
    /**
     * Node ID
     * @type {string}
     */
    this.node = node;
    /**
     * Application properties
     * @type {Object}
     */
    this.config = config;
    /**
     * @type {fjs.fdp.SyncManager}
     * @private
     */
    this.sm = new fjs.fdp.SyncManager(this.config);
    this.sm.init(this.ticket, this.node, function(){
        callback();
        context.sm.addEventListener("node", function(e){
           context.fireEvent("node", e);
        });
        context.sm.addEventListener("requestError", function(e){
            context.fireEvent("requestError", e);
        });
        context.sm.addEventListener("authError", function(e){
            context.fireEvent("authError", e);
        });
    });
    /**
     * @type {{}}
     * @private
     */
    this.proxies = {};
};

fjs.fdp.DataManager.extend(fjs.EventsSource);

/**
 * Adds listener on feed. If feed does not synchronize, adds this feed to synchronization.
 * @param {string} feedName Feed name
 * @param {Function} listener Handler function to execute when feed data changed
 */
fjs.fdp.DataManager.prototype.addFeedListener = function(feedName, listener) {
    var proxy = this.proxies[feedName];
    if(!proxy)  {
        proxy = this.proxies[feedName] = this.createProxy(feedName);
    }
    proxy.addListener(listener);
};

/**
 * Removes listener from feed, if the number of listeners == 0, it stops synchronization for this feed.
 * @param {string} feedName Feed name
 * @param {Function} listener Handler function to execute when feed data changed
 */
fjs.fdp.DataManager.prototype.removeFeedListener = function(feedName, listener) {
    var proxy = this.proxies[feedName];
    if(proxy)  {
        proxy.removeListener(listener);
    }
};

/**
 * Creates and returns ProxyModel for feed
 * @param {string} feedName Feed name
 * @returns {fjs.fdp.model.ProxyModel}
 * @private
 */
fjs.fdp.DataManager.prototype.createProxy = function(feedName) {
    switch(feedName) {
        case 'contacts':
            return new fjs.fdp.model.ProxyModel(['contacts', 'contactstatus', 'calls', 'calldetails', 'fdpImage', 'contactpermissions']);
        case 'locations':
            return new fjs.fdp.model.ProxyModel(['locations', 'location_status']);
        case 'mycalls':
            return new fjs.fdp.model.ProxyModel(['mycalls', 'mycalldetails']);
        case 'conferences':
            return new fjs.fdp.model.ProxyModel(['conferences', 'conferencestatus', 'conferencepermissions']);
        case 'sortings':
            return new fjs.fdp.model.ClientFeedProxyModel(['sortings']);
        default :
            return new fjs.fdp.model.ProxyModel([feedName]);
    }
};

/**
 * Forgets auth info and fire badAuth error.
 */
fjs.fdp.DataManager.prototype.logout = function() {
    this.sm.logout();
};
/**
 * Sends action to FDP server
 * @param {string} feedName Feed name
 * @param {string} actionName Action name
 * @param {Object} data Action data (request parameters).
 */
fjs.fdp.DataManager.prototype.sendAction = function(feedName, actionName, data) {
    var /** @type (fjs.fdp.model.ProxyModel) */ proxy = this.proxies[feedName];
    if(!proxy)  {
        console.warn("DataManager: sendAction: no proxy model for feed: " + feedName);
        return;
    }
    proxy.sendAction(feedName, actionName, data);
};

/**
 * Loads more items for feeds with dynamic loading
 * @param {string} feedName
 * @param filter Filter to load only specified data
 * @param {number} count Count of items
 */
fjs.fdp.DataManager.prototype.loadNext = function(feedName, filter, count) {
    if(!this.proxies[feedName]) {
        console.error("You don't listen this feed");
    }
    this.sm.loadNext(feedName, filter, count);
};

fjs.fdp.DataManager.prototype.fireEvent = function (eventType, eventData) {
    var _listeners = this.listeners[eventType];
    if(_listeners) {
        for (var i = 0; i < _listeners.length; i++) {
            _listeners[i](eventData);
        }
    }
    var _listeners2 = this.listeners[""];
    if(_listeners2) {
        for (var i = 0; i < _listeners2.length; i++) {
            _listeners2[i](eventData);
        }
    }
};