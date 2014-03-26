namespace("fjs.fdp");

/**
 *
 *  It's main API object for works with FJSFDP.
 *  <br>
 *  <b>Singleton</b>
 * @param {string} authTicket Auth ticket
 * @param {string} node Node ID
 * @param {Function} callback Method to execute when FJSFDP initialized and ready to work
 * @constructor
 * @extends fjs.EventsSource
 */
fjs.fdp.DataManager = function(authTicket, node, callback) {
    //Singleton
    if (!this.constructor.__instance)
        this.constructor.__instance = this;
    else return this.constructor.__instance;

    var context = this;
    fjs.EventsSource.call(this);

    this.ticket = authTicket;
    this.node = node;
    /**
     * @type {fjs.fdp.SyncManager}
     * @private
     */
    this.sm = new fjs.fdp.SyncManager(fjs.fdp.CONFIG);
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
 * @returns {fjs.fdp.ProxyModel}
 * @private
 */
fjs.fdp.DataManager.prototype.createProxy = function(feedName) {
    switch(feedName) {
        case 'contacts':
            return new fjs.fdp.ProxyModel(['contacts', 'contactstatus', 'calls', 'calldetails', 'fdpImage', 'contactpermissions']);
        case 'locations':
            return new fjs.fdp.ProxyModel(['locations', 'location_status']);
        case 'mycalls':
            return new fjs.fdp.ProxyModel(['mycalls', 'mycalldetails']);
        case 'conferences':
            return new fjs.fdp.ProxyModel(['conferences', 'conferencestatus', 'conferencepermissions']);
        case 'sortings':
            return new fjs.fdp.ClientProxyModel(['sortings']);
        default :
            return new fjs.fdp.ProxyModel([feedName]);
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
    var /** @type (fjs.fdp.ProxyModel) */ proxy = this.proxies[feedName];
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