/**
 * Created with JetBrains WebStorm.
 * User: ddyachenko
 * Date: 19.08.13
 * Time: 13:08
 *
 * SyncManager is responsible for feed synchronization and user authorization.
 */
namespace("fjs.fdp");

fjs.fdp.SyncManager = function() {
    var context = this;
    //Singleton
    if (!fjs.fdp.SyncManager.__instance)
        fjs.fdp.SyncManager.__instance = this;
    else return fjs.fdp.SyncManager.__instance;
    this.state = fjs.fdp.SyncManager.NOT_INITIALIZED;

    this.ajax = new fjs.Ajax();
    this.listeners = {};
    this.versions = {};
    this.ticket = null;
    this.node = null;
    this.syncFeeds = [];
    this.currentVersioncache = null;
    this.suspendFeeds=[];
    this.badLoginAttempts = 0;
    this.eventListeners = {};
};

fjs.fdp.SyncManager.NOT_INITIALIZED = -1;
fjs.fdp.SyncManager.INITIALIZATION = 0;
fjs.fdp.SyncManager.READY = 1;
fjs.fdp.SyncManager.MAX_LOGIN_TIMES = 3;

fjs.fdp.SyncManager.AUTH_COOKIE_NAME = "SF_Authorization";
fjs.fdp.SyncManager.NODE_COOKIE_NAME = "SF_Node";
fjs.fdp.SyncManager.CLIENT_ID_COOKIE_NAME = "SF_Client_id";
fjs.fdp.SyncManager.SERVER_URL_COOKIE_NAME = "SF_ServerUrl";
fjs.fdp.SyncManager.HUD_LOGIN_COOKIE_NAME = "SF_Login";
fjs.fdp.SyncManager.HUD_EMAIL_COOKIE_NAME = "SF_Email";
fjs.fdp.SyncManager.CLIENT_TYPE = "salesforce";

fjs.fdp.SyncManager.prototype.init = function() {
    var context = this;
    this.state = fjs.fdp.SyncManager.INITIALIZATION;
    this.ticket = CookiesHelper.getCookie(fjs.fdp.SyncManager.AUTH_COOKIE_NAME);
    this.node = CookiesHelper.getCookie(fjs.fdp.SyncManager.NODE_COOKIE_NAME);
    this.serverHost = CookiesHelper.getCookie(fjs.fdp.SyncManager.SERVER_URL_COOKIE_NAME);

    if(this.ticket) this.ajax.setTicket(this.ticket);
    if(this.node) this.ajax.setNode(this.node);

    window.addEventListener("storage", function(e){
        if(e.key == 'sync') {
            context.onSync(e.newValue);
        }
    }, false);

    this.doLogin(function(){
        context.requestClientRegistry(function(isOK){
             if(isOK) {
                 context.finishInitialization();
             }
        });
    });
};

fjs.fdp.SyncManager.prototype.finishInitialization = function() {
    this.state = fjs.fdp.SyncManager.READY;
    if(this.suspendFeeds.length > 0) {
        this.startSync(this.suspendFeeds);
        this.suspendFeeds = [];
    }
};

fjs.fdp.SyncManager.prototype.checkConnection = function(xmlhttp){
    if(xmlhttp && xmlhttp.status == 0) {
        this.fireEvent("Connection", false);
    }
    else {
        this.fireEvent("Connection", true);
    }
};

/**
 * Parses feed data from FDP server.
 *
 * @param data - data from FDP.
 * @returns map of parsed data.
 */
fjs.fdp.SyncManager.prototype.parseFdpData = function(data) {
    var dataArr = data.split('\n');
    var result = {};
    for(var i=0; i<dataArr.length; i++) {
        if(dataArr[i].indexOf("=")>-1) {
            var itemArr = dataArr[i].split("=");
            var key = itemArr[0].trim();
            var val = itemArr[1].trim();
            if(key && val) {
                result[key] = val;
            }
        }
    }
    return result;
};

/**
 * Checks if string is null, undefined or empty.
 *
 * @param str - requested string
 * @returns true if the requested string is null, undefined or empty, false otherwise
 */
fjs.fdp.SyncManager.prototype.isEmptyString = function(str) {
    return (str == "" || str == null || str == undefined);
};

/**
 * Gets user credentials from SF and sends request to FDP to authorize the user.
 * If authorization was successf it saves user access token, server URL, client id and node id to the Cookies.
 *
 * @param callback - JavaScript method called upon completion of the method.
 * @result This method is asynchronous so it returns its response in an object in a callback method.
 * The response contains true, if authorization was successful, false otherwise.
 */
fjs.fdp.SyncManager.prototype.doLogin = function(callback) {
    var context = this;
    var sf = new SFApi();

    sf.getLoginInfo( function( response){
        var data = null;
        var res = null;
        if(response){
           if(response.error){
               console.error(response.error);
               return;
           }
           else{
               res = JSON.parse(response.result);
           }
        }
        if(res){
            data = {
                "login":res.admLogin
                , "token":res.admPassword
                , "email": res.email
                , "t": fjs.fdp.SyncManager.CLIENT_TYPE
            };
            var loginChanged = false;
            var emailChanged = false;
            var oldHudLogin = CookiesHelper.getCookie(fjs.fdp.SyncManager.HUD_LOGIN_COOKIE_NAME);
            if(res.hudLogin){
                data.hud =  res.hudLogin;
            }
            if(oldHudLogin != res.hudLogin){
                CookiesHelper.setCookie(fjs.fdp.SyncManager.HUD_LOGIN_COOKIE_NAME, res.hudLogin);
                loginChanged = true;
            }
            var oldHudEmail = CookiesHelper.getCookie(fjs.fdp.SyncManager.HUD_EMAIL_COOKIE_NAME);
            if(oldHudEmail != res.email){
                CookiesHelper.setCookie(fjs.fdp.SyncManager.HUD_EMAIL_COOKIE_NAME, res.email);
                emailChanged = true;
            }
            var clientId = CookiesHelper.getCookie(fjs.fdp.SyncManager.CLIENT_ID_COOKIE_NAME);
            if(clientId) {
                data.client_id = clientId;
            }
            context.serverHost = res.serverUrl;

            if(!context.isEmptyString(data.login) && !context.isEmptyString(data.token) && (!context.isEmptyString(data.hud)|| !context.isEmptyString(data.email)) || emailChanged || loginChanged) {
                CookiesHelper.setCookie(fjs.fdp.SyncManager.AUTH_LOGIN_COOKIE_NAME, res.admLogin);
                CookiesHelper.deleteCookie(fjs.fdp.SyncManager.AUTH_COOKIE_NAME);
                context.ajax.send("POST", context.serverHost+"/accounts/salesforce", data, function(xhr, data, isOk) {
                   context.checkConnection(xhr);
                   if(isOk) {
                       var _data = JSON.parse(data);
                       var ticket = _data["Auth"];
                       var node = _data["node"];

                       _data.serverURL = context.serverHost;

                       if(ticket && node) {
                           context.saveAuthData(_data);
                           callback(true);
                           return;
                       }
                       else {
                           console.error("Error: ticket or node is empty");
                       }
                   }
                   else {
                       console.error("Auth request error", xhr, data);
                   }
                   callback(false);
                });
            }
            else if(!emailChanged && !loginChanged) {
                context.finishInitialization();
            }
            else {
                context.fireEvent("Authorization", false);
            }
        }
    })
};

fjs.fdp.SyncManager.prototype.saveAuthData = function(data) {
    CookiesHelper.setCookie(fjs.fdp.SyncManager.AUTH_COOKIE_NAME, this.ticket = data["Auth"]);
    CookiesHelper.setCookie(fjs.fdp.SyncManager.NODE_COOKIE_NAME, this.node = data["node"]);
    CookiesHelper.setCookie(fjs.fdp.SyncManager.CLIENT_ID_COOKIE_NAME, data["ClientID"]);
    CookiesHelper.setCookie(fjs.fdp.SyncManager.SERVER_URL_COOKIE_NAME, data["serverURL"]);
    this.ajax.setTicket(this.ticket);
    this.ajax.setNode(this.node);
};

/**
 * Returns versions for the requested feed.
 *
 * @param feedName - name of the requested feed.
 * @returns versions as a string or empty string.
 */
fjs.fdp.SyncManager.prototype.getVersions = function(feedName) {
    var versions = [];
    var sources = this.versions[feedName];
    if(sources) {
        for(var i in sources) {
            if(sources.hasOwnProperty(i)) {
                versions.push(i+"@"+sources[i]);
            }
        }
        return versions.join(" ");
    }
    else return "";
};

/**
 * Saves feed versions for requested feed.
 *
 * @param feedName - name of the requested feed
 * @param source - source of the requested feed
 * @param version - versions of the requested feed
 */
fjs.fdp.SyncManager.prototype.saveVersions = function(feedName, source, version) {
    var feedVersions = this.versions[feedName];
    if(!feedVersions) {
        feedVersions = this.versions[feedName]={};
    }
    feedVersions[source] = version;
};

/**
 * Requests versions from FDP. If request was successful starts feed synchronization or try register again otherwise.
 * @param feedsVersions -
 */
fjs.fdp.SyncManager.prototype.requestVersions = function(feedsVersions) {
    var context = this;
    var data = feedsVersions;
    data.t = fjs.fdp.SyncManager.CLIENT_TYPE;

    if(this.currentVersioncache!=null) {
        this.ajax.abort(this.currentVersioncache);
    }

    if(!this.isEmptyString(this.serverHost)) {
        this.ajax.send("POST", this.serverHost+"/v1/versions", data, function(xhr, data, isOk) {
            context.checkConnection(xhr);
            var feeds = {};
            var st = new fjs.utils.TimeSync();
            if(isOk) {
                var params = data.split(";");
                var feedsCount = 0;
                if(params) {
                    st.setTimestamp(params[0]);
                    for(var i =2; i<params.length-1; i++) {
                        if(params[i]) {
                            feeds[params[i]]  = "";
                            feedsCount++;
                        }
                     }
                }
                if(feedsCount) {
                    context.syncRequest(feeds);
                }
                else {
                    context.requestVersionsCache();
                }
            }
            else {
                if(xhr.status == 401 || xhr.status == 403) {
                    context.requestClientRegistry(function() {
                        context.requestVersions(feedsVersions);
                    });
                }
            }
        });
    }
    else {
        console.error("SyncManager requestVersions error: server host is empty.");
    }
};

/**
 * Requests versions cache from FDP. If request was successful starts feed synchronization or try register again.
 */
fjs.fdp.SyncManager.prototype.requestVersionsCache = function() {
    var data = {};
    data.path = location.origin;
    data.t = fjs.fdp.SyncManager.CLIENT_TYPE;
    var context = this;

    if(!this.isEmptyString(this.serverHost)) {
        this.currentVersioncache = this.ajax.send("POST", this.serverHost+"/v1/versionscache", data, function(xhr, data, isOk) {
            context.checkConnection(xhr);
            var feeds = {};
            if(isOk) {
                var params = data.split(";");
                var feedsCount = 0;
                for(var i =2; i<params.length; i++) {
                    if(params[i]) {
                        feeds[params[i]]  = "";
                        feedsCount++;
                    }
                }
                if(feedsCount) {
                    context.syncRequest(feeds);
                }
                else {
                    context.requestVersionsCache();
                }
            }
            else {
                if(xhr.status == 401 || xhr.status == 403) {
                    context.requestClientRegistry(function() {
                        context.requestVersionsCache();
                    });
                }
                else if(!xhr.aborted) {
                    context.requestVersionsCache();
                }
            }
        });
    }
    else {
        console.error("SyncManager requestVersionsCache error: server host is empty.");
    }
};

/**
 * Parses result of feed synchronization.
 *
 * @param data - result of feed synchronization from FDP
 */
fjs.fdp.SyncManager.prototype.onSync = function(data) {
    var _data = null;
    try {
        _data = JSON.parse(data);
    }
    catch(e) {
        console.error('Sync data error', e);
    }

    function isSource(sourceId) {
        return sourceId != 'full';
    }

    for(var feedName in _data) {
        if(_data.hasOwnProperty(feedName)) {
            var feedData = _data[feedName];
            var feedSyncFull = _data['full'];
            for(var sourceId in feedData) {
                if(isSource(sourceId)) {
                    var _source = feedData[sourceId];
                    var ver = _source["xef001ver"];
                    this.saveVersions(feedName, sourceId, ver);
                    var items = _source["items"];
                    var type =_source["xef001type"];
                    var tmpListeners = this.listeners[feedName];
                    if(tmpListeners) {
                        for(var i = 0; i < tmpListeners.length; i++) {
                            var _listener = tmpListeners[i];
                            if(_listener) {
                                _listener({eventType:"start", syncType:type});
                                for(var j=0; j<items.length; j++) {
                                    var etype = items[j]["xef001type"];
                                    _listener({eventType:etype, xpid: sourceId+"_"+items[j]["xef001id"], entry:items[j]});
                                }
                                _listener({eventType:"complete"});
                            }
                        }
                    }
                }
            }
        }
    }
};

/**
 * Requests synchronization from FDP.
 *
 * @param feeds - feeds info
 */
fjs.fdp.SyncManager.prototype.syncRequest = function(feeds) {
    var context = this;
    var data = feeds;
    data.t = fjs.fdp.SyncManager.CLIENT_TYPE;
    data.alt = 'j';
    if(!this.isEmptyString(this.serverHost)) {
        this.ajax.send("POST", this.serverHost+'/v1/sync', data, function(xhr, data, isOK) {
            context.checkConnection(xhr);
            if(isOK) {
                context.onSync(data);
                localStorage.setItem("sync", data);
                context.requestVersionsCache();
            }
        });
    }
    else {
        console.error("SyncManager syncRequest error: server host is empty.");
    }
};

/**
 * Sends action to FDP.
 *
 * @param feedName  - name of the feed.
 * @param actionName - name of the action.
 * @param data - action data.
 */
fjs.fdp.SyncManager.prototype.sendAction = function(feedName, actionName, data) {
    data.action = actionName;
    data.t = fjs.fdp.SyncManager.CLIENT_TYPE;
    var context = this;
    if(!this.isEmptyString(this.serverHost) && !this.isEmptyString(feedName) && !this.isEmptyString(actionName)) {
        this.ajax.send("POST", this.serverHost+"/v1/"+feedName, data, function(xhr) {
            context.checkConnection(xhr);
        });
    }
    else {
        console.error("SyncManager error: some of required parameters are empty: server host is '" + this.serverHost + "', feed name is '" + feedName + "', action is '" + actionName + "'.");
    }
};

/**
 * Starts feed synchronization.
 *
 * @param feeds - feeds list for synchronization.
 */
fjs.fdp.SyncManager.prototype.startSync = function(feeds) {
    var data = {};
    this.fireEvent("AuthFaild");
    if(feeds) {
        for(var i=0; i<feeds.length; i++) {
            this.syncFeeds.push(feeds[i]);
            data[feeds[i]] = "";
        }
    }
    else {
        new Error ("You must set feeds names array");
    }
    this.requestVersions(data);
};

/**
 * Requests client registry from FDP sending client type and access token.
 *
 * @param callback - JavaScript method called upon completion of the method.
 * @result This method is asynchronous so it returns its response in an object in a callback method.
 */
fjs.fdp.SyncManager.prototype.requestClientRegistry = function(callback) {
    var context = this;
    var data = {};
    data.t = fjs.fdp.SyncManager.CLIENT_TYPE;
    data.Authorization = this.ticket;
    if(!this.isEmptyString(this.serverHost)) {
        this.ajax.send("POST", this.serverHost + "/accounts/ClientRegistry", data, function(xhr, data, isOk) {
           context.checkConnection(xhr);
            if(isOk) {
                context.badLoginAttempts = 0;
                var _data = context.parseFdpData(data);
                if(_data.node) {
                    CookiesHelper.setCookie("node", context.node = _data.node);
                    context.ajax.setNode(context.node);
                    callback(isOk, data);
                }
                context.fireEvent("Authorization", true);
            }
            else {
                if(xhr.status == 403) {
                    context.badLoginAttempts++;
                    if (context.badLoginAttempts < fjs.fdp.SyncManager.MAX_LOGIN_TIMES){
                        context.doLogin(function(){
                            context.requestClientRegistry(callback);
                        });
                    }
                    else {
                        context.fireEvent("Authorization", false);
                    }
                }
            }
        });
    }
    else {
        console.error("SyncManager requestClientRegistry error: server host is empty.");
    }
};

/**
 * Adds listener to the feed.
 *
 * @param feedName - name of the feed.
 * @param listener - listener.
 */
fjs.fdp.SyncManager.prototype.addListener = function(feedName, listener) {
    var tmpListeners = this.listeners[feedName];
    if(!tmpListeners) {
        tmpListeners = this.listeners[feedName] = [];
    }
    if(-1 < tmpListeners.indexOf(listener)) {
        console.error("SyncManager error: duplicate listener for" + feedName);
    }
    else {
        tmpListeners.push(listener);
    }

    if(this.state!=fjs.fdp.SyncManager.READY ) {
        if(this.suspendFeeds.indexOf(feedName) < 0) {
            this.suspendFeeds.push(feedName);
        }
    }
    else if(this.syncFeeds.indexOf(feedName) < 0) {
        this.startSync([feedName]);
    }
};

fjs.fdp.SyncManager.prototype.addEventListener = function(eventType, callback) {
    if(this.eventListeners[eventType]) {
        this.eventListeners[eventType].push(callback);
    }
    else {
        var events = [];
        events.push(callback);
        this.eventListeners[eventType] = events;
    }
};

fjs.fdp.SyncManager.prototype.removeEventListener = function(eventType, callback) {
    var i =this.eventListeners[eventType].indexOf(callback);
    if(i>-1) {
        this.eventListeners[eventType].splice(i, 1);
    }
};

fjs.fdp.SyncManager.prototype.fireEvent = function(eventType, data) {
    var listeners = this.eventListeners[eventType];
    if(listeners) {
        for(var i=0; i<listeners.length; i++) {
            listeners[i](data);
        }
    }
};

/**
 * Removes listener from the feed.
 *
 * @param feedName - name of the feed.
 * @param listener - listener.
 */
fjs.fdp.SyncManager.prototype.removeListener = function(feedName, listener) {
    var tmpListeners = this.listeners[feedName];
    if(tmpListeners){
        var i = tmpListeners.indexOf(listener);
        if(i > -1) {
            tmpListeners.splice(i, 1);
        }
    }
};




