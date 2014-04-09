namespace("fjs.model");
/**
 *
 * @constructor
 * @extends fjs.EventsSource
 */
fjs.model.DataManager = function(sf) {
    fjs.EventsSource.call(this);

    this.feeds = {};
    this.ticket = null;
    this.node = null;

    this.sf = sf;
    this.phoneMap = {};

    this.state = -1;
    this.suspendFeeds = [];

    var providerFactory = new fjs.api.FDPProviderFactory();
    var context = this;

    this.checkDevice = function() {
        context.sf.setPhoneApi(true, function (obj) {
            var res = obj && obj.result && JSON.parse(obj.result);
            var phone = res.number;
            if (phone) {
                var calleeInfo = {};
                calleeInfo.id = res.objectId;
                calleeInfo.type = res.object;
                context.phoneMap[phone] = calleeInfo;
                context.sendAction('me', "callTo", {'phoneNumber': phone});
            }
        });
    };
    this.checkDevice();

    this._getAuthInfo(function(data){
        if(data) {
             if(context._authInfoChanged(data) || !context._getAccessInfo()) {
                 fjs.utils.Cookies.remove(fjs.model.DataManager.AUTH_COOKIE_NAME);
                 context.dataProvider = providerFactory.getProvider(null, null, function() {
                     //context.dataProvider.sendMessage({action:"logout"});
                     context.dataProvider.sendMessage({action: "SFLogin", data: data});
                     context.state = 1;
                 });
            }
            else {
                 context.dataProvider = providerFactory.getProvider(context.ticket, context.node, function() {
                     context.state = 1;
                     if(context.suspendFeeds.length>0) {
                         for(var i=0; i<context.suspendFeeds.length; i++) {
                             context.dataProvider.addSyncForFeed(context.suspendFeeds[i]);
                         }
                         context.suspendFeeds=[];
                     }
                 });
            }
            context.dataProvider.addEventListener("sync", function(data) {
                context.fireEvent(data.feed, data);
            });
            context.dataProvider.addEventListener("authError", function(e) {
                context._getAuthInfo(function(data){
                    context.dataProvider.sendMessage({action: "SFLogin", data: data});
                });

            });
            context.dataProvider.addEventListener("requestError", function(e) {
                console.error(e);
            });
            context.dataProvider.addEventListener("node", function(e) {
                fjs.utils.Cookies.set(fjs.model.DataManager.NODE_COOKIE_NAME, context.node = e.data.nodeId);
            });
            context.dataProvider.addEventListener("ticket", function(e) {
                fjs.utils.Cookies.set(fjs.model.DataManager.AUTH_COOKIE_NAME, context.ticket = e.data.ticket);
                if(context.suspendFeeds.length>0) {
                    for(var i=0; i<context.suspendFeeds.length; i++) {
                        context.dataProvider.addSyncForFeed(context.suspendFeeds[i]);
                    }
                    context.suspendFeeds=[];
                }
            });
        }
    });
};
fjs.model.DataManager.extend(fjs.EventsSource);

fjs.model.DataManager.AUTH_COOKIE_NAME = "SF_Authorization";
fjs.model.DataManager.NODE_COOKIE_NAME = "SF_Node";
fjs.model.DataManager.CLIENT_ID_COOKIE_NAME = "SF_Client_id";
fjs.model.DataManager.SERVER_URL_COOKIE_NAME = "SF_ServerUrl";
fjs.model.DataManager.HUD_LOGIN_COOKIE_NAME = "SF_Login";
fjs.model.DataManager.HUD_EMAIL_COOKIE_NAME = "SF_Email";

fjs.model.DataManager.prototype.getModel = function(feedName) {
    if (!this.feeds[feedName]) {
        switch (feedName) {
            case 'me':
                this.feeds[feedName] = new fjs.model.MeModel(this);
                break;
            case 'mycalls':
               this.feeds[feedName] = new fjs.model.MyCallsFeedModel(this);
                break;
            default:
               this.feeds[feedName] = new fjs.model.FeedModel(feedName, this);
                break;
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

fjs.model.DataManager.prototype.sendAction = function(feedName, action, data) {
    this.dataProvider.sendMessage({"action":"fdp_action", "data": {"feedName":feedName, "actionName":action, "params": data}});
};

/**
 *
 * @param userData
 * @returns {boolean}
 * @private
 */
fjs.model.DataManager.prototype._authInfoChanged = function(userData) {
    var authInfoChanged = false;
    if(fjs.utils.Cookies.get(fjs.model.DataManager.HUD_LOGIN_COOKIE_NAME) != userData.hud) {
        fjs.utils.Cookies.set(fjs.model.DataManager.HUD_LOGIN_COOKIE_NAME, userData.hud);
        authInfoChanged = true;
    }
    if(fjs.utils.Cookies.get(fjs.model.DataManager.HUD_EMAIL_COOKIE_NAME) != userData.email) {
        fjs.utils.Cookies.set(fjs.model.DataManager.HUD_EMAIL_COOKIE_NAME, userData.email);
        authInfoChanged = true;
    }
    return authInfoChanged;
};

fjs.model.DataManager.prototype._getAccessInfo = function() {
    this.ticket = fjs.utils.Cookies.get(fjs.model.DataManager.AUTH_COOKIE_NAME);
    this.node = fjs.utils.Cookies.get(fjs.model.DataManager.NODE_COOKIE_NAME);
    return this.ticket;
};

fjs.model.DataManager.prototype._getAuthInfo = function(callback) {

    this.sf.getLoginInfo(function(response) {
        var data = null;
        /**
         * @type {{admLogin:string, admPassword:string, email:string, hudLogin:string}}
         */
        var res = null;
        if (response) {
            if (response.error) {
                console.error("SF response error", response.error);
                callback(null);
            }
            else {
                res = JSON.parse(response.result);
            }
        }
        if (res) {
            data = {
                "login": res.admLogin, "token": res.admPassword, "email": res.email
            };
            if (res.hudLogin) {
                data.hud = res.hudLogin;
            }
        }
        callback(data);
    });
};

fjs.model.DataManager.prototype.addEventListener = function(feedName, handler) {
    if(!this.listeners[feedName] || this.listeners[feedName].length == 0) {
        if(this.state!=1 && this.suspendFeeds.indexOf(feedName)<0) {
            this.suspendFeeds.push(feedName);
        }
        else {
            this.dataProvider.addSyncForFeed(feedName);
        }
    }
    this.superClass.addEventListener.call(this, feedName, handler);
};

fjs.model.DataManager.prototype.removeEventListener = function(feedName, handler) {
    this.superClass.removeEventListener.call(this, feedName, handler);
    if(!this.listeners[feedName] || this.listeners[feedName].length == 0) {
            this.dataProvider.removeSyncForFeed(feedName);
    }
};
