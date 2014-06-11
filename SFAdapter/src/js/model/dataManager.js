namespace("fjs.model");
/**
 * @constructor
 * @extends fjs.EventsSource
 */
fjs.model.DataManager = function(sf) {
    fjs.EventsSource.call(this);

    this.feeds = {};
    this.ticket = null;
    this.node = null;
    this.phoneMap = {};

    this.state = -1;
    this.suspendFeeds = [];
    this.warningListeners = {};

    this.sf = sf.getProvider();

    var context = this;
    var providerFactory = new fjs.api.FDPProviderFactory();

    this.authErrorCount = 0;
    this.MAX_AUTH_ERROR_COUNT = 3;
    this.tabSynchronizer = new fjs.api.TabsSynchronizer();
    this.checkLoginTimeoutId = null;

    var onClickToDial = function(obj) {
        /**
         * @type {{number:string, objectId:string, object:string}}
         */
        var res = obj && obj.result && JSON.parse(obj.result);
        var phone = res.number;
        if (phone) {
            var calleeInfo = {};
            calleeInfo.id = res.objectId;
            calleeInfo.type = res.object;
            var clientSettingsModel = context.getModel('clientsettings');
            clientSettingsModel.savePhone(phone, calleeInfo);
            context.sendAction(fjs.model.MeModel.NAME, "callTo", {'phoneNumber': phone});
        }
    };



    this.checkDevice = function() {
        var message = {};
        message.action = "setPhoneApi";
        message.data = {};
        message.data.isReg = true;
        message.callback = onClickToDial;
        context.sf.sendAction(message);
    };

    this.checkDevice();





    var stopCheckLoginInfo = function() {
        clearInterval(context.checkLoginTimeoutId);
    };

    var runCheckLoginInfo = function() {
        if(context.checkLoginTimeoutId!=null) {
            clearInterval(context.checkLoginTimeoutId);
        }
        context.checkLoginTimeoutId = setInterval(function () {
            context._getAuthInfo(function(data){
                if(data && context._authInfoChanged(data) && context.dataProvider && context.state) {
                    fjs.utils.Cookies.remove(fjs.model.DataManager.AUTH_COOKIE_NAME);
                    context.dataProvider.sendMessage({action: "SFLogin", data: data});
                }
            });
        }, 10000);
    };

    if(this.tabSynchronizer.isMaster) {
        runCheckLoginInfo();
    }

    this.tabSynchronizer.addEventListener('master_changed', function() {
        if(context.tabSynchronizer.isMaster) {
            runCheckLoginInfo();
        }
        else {
            stopCheckLoginInfo();
        }
    });

    this._getAuthInfo(function(data) {
        if(data) {
            if(context._authInfoChanged(data) || !context._getAccessInfo()) {
                 fjs.utils.Cookies.remove(fjs.model.DataManager.AUTH_COOKIE_NAME);
                 context.dataProvider = providerFactory.getProvider(null, null, function() {
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
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_SYNC, function(data) {
                data = data["data"] || data;
                context.fireEvent(data.feed, data);
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_AUTH_ERROR, function(e) {
                if(context.authErrorCount < context.MAX_AUTH_ERROR_COUNT) {
                    context._getAuthInfo(function(data){
                        context.dataProvider.sendMessage({action: "SFLogin", data: data});
                    });
                    context.authErrorCount++;
                }
                else {
                    context.fireWarningEvent(fjs.model.DataManager.AUTHORIZATION_STATE, e);
                }
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_REQUEST_ERROR, function(e) {
                fjs.utils.Console.error(e);
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_NETWORK_PROBLEM, function(e) {
                fjs.utils.Console.error(e);
                context.fireWarningEvent(fjs.model.DataManager.CONNECTION_STATE, false);
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_CONNECTION_ESTABLISHED, function(e) {
                fjs.utils.Console.info(e);
                context.fireWarningEvent(fjs.model.DataManager.CONNECTION_STATE, true);
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_NODE, function(e) {
                fjs.utils.Cookies.set(fjs.model.DataManager.NODE_COOKIE_NAME, context.node = e.data.nodeId);
            });
            context.dataProvider.addEventListener(fjs.model.DataManager.EV_TICKET, function(e) {
                fjs.utils.Cookies.set(fjs.model.DataManager.AUTH_COOKIE_NAME, context.ticket = e.data.ticket);
                context.fireWarningEvent(fjs.model.DataManager.AUTHORIZATION_STATE, e);
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

fjs.model.DataManager.AUTHORIZATION_STATE = "Authorization";
fjs.model.DataManager.CONNECTION_STATE = "Connection";

fjs.model.DataManager.EV_SYNC = "sync";
fjs.model.DataManager.EV_AUTH_ERROR = "authError";
fjs.model.DataManager.EV_REQUEST_ERROR = "requestError";
fjs.model.DataManager.EV_NETWORK_PROBLEM = "networkProblem";
fjs.model.DataManager.EV_CONNECTION_ESTABLISHED = "connectionEstablished";
fjs.model.DataManager.EV_TICKET = "ticket";
fjs.model.DataManager.EV_NODE = "node";

fjs.model.DataManager.AUTH_COOKIE_NAME = "SF_Authorization";
fjs.model.DataManager.NODE_COOKIE_NAME = "SF_Node";
fjs.model.DataManager.CLIENT_ID_COOKIE_NAME = "SF_Client_id";
fjs.model.DataManager.SERVER_URL_COOKIE_NAME = "SF_ServerUrl";
fjs.model.DataManager.HUD_LOGIN_COOKIE_NAME = "SF_Login";
fjs.model.DataManager.HUD_EMAIL_COOKIE_NAME = "SF_Email";
fjs.model.DataManager.ADM_LOGIN_COOKIE_NAME = "SF_ADM_Login";

fjs.model.DataManager.prototype.getModel = function(feedName) {
    if (!this.feeds[feedName]) {
        switch (feedName) {
            case fjs.model.MeModel.NAME:
                this.feeds[feedName] = new fjs.model.MeModel(this);
                break;
            case "mycallsclient":
               this.feeds[feedName] = new fjs.model.MyCallsFeedModel(this);
               break;
            case "clientsettings":
                this.feeds[feedName] = new fjs.model.ClientSettingsFeedModel(this);
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
    if(this.dataProvider) {
        this.dataProvider.sendMessage({"action":"fdp_action", "data": {"feedName":feedName, "actionName":action, "params": data}});
    }
};

/**
 * @param userData
 * @returns {boolean}
 * @private
 */
fjs.model.DataManager.prototype._authInfoChanged = function(userData) {
    var authInfoChanged = false;
    if(fjs.utils.Cookies.get(fjs.model.DataManager.HUD_LOGIN_COOKIE_NAME) != userData.hud+"") {
        if(this.tabSynchronizer.isMaster) {
            fjs.utils.Cookies.set(fjs.model.DataManager.HUD_LOGIN_COOKIE_NAME, userData.hud);
        }
        authInfoChanged = true;
    }
    if(fjs.utils.Cookies.get(fjs.model.DataManager.ADM_LOGIN_COOKIE_NAME) != userData.login+"") {
        if(this.tabSynchronizer.isMaster) {
            fjs.utils.Cookies.set(fjs.model.DataManager.ADM_LOGIN_COOKIE_NAME, userData.login + "");
        }
        authInfoChanged = true;
    }
    if(fjs.utils.Cookies.get(fjs.model.DataManager.HUD_EMAIL_COOKIE_NAME) != userData.email+"") {
        if(this.tabSynchronizer.isMaster) {
            fjs.utils.Cookies.set(fjs.model.DataManager.HUD_EMAIL_COOKIE_NAME, userData.email);
        }
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
    var message = {};
    message.action = "getLoginInfo";
    message.callback = function(response) {
        var data = null;
        /**
         * @type {{admLogin:string, admPassword:string, email:string, hudLogin:string, serverUrl:string}}
         */
        var res = null;
        if (response) {
            if (response.error) {
                fjs.utils.Console.error("SF response error", response.error);
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
            fjs.fdp.CONFIG.SERVER.serverURL = res.serverUrl;
        }
        callback(data);
    };
    this.sf.sendAction(message);
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

fjs.model.DataManager.prototype.addWarningListener = function(eventType, callback) {
    if(this.warningListeners[eventType]) {
        this.warningListeners[eventType].push(callback);
    }
    else {
        var events = [];
        events.push(callback);
        this.warningListeners[eventType] = events;
    }
};

fjs.model.DataManager.prototype.removeWarningListener = function(eventType, callback) {
    var i =this.warningListeners[eventType].indexOf(callback);
    if(i > -1) {
        this.warningListeners[eventType].splice(i, 1);
    }
};

fjs.model.DataManager.prototype.fireWarningEvent = function(eventType, data) {
    var listeners = this.warningListeners[eventType];
    if(listeners) {
        for(var i=0; i<listeners.length; i++) {
            listeners[i](data);
        }
    }
};
