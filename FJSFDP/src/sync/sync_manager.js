///**
// * Created with JetBrains WebStorm.
// * User: ddyachenko
// * Date: 19.08.13
// * Time: 13:08
// * To change this template use File | Settings | File Templates.
// */
//(function(){
//    namespace("fjs.fdp");
//    /**
//     * SyncManager
//     * @param {DBProviderBase} dbProvider
//     * @param {}
//     * @constructor
//     */
//    var sm = fjs.fdp.SyncManager = function(dbProvider, ajaxProvider) {
//        //Singleton
//        if (!this.constructor.__instance)
//            this.constructor.__instance = this;
//        else return this.constructor.__instance;
//
//        this.state = sm.NOT_INITIALIZED;
//        this.clearFlag = false;
//        this.ajax = ajaxProvider;
//        /**
//         * @type {DBProviderBase}
//         */
//        this.db = dbProvider;
//        this.listeners = {};
//        this.versions = {};
//        this.ticket = null;
//        this.node = null;
//        this.serverHost = null;
//        this.syncFeeds = [];
//        this.currentVersioncache = null;
//        this.suspendFeeds=[];
//        this.versionsFeeds = [];
//        this.versionsTimeoutId = null;
//
//    };
//
//    fjs.fdp.SyncManager.NOT_INITIALIZED = -1;
//    fjs.fdp.SyncManager.INITIALIZATION = 0;
//    fjs.fdp.SyncManager.READY = 1;
//    fjs.fdp.SyncManager.VERSIONS_PATH = "/v1/versions";
//    fjs.fdp.SyncManager.VERSIONSCACHE_PATH = "/v1/versionscache";
//    fjs.fdp.SyncManager.CLIENT_REGISRY_PATH = "/accounts/ClientRegistry";
//    fjs.fdp.SyncManager.SYNC_PATH = "/v1/sync";
//
//    /**
//     *
//     * @param {string} ticket
//     * @param {string} node
//     * @param {string} serverUrl
//     * @param {*} ajaxProvider
//     */
//    fjs.fdp.SyncManager.prototype.init = function(ticket, node, serverUrl, authHandler) {
//        var context = this;
//        this.state = sm.INITIALIZATION;
//        this.ticket = ticket;
//        this.node = node;
//        this.serverHost = serverUrl;
//        this.authHandler = authHandler;
//
//        function finishInitialization () {
//            if(context.db) {
//                var dbName = CONFIG.DB_NAME;
//                var dbVersion = CONFIG.DB_VERSION;
//                context.db.open(dbName, dbVersion, function(){
//                    if(context.suspendFeeds.length > 0) {
//                        context.startSync(context.suspendFeeds);
//                        for(var i=0; i<context.suspendFeeds.length; i++) {
//                            context.getFeedData(context.suspendFeeds[i]);
//                        }
//                        context.suspendFeeds = [];
//                    }
//                    context.state = sm.READY;
//                    if(context.clearFlag) {
//                        context.getAuthTicket();
//                        context.clearFlag = false;
//                    }
//                }, function(db) {
//                    for(var i=0; i<CONFIG.DB_TABLES.length; i++) {
//                        var store = context.db.createTable(CONFIG.DB_TABLES[i].name, "xpid");
//                        if(CONFIG.DB_TABLES[i].keys && CONFIG.DB_TABLES[i].keys.length>0) {
//
//                        }
//                    }
//                    var versionsStore =  context.db.createTable("versions", "feedSource");
//                    versionsStore.createIndex("source", "source", { unique: false });
//                    versionsStore.createIndex("feedName", "feedName", { unique: false });
//                });
//            }
//            else {
//                if(context.suspendFeeds.length > 0) {
//                    context.startSync(context.suspendFeeds);
//                    context.suspendFeeds = [];
//                }
//                context.state = sm.READY;
//            }
//        }
//
//        if(!this.node) {
//            context.requestClientRegistry(function(isOK){
//                finishInitialization ();
//            });
//        }
//        else {
//            finishInitialization();
//        }
//    };
//
//    /**
//     *
//     * @param {string} data
//     * @returns {Object}
//     */
//    fjs.fdp.SyncManager.prototype.parseFdpData = function(data) {
//        var dataArr = data.split('\n');
//        var result = {};
//        for(var i=0; i<dataArr.length; i++) {
//            if(dataArr[i].indexOf("=")>-1) {
//                var itemArr = dataArr[i].split("=");
//                var key = itemArr[0].trim();
//                var val = itemArr[1].trim();
//                if(key && val) {
//                    result[key] = val;
//                }
//            }
//        }
//        return result;
//    };
//
//
//    /**
//     * Saves versions
//     * @param {string} feedName
//     * @param {string} source
//     * @param {string} version
//     */
//    fjs.fdp.SyncManager.prototype.saveVersions = function(feedName, source, version) {
//        if(this.db) {
//            this.db.insert("versions", {"feedSource": feedName+"_"+source, "feedName":feedName, "source":source, "version":version});
//        }
//    };
//    /**
//     *
//     * @param {Stirng} feedName
//     * @param {*} data
//     * @param {Function} callback
//     */
//    fjs.fdp.SyncManager.prototype.getVersions = function(feedName, data, callback) {
//        var versionsArr = [], context=this;
//        if(this.versions[feedName]) {
//            callback(data[feedName] = this.versions[feedName])
//        }
//        if(this.db) {
//            this.db.selectByIndex("versions", {key:"feedName", value:feedName}, function(item){
//                versionsArr.push(item.source+"@"+item.version);
//            }, function(){
//                context.versions[feedName] = data[feedName] = versionsArr.join(",");
//                callback(data[feedName]);
//            });
//        }
//    };
//
//
//    /**
//     *
//     * @param {String} url
//     * @param {*} data
//     * @param {Function} callback
//     */
//    fjs.fdp.SyncManager.prototype.sendRequest = function(url, data, callback) {
//        data["t"] = "web";
//        data["alt"] = 'j';
//        var headers = {Authorization: "auth="+this.ticket, node:this.node};
//        return this.ajax.send("POST", url, headers, data, callback);
//    };
//
//    /**
//     * Versions request
//     * @param {Object} feedsVersions
//     */
//    fjs.fdp.SyncManager.prototype.requestVersions = function(feedsVersions) {
//        var context = this;
//
//        if(this.currentVersioncache!=null) {
//            this.ajax.abort(this.currentVersioncache);
//        }
//        var url = this.serverHost+sm.VERSIONS_PATH;
//        this.sendRequest(url, feedsVersions, function(xhr, data, isOk) {
//            var feeds = {};
//            if(isOk) {
//                var params = data.split(";");
//                var feedsCount = 0;
//                if(params) {
//                    for(var i =2; i<params.length-1; i++) {
//                        if(params[i]) {
//                            feeds[params[i]]  = "";
//                            feedsCount++;
//                        }
//                    }
//                }
//                if(feedsCount) {
//                    context.syncRequest(feeds);
//                }
//                else {
//                    context.requestVersionscache();
//                }
//            }
//            else {
//                if(xhr.status == 401 || xhr.status == 403) {
//                    context.requestClientRegistry(function() {
//                        context.requestVersions(feedsVersions);
//                    });
//                }
//            }
//        });
//    };
//
//    /**
//     * Versionscache request
//     */
//    fjs.fdp.SyncManager.prototype.requestVersionscache = function() {
//        var data = {"path":location.href.substring(0,location.href.indexOf("js/fdp/")), "no_image":"/img/Generic-Avatar-Small.png" }, context = this;
//        var url = this.serverHost+sm.VERSIONSCACHE_PATH;
//        this.currentVersioncache = this.sendRequest(url, data, function(xhr, data, isOk) {
//            var feeds = {};
//            if(isOk) {
//                var params = data.split(";");
//                var feedsCount = 0;
//                for(var i =2; i<params.length; i++) {
//                    if(params[i]) {
//                        feeds[params[i]]  = "";
//                        feedsCount++;
//                    }
//                }
//                if(feedsCount) {
//                    context.syncRequest(feeds);
//                }
//                else {
//                    context.requestVersionscache();
//                }
//            }
//            else {
//                if(xhr.status == 401 || xhr.status == 403) {
//                    context.requestClientRegistry(function(isOK) {
//                        if(isOK) {
//                            context.requestVersionscache();
//                        }
//                    });
//                }
//                else if(!xhr["aborted"]) {
//                    context.requestVersionscache();
//                }
//            }
//        });
//    };
//
//    /**
//     *
//     * @param {*} data
//     */
//    fjs.fdp.SyncManager.prototype.onSync = function (data) {
//        var _data = null, context= this ;
//        try {
//            _data = JSON.parse(data);
//        }
//        catch (e) {
//            try {
//                _data = (new Function("return " + data+ ";" ))();
//            }
//            catch(e) {
//                console.error('Sync data error', e);
//            }
//        }
//
//        function isSource(sourceId) {
//            return sourceId != 'full';
//        }
//        for (var feedName in _data) {
//            if (_data.hasOwnProperty(feedName)) {
//                var feedData = _data[feedName];
//                var feedSyncFull = _data['full'];
//                for (var sourceId in feedData) {
//                    if (feedData.hasOwnProperty(sourceId) && isSource(sourceId)) {
//                        var _source = feedData[sourceId];
//                        var ver = _source["xef001ver"];
//                        var items = _source["items"];
//                        var type = _source["xef001type"];
//                        var tmpListeners = this.listeners[feedName];
//                        if (tmpListeners) {
//                            for (var i = 0; i < tmpListeners.length; i++) {
//                                var _listener = tmpListeners[i];
//                                if (_listener) {
//                                    _listener({eventType: "start", syncType: type, feed:feedName, sourceId:sourceId});
//                                    for (var j = 0; j < items.length; j++) {
//                                        var etype = items[j]["xef001type"] || 'push';
//                                        var xpid = sourceId + "_" + items[j]["xef001id"];
//                                        delete items[j]["xef001type"];
//                                        items[j]["xpid"] = xpid;
//                                        var entry = {eventType: etype, feed:feedName, xpid: xpid, entry: items[j]};
//                                        switch(etype) {
//                                            case "push":
//                                                context.db.insert(feedName, entry.entry, null);
//                                                break;
//                                            case "delete":
//                                                context.db.delete(feedName, entry.xpid, null);
//                                                break;
//                                        }
//                                        _listener(entry);
//                                    }
//                                    _listener({eventType: "complete", feed:feedName});
//                                }
//                            }
//                        }
//                        this.saveVersions(feedName, sourceId, ver);
//                    }
//                }
//            }
//        }
//    };
//
//    /**
//     * Sync request
//     * @param {Object} feeds
//     */
//    fjs.fdp.SyncManager.prototype.syncRequest = function(feeds) {
//        var context = this, url = this.serverHost+sm.SYNC_PATH;
//        this.sendRequest(url, feeds, function(xhr, data, isOK) {
//            if(isOK) {
//                context.onSync(data);
//                context.requestVersionscache();
//            }
//        });
//    };
//
//    /**
//     *
//     * @param {string} feedName
//     * @param {string} actionName
//     * @param {*} data
//     * @param {Function} callback
//     */
//    fjs.fdp.SyncManager.prototype.sendAction = function(feedName, actionName, data, callback) {
//        var context = this;
//        data["action"] = actionName;
//        this.sendRequest(this.serverHost+"/v1/"+feedName, data, function(responce, isOK){
//            if(callback) {
//                var _responce = context.parseFdpData(responce);
//                callback(isOK && _responce.result == "OK");
//            }
//        });
//    };
//
//    /**
//     * @param {Array} feeds
//     */
//    fjs.fdp.SyncManager.prototype.startSync = function(feeds) {
//        var data = {};
//        var count= 0, context=this;
//        if(feeds) {
//            for(var i=0; i<feeds.length; i++) {
//                count++;
//                this.syncFeeds.push(feeds[i]);
//                this.getVersions(feeds[i], data, function(vers){
//                    --count;
//                    if(count==0) {
//                        context.requestVersions(data);
//                    }
//                });
//            }
//        }
//        else {
//            new Error ("You must set feeds names array");
//        }
//    };
//
//    /**
//     * ClientRegistry request
//     * @param callback
//     */
//    fjs.fdp.SyncManager.prototype.requestClientRegistry = function(callback) {
//        var context = this, url = this.serverHost+sm.CLIENT_REGISRY_PATH;
//        this.sendRequest(url, {"path":location.href.substring(0,location.href.indexOf("js/fdp/")), "no_image":"/img/Generic-Avatar-Small.png" }, function(xhr, data, isOk) {
//            if(isOk) {
//                var _data = context.parseFdpData(data);
//                if(_data["node"]) {
//                    context.node = _data["node"];
//                    context.authHandler.node(context.node);
//                    callback(isOk, data);
//                }
//            }
//            else {
//                if(xhr.status == 403) {
//                    callback(false);
//                    context.getAuthTicket();
//                }
//                else {
//                    context.requestClientRegistry(callback);
//                }
//            }
//        });
//    };
//
//    /**
//     *
//     * @param {Function} callback
//     */
//    fjs.fdp.SyncManager.prototype.getAuthTicket = function(callback) {
//        if(this.state == sm.READY) {
//            this.db.clear();
//            this.authHandler.requestAuth();
//        }
//        else {
//            this.clearFlag = true;
//        }
//    };
//
//    /**
//     *
//     * @param {string} feedName
//     * @param {Function} listener
//     */
//    fjs.fdp.SyncManager.prototype.addListener = function(feedName, listener) {
//        if(listener) {
//            var tmpListeners = this.listeners[feedName], context = this;
//            if(!tmpListeners) {
//                tmpListeners = this.listeners[feedName] = [];
//            }
//            if(-1 < tmpListeners.indexOf(listener)) {
//                console.error("SyncManager error: duplicate listener for" + feedName);
//            }
//            else {
//                tmpListeners.push(listener);
//            }
//        }
//
//        if(this.state!=sm.READY ) {
//            if(this.suspendFeeds.indexOf(feedName)<0) {
//                this.suspendFeeds.push(feedName);
//            }
//        }
//        else if(this.syncFeeds.indexOf(feedName)<0) {
//            if(this.versionsFeeds.indexOf(feedName) < 0) {
//                this.versionsFeeds.push(feedName);
//            }
//            if(this.versionsTimeoutId!=null) {
//                clearTimeout(this.versionsTimeoutId);
//                this.versionsTimeoutId = null;
//            }
//            this.versionsTimeoutId = setTimeout(function(){
//                context.startSync(context.versionsFeeds);
//                context.versionsFeeds = [];
//                context.versionsTimeoutId = null;
//            },100);
//            this.getFeedData(feedName, listener);
//        }
//        else if(this.syncFeeds.indexOf(feedName)>=0 && this.state==sm.READY) {
//            this.getFeedData(feedName, listener);
//        }
//    };
//
//    fjs.fdp.SyncManager.prototype.getFeedData = function(feedName, listener) {
//        var context = this;
//        if(listener) {
//            listener({eventType: "start", syncType: "F", feed:feedName});
//        }
//        else {
//            var tmpListeners = context.listeners[feedName];
//            if (tmpListeners) {
//                for (var i = 0; i < tmpListeners.length; i++) {
//                    var _listener = tmpListeners[i];
//                    _listener({eventType: "start", syncType: "F", feed:feedName});
//                }
//            }
//        }
//        this.db.selectAll(feedName, function(item){
//                if(listener) {
//                    listener(({eventType: "push", feed:feedName, xpid: item.xpid, entry: item}));
//                }
//                else {
//                    var tmpListeners = context.listeners[feedName];
//                    if (tmpListeners) {
//                        for (var i = 0; i < tmpListeners.length; i++) {
//                            var _listener = tmpListeners[i];
//                            var entry = {eventType: "push", feed:feedName, xpid: item.xpid, entry: item};
//                            _listener(entry);
//                        }
//                    }
//                }
//            }
//            , function(){
//                if(listener) {
//                    listener({eventType: "complete", feed:feedName});
//                }
//                else {
//                    var tmpListeners = context.listeners[feedName];
//                    if (tmpListeners) {
//                        for (var i = 0; i < tmpListeners.length; i++) {
//                            var _listener = tmpListeners[i];
//                            _listener({eventType: "complete", feed:feedName});
//                        }
//                    }
//                }
//            });
//    };
//    /**
//     *
//     * @param {string} feedName
//     * @param {Function} listener
//     */
//    fjs.fdp.SyncManager.prototype.removeListener = function(feedName, listener) {
//        var tmpListeners = this.listeners[feedName];
//        if(tmpListeners)
//        {
//            var i = tmpListeners.indexOf(listener);
//            if(i > -1) {
//                tmpListeners.splice(i, 1);
//            }
//        }
//    };
//
//    fjs.fdp.SyncManager.prototype.loadNext = function(feedName, filter, count) {
//        var context = this, url = this.serverHost+"v1/history/"+feedName;
//        var _data = {"s.limit":count, "sh.filter": filter}
//        this.sendRequest(url, _data, function(xhr, data, isOK) {
//            if(isOK) {
//
//            }
//        });
//    };
//    fjs.fdp.SyncManager.prototype.logout = function() {
//
//        this.ticket = null;
//        this.node = null;
//        this.serverHost = null;
//
//        this.getAuthTicket();
//        this.state = sm.NOT_INITIALIZED;
//    }
//})();
//
//
//
//
//
