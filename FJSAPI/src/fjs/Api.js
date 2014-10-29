fjs.core.namespace("fjs");
/**
 * @param {Object} config
 * @constructor
 * @extends fjs.model.EventsSource
 */

fjs.API = function(config, ticket, node) {
    //Singleton
    if (!this.constructor.__instance)
        this.constructor.__instance = this;
    else return this.constructor.__instance;

    var context = this;

    fjs.model.EventsSource.call(this);

    this.config = config;

    this.ticket = ticket ? (fjs.utils.Cookies.set("Authorization", ticket), ticket) : null;

    this.node = node ? (fjs.utils.Cookies.set("node", ticket), node) : null;

    this.instanceId = null;



    this.fdpProviderFactory = new fjs.api.FDPProviderFactory(config);

    this.dataProvider = null;

    this.suspendFeeds = [];

    this.suspendActions = [];

    this.state = -1;

    if (/access_token/ig.test(location.href)) {
       this.ticket = location.href.match(/access_token=([^&]+)/)[1];

       fjs.utils.Cookies.set("Authorization", this.ticket);

       this.instanceId = location.href.match(/instance_id=([^&]+)/)[1];

        fjs.utils.Cookies.set("client_id", this.instanceId);
        fjs.utils.Cookies.set("rememberMe", false);
            //clear hash with access token
       location.href = this._clearHash(location.href);
    }
    else {
        this.ticket = fjs.utils.Cookies.get("Authorization");
        this.node = fjs.utils.Cookies.get("node");
        this.instanceId = fjs.utils.Cookies.get("client_id");
    }
    if(!this.ticket) {
        setTimeout(function(){
            context.fireEvent('auth', {error: 'no_ticket', message:'No auth ticket'});
            context.tryRelogin();
        },0);
    }
    else {
        this.dataProvider = this.fdpProviderFactory.getProvider(this.ticket, this.node, function() {
            context.state = 1;
            if(context.suspendFeeds.length>0) {
                for(var i=0; i<context.suspendFeeds.length; i++) {
                    context.dataProvider.addSyncForFeed(context.suspendFeeds[i]);
                }
                context.suspendFeeds=[];
            }
            if(context.suspendActions.length>0) {
                for(var j=0; j<context.suspendActions.length; j++) {
                    context.dataProvider.sendMessage(context.suspendActions[j]);
                }
                context.suspendActions=[];
            }
        });
        this.dataProvider.addEventListener('sync', function(data) {
            setTimeout(function() {
                context.fireEvent('sync', data);
            }, 0);
        });
        this.dataProvider.addEventListener('authError', function(data) {
            setTimeout(function() {
                context.fireEvent('auth', {error: 'authError', message: data.messge});
                context.tryRelogin();
            },0);
        });
        this.dataProvider.addEventListener('logout', function(data) {
            setTimeout(function() {
                location.href = context.getLogoutUrl();
            },0);
        });
        this.dataProvider.addEventListener('node', function(event) {
            setTimeout(function() {
                context.node = event.data.nodeId;
                fjs.utils.Cookies.set('node', context.node);
                context.fireEvent('auth', {node: context.node});
            },0);
        });

    }
};
fjs.core.inherits(fjs.API, fjs.model.EventsSource);

/**
 * Clears hash from url
 * @param {string} href
 * @returns {string}
 * @private
 */
fjs.API.prototype._clearHash = function (href) {
    var ind = href.indexOf('#');
    if (ind > 0) // remove tail
    {
        return href.substring(0, ind);
    }
    return href;
};

fjs.API.prototype.getLogoutUrl = function () {
    return this.config.SERVER.loginURL + "/oauth/authorize" +
    "?response_type=token" +
    "&redirect_uri=" + encodeURIComponent(this._clearHash(location.href))
    + "&display=page"
    + "&client_id=web.hud.fonality.com"
    + (this.ticket ? "&revoke_token=" + this.ticket : "")
    + (this.instanceId ? "&instance_id=" + this.instanceId : "");
};

fjs.API.prototype.addSyncForFeed = function(feedName) {
    if(this.state!=1) {
        if(this.suspendFeeds.indexOf(feedName)<0) {
            this.suspendFeeds.push(feedName);
        }
    }
    else {
        this.dataProvider.addSyncForFeed(feedName);
    }
};

fjs.API.prototype.removeSyncForFeed = function(feedName) {
    if(this.state!=1) {
        var index = this.suspendFeeds.indexOf(feedName);
        if(index>-1) {
            this.suspendFeeds.splice(index,1);
        }
    }
    else {
        this.dataProvider.removeSyncForFeed(feedName);
    }
};

fjs.API.prototype.sendAction = function(feedName, action, data) {
    var message = {"action":"fdp_action", "data": {"feedName":feedName, "actionName":action, "params": data}};
    if(this.state!=1) {
        this.suspendActions.push(message);
    }
    else {
        this.dataProvider.sendMessage(message);
    }
};
fjs.API.prototype.logout = function() {
    //this.ticket = null;
    //this.node = null;
    //this.instanceId = null;
	
    fjs.utils.Cookies.remove("Authorization");
    fjs.utils.Cookies.remove("node");
    this.dataProvider.logout();
};
fjs.API.prototype.tryRelogin = function() {
    location.href = this.getLogoutUrl();
};

