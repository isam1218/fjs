namespace("fjs.hud");

fjs.hud.FDPDataManager = function() {

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
            "&redirect_uri="+encodeURIComponent(location.href)
            +"&display=page"
            +"&client_id=web.hud.fonality.com"
            +"&lang=eng"
            +"&revoke_token="+this.ticket;
    }

    if(!this.ticket) {
        location.href = this.getLogoutUrl();
    }
    this.init();
};

fjs.hud.FDPDataManager.prototype.init = function() {
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
            context.node = data.value;
            fjs.utils.Cookies.set("node", data.node);
        });
};

fjs.hud.FDPDataManager.prototype.getModel = function(feedName) {
    if(!this.feeds[feedName]) {
        //return new fjs.hud.FeedModel(feedName, this);
        switch (feedName) {
            case "me":
                this.feeds[feedName] = new fjs.hud.MeFeedModel(this);
                break;
//            case "locations":
//                this.feeds[feedName] = new fjs.fdp.LocationsFeedModel(this);
//                break;
//            case "contacts":
//                this.feeds[feedName] = new fjs.fdp.ContactsFeedModel(this);
//                break;
//            case "mycalls":
//                this.feeds[feedName] = new fjs.fdp.MyCallsFeedModel(this);
//                break;
//            case "groups":
//                this.feeds[feedName] = new fjs.fdp.GroupsFeedModel(this);
//                break;
//            case "groupcontacts":
//                this.feeds[feedName] = new fjs.fdp.GroupsMembersFeedModel(this);
//                break;
//            case "conferences":
//                this.feeds[feedName] = new fjs.fdp.ConferencesFeedModel(this);
//                break;
            default:
                this.feeds[feedName] = new fjs.hud.FeedModel(feedName, this);
        }
    }
    return this.feeds[feedName];
};

fjs.hud.FDPDataManager.prototype.sendAction = function(feedName, action, data, callback) {
    this.dataProvider.sendMessage({"action":"fdp_action", "data": {"feedName":feedName, "actionName":action, "params": data}});
};

fjs.hud.FDPDataManager.prototype.addListener = function(feedName, listener) {
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

fjs.hud.FDPDataManager.prototype.removeListener = function(feedName, listener) {
    var tmpListeners = this.listeners[feedName];
    if(tmpListeners)
    {
        var i = tmpListeners.indexOf(listener);
        if(i > -1) {
            tmpListeners.splice(i, 1);
        }
    }
};

fjs.hud.FDPDataManager.prototype.fireEvent = function(feedName, data) {
    if(this.listeners[feedName]) {
        for(var i=0; i<this.listeners[feedName].length; i++) {
            this.listeners[feedName][i](data);
        }
    }
};

fjs.hud.FDPDataManager.prototype.logout = function() {
    fjs.utils.Cookies.remove("Authorization");
    fjs.utils.Cookies.remove("node");
    this.dataProvider.logout();
};



