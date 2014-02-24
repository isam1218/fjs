namespace("fjs.hud");
/**
 * Data manager
 * @constructor
 * @final
 */
fjs.hud.DataManager = function() {
//Singleton
    if (!this.constructor.__instance)
        this.constructor.__instance = this;
    else return this.constructor.__instance;

    var context = this;

    this.feeds = {};

    this.ticket = null;
    this.node = null;

    this.suspendListeners=[];
    this.isReady = false;

    if(/access_token/ig.test(location.href)) {
        this.ticket = location.href.match(/access_token=([^&]+)/)[1];
        fjs.utils.Cookies.set("Authorization", this.ticket);
        //clear hash with access token
        location.href = this.clearHash(location.href);
    }
    else {
        this.ticket = fjs.utils.Cookies.get("Authorization");
        this.node = fjs.utils.Cookies.get("node");
    }

    this.listeners = {};
    /**
     * @type {fjs.api.ClientDataProviderBase}
     */
    this.dataProvider =null;

    this.getLogoutUrl = function() {
        return fjs.fdp.CONFIG.SERVER.loginURL+"?response_type=token" +
            "&redirect_uri="+encodeURIComponent(this.clearHash(location.href))
            +"&display=page"
            +"&client_id=web.hud.fonality.com"
            +"&lang=eng"
            + (this.ticket ? "&revoke_token="+this.ticket : "");
    };

    if(!this.ticket) {
        location.href = this.getLogoutUrl();
    }
    this.init();
};
/**
 * Clears hash from url
 * @param {string} href
 * @returns {string}
 * @private
 */
fjs.hud.DataManager.prototype.clearHash = function(href){
    var ind = href.indexOf('#');
    if(ind > 0) // remove tail
    {
        return href.substring(0, ind);
    }
    return href;
};
/**
 * Initialises work with FJSFDPApi
 * @private
 */
fjs.hud.DataManager.prototype.init = function() {
    var context = this;
        var providerFactory = new fjs.api.FDPProviderFactory();
          context.dataProvider = providerFactory.getProvider(context.ticket, context.node, function(){
              for(var i=0; i<context.suspendListeners.length; i++) {
                  context.dataProvider.addSyncForFeed(context.suspendListeners[i]);
              }
              context.suspendListeners = [];
              context.isReady = true;
          });
        this.dataProvider.addListener("sync", function(data) {
            context.fireEvent(data.feed, data);
        });
        this.dataProvider.addListener("requestAuth", function() {
            location.href = context.getLogoutUrl();
        });
        this.dataProvider.addListener("setNode", function(data) {
            context.node = data.node;
            fjs.utils.Cookies.set("node", data.node);
        });
};
/**
 * Returns feed model by name
 * @param {string} feedName - Feed Name
 * @returns {fjs.hud.FeedModel}
 */
fjs.hud.DataManager.prototype.getModel = function(feedName) {
    if(!this.feeds[feedName]) {
        switch (feedName) {
            case "me":
                this.feeds[feedName] = new fjs.hud.MeFeedModel(this);
                break;
//            case "locations":
//                this.feeds[feedName] = new fjs.fdp.LocationsFeedModel(this);
//                break;
            case "contacts":
                this.feeds[feedName] = new fjs.hud.ContactsFeedModel(this);
                break;
//            case "mycalls":
//                this.feeds[feedName] = new fjs.fdp.MyCallsFeedModel(this);
//                break;
            case "groups":
                this.feeds[feedName] = new fjs.hud.GroupsFeedModel(this);
                break;
//            case "groupcontacts":
//                this.feeds[feedName] = new fjs.fdp.GroupsMembersFeedModel(this);
//                break;
            case "conferences":
                this.feeds[feedName] = new fjs.hud.ConferenceFeedModel(this);
                break;
            case "conferencemembers":
                this.feeds[feedName] = new fjs.hud.ConferenceMemberFeedModel(this);
                break;
            case "sortings":
                this.feeds[feedName] = new fjs.hud.SortingFeedModel(this);
                break;
            case "voicemailbox":
                this.feeds[feedName] = new fjs.hud.VoicemailMessageFeedModel(this);
                break;
            default:
                this.feeds[feedName] = new fjs.hud.FeedModel(feedName, this);
        }
    }
    return this.feeds[feedName];
};

/**
 * Sends action to FDP server
 * @param {string} feedName
 * @param {string} action
 * @param {*} data
 */

fjs.hud.DataManager.prototype.sendAction = function(feedName, action, data) {
    this.dataProvider.sendMessage({"action":"fdp_action", "data": {"feedName":feedName, "actionName":action, "params": data}});
};
/**
 * Adds listener on feed changes
 * @param feedName
 * @param listener
 */
fjs.hud.DataManager.prototype.addListener = function(feedName, listener) {
    if(!this.isReady) {
        this.suspendListeners.push(feedName);
    }
    else {
        this.dataProvider.addSyncForFeed(feedName);
    }
        if(listener) {
        var tmpListeners = this.listeners[feedName], context = this;
        if(!tmpListeners) {
            tmpListeners = this.listeners[feedName] = [];
        }
        if(-1 < tmpListeners.indexOf(listener)) {
            console.error("SyncManager error: duplicate listener for" + feedName);
        }
        else {
            tmpListeners.push(listener);
        }
    }
};

/**
 * Removes listener from feed changes
 * @param {string} feedName
 * @param {Function} listener
 */

fjs.hud.DataManager.prototype.removeListener = function(feedName, listener) {
    var tmpListeners = this.listeners[feedName];
    if(tmpListeners)
    {
        var i = tmpListeners.indexOf(listener);
        if(i > -1) {
            tmpListeners.splice(i, 1);
        }
    }
};
/**
 * Sends events
 * @param feedName
 * @param data
 * @private
 */
fjs.hud.DataManager.prototype.fireEvent = function(feedName, data) {
    if(this.listeners[feedName]) {
        for(var i=0; i<this.listeners[feedName].length; i++) {
            this.listeners[feedName][i](data);
        }
    }
};
/**
 * Forgets auth info and do logout.
 */
fjs.hud.DataManager.prototype.logout = function() {
    fjs.utils.Cookies.remove("Authorization");
    fjs.utils.Cookies.remove("node");
    this.dataProvider.logout();
};

fjs.hud.DataManager.prototype.sendFDPRequest = function(url, data, callback) {
    data["t"] = "web";
    data["alt"] = 'j';
    var headers = {Authorization: "auth="+this.ticket, node:this.node};

    var ajax = new fjs.ajax.XHRAjax();
    ajax.send('POST', fjs.fdp.CONFIG.SERVER.serverURL+url, headers, data, callback);
};



