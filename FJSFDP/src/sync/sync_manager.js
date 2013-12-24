/**
* Created with JetBrains WebStorm.
* User: ddyachenko
* Date: 19.08.13
* Time: 13:08
* To change this template use File | Settings | File Templates.
*/
(function(){
    namespace("fjs.fdp");
    /**
     * SyncManager
     * @param {IDBProvider=} dbProvider
     * @param {IAjaxProvider=} ajaxProvider
     * @constructor
     */
    fjs.fdp.SyncManager = function(dbProvider, ajaxProvider) {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;

        this.state = sm.states.NOT_INITIALIZED;

        this.config = fjs.fdp.CONFIG;

        /**
         *
         * @type {IAjaxProvider}
         */
        this.ajax = ajaxProvider;
        /**
         * @type {IDBProvider}
         */
        this.db = dbProvider;
        /**
         * @dict
         * @private
         */
        this.listeners = {};
        /**
         * @dict
         * @private
         */
        this.versions = {};
        /**
         * @type {string}
         */
        this.ticket = null;
        /**
         * @type {string}
         */
        this.node = null;
        /**
         * @type {string}
         */
        this.serverHost = null;
        /**
         * @type {Array}
         */
        this.syncFeeds = [];
        /**
         * @type {*}
         */
        this.currentVersioncache = null;
        /**
         * @type {Array}
         * @private
         */
        this.suspendFeeds=[];
        /**
         * @type {Array}
         * @private
         */
        this.versionsFeeds = [];
        /**
         * @type {?number}
         */
        this.versionsTimeoutId = null;
    };

    var sm = fjs.fdp.SyncManager;

    /**
     * Sync manager states
     * @enum {number}
     */
    fjs.fdp.SyncManager.states = {
        'NOT_INITIALIZED':-1
        , 'INITIALIZATION':0
        , 'READY':1
    };

    /**
     * Sync manager event types
     * @enum {string}
     */
    fjs.fdp.SyncManager.eventTypes = {
        'SYNC_START': 'syncStart'
        , 'SYNC_COMPLETE': 'syncComplete'
        , 'FEED_START': 'feedStart'
        , 'FEED_COMPLETE': 'feedComplete'
        , 'SOURCE_START': 'sourceStart'
        , 'SOURCE_COMPLETE': 'sourceComplete'
        , 'ENTRY_CHANGE': 'push'
        , 'ENTRY_DELETION': 'delete'
    };

    /**
     * @const {string}
     */
    fjs.fdp.SyncManager.VERSIONS_PATH = "/v1/versions";
    /**
     * @const {string}
     */
    fjs.fdp.SyncManager.VERSIONSCACHE_PATH = "/v1/versionscache";
    /**
     * @const {string}
     */
    fjs.fdp.SyncManager.CLIENT_REGISRY_PATH = "/accounts/ClientRegistry";
    /**
     * @const {string}
     */
    fjs.fdp.SyncManager.SYNC_PATH = "/v1/sync";

    /**
     * @param {string} ticket
     * @param {string} node
     * @param {string} serverUrl
     * @param {{requestAuth:Function, setNode:function(string)}} authHandler
     * @param {Function} callback
     */
    fjs.fdp.SyncManager.prototype.init = function(ticket, node, serverUrl, authHandler, callback) {
        var context = this;
        /**
         * @type {states}
         */
        this.state = sm.states.INITIALIZATION;
        this.ticket = ticket;
        this.node = node;
        this.serverHost = serverUrl;
        /**
         * @type {{requestAuth: Function, setNode: (function(string))}}
         */
        this.authHandler = authHandler;

        if(!this.node) {
            this.requestClientRegistry(function(isOK){
                if(isOK) {
                    context.initDataBase(callback);
                }
            });
        }
        else {
            this.initDataBase(callback);
        }
    };

    /**
     * @param {Function} callback
     * @private
     */
    fjs.fdp.SyncManager.prototype.initDataBase = function(callback) {
        if(this.db) {
            /**
             * @type {fjs.fdp.SyncManager}
             */
            var context = this;

            /**
             * Declare tables from config
             */
            for(var i=0; i<this.config.DB.tables.length; i++) {
                /**
                 * @type {{name:string, key:string, indexes:Array}}
                 */
                var table = this.config.DB.tables[i];
                this.db.declareTable(table.name, table.key, table.indexes);
            }
            /**
             * Open DB
             */
            this.db.open(this.config.DB.name, this.config.DB.version, function(){
                context.finishInitialization(callback);
            });
        }
        else {
            this.finishInitialization(callback);
        }
    };

    /**
     * @param {Function} callback
     * @private
     */
    fjs.fdp.SyncManager.prototype.finishInitialization = function(callback) {
        /**
         * @type {fjs.fdp.SyncManager}
         */
        var context = this;
        /**
         * Init for for feeds attached before init complete
         */
        if(this.suspendFeeds.length > 0) {
            /**
             * Load data from localDB
             */
            var count = this.suspendFeeds.length;
            for(var i=0; i<this.suspendFeeds.length; i++) {
                this.fireEvent(null, {eventType:sm.eventTypes.SYNC_START});
                this.getFeedData(this.suspendFeeds[i], function(data){
                    if(data.eventType == sm.eventTypes.FEED_COMPLETE) {
                        --count;
                        if(count === 0) {
                            context.fireEvent(null, {eventType:sm.eventTypes.SYNC_COMPLETE});
                        }
                    }
                    context.fireEvent(data.feed, data);
                });
            }
            /**
             * Start synchronization
             */
            this.startSync(this.suspendFeeds);

            this.suspendFeeds = [];
        }

        this.state = sm.states.READY;
        callback();
    };

    /**
     * @param {string} data
     * @returns {Object}
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
     * Saves versions
     * @param {string} feedName
     * @param {string} source
     * @param {string} version
     */
    fjs.fdp.SyncManager.prototype.saveVersions = function(feedName, source, version) {
        if(this.db) {
            this.db.insertOne("versions", {"feedSource": feedName+"_"+source, "feedName":feedName, "source":source, "version":version});
        }
    };
    /**
     *
     * @param {string} feedName
     * @param {*} data
     * @param {Function} callback
     */
    fjs.fdp.SyncManager.prototype.getVersions = function(feedName, data, callback) {
        var versionsArr = [];
        /**
         * @type {fjs.fdp.SyncManager}
         */
        var context = this;
        if(this.versions[feedName]) {
            callback(data[feedName] = this.versions[feedName]);
        }
        if(this.db) {
            this.db.selectByIndex("versions", {key:"feedName", value:feedName}, function(item) {
                versionsArr.push(item.source+"@"+item.version);
            }, function() {
                context.versions[feedName] = data[feedName] = versionsArr.join(",");
                callback(data[feedName]);
            });
        }
    };


    /**
     *
     * @param {String} url
     * @param {*} data
     * @param {Function} callback
     * @return {*}
     */
    fjs.fdp.SyncManager.prototype.sendRequest = function(url, data, callback) {
        data["t"] = "web";
        data["alt"] = 'j';
        var headers = {Authorization: "auth="+this.ticket, node:this.node};
        return this.ajax.send("POST", url, headers, data, callback);
    };

    /**
     * @param {string} data
     */
    fjs.fdp.SyncManager.prototype.parseVersionsResponse = function(data) {
        var params = data.split(";"), feeds = {}, feedsCount = 0;
        if(params) {
            for(var i=2; i<params.length-1; i++) {
                if(params[i]) {
                    feeds[params[i]]  = "";
                    feedsCount++;
                }
            }
        }
        return feedsCount ? feeds : null;
    };

    /**
     * Versions request
     * @param {Object} feedsVersions
     */
    fjs.fdp.SyncManager.prototype.requestVersions = function(feedsVersions) {
        var context = this;

        if(this.currentVersioncache!=null) {
            this.ajax.abort(this.currentVersioncache);
        }

        var url = this.serverHost+sm.VERSIONS_PATH;

        this.sendRequest(url, feedsVersions, function(xhr, data, isOk) {
            if(isOk) {
                var feeds = context.parseVersionsResponse(data);
                if(feeds) {
                    context.syncRequest(feeds);
                }
                else {
                    context.requestVersionscache();
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
    };

    /**
     * Versionscache request
     */
    fjs.fdp.SyncManager.prototype.requestVersionscache = function() {
        var data = {"path":this.getOrigin(), "no_image":"/img/Generic-Avatar-Small.png" }, context = this;
        var url = this.serverHost+sm.VERSIONSCACHE_PATH;
        this.currentVersioncache = this.sendRequest(url, data, function(xhr, data, isOk) {
            if(isOk) {
                var feeds = context.parseVersionsResponse(data);
                if(feeds) {
                    context.syncRequest(feeds);
                }
                else {
                    context.requestVersionscache();
                }
            }
            else {
                if(xhr.status == 401 || xhr.status == 403) {
                    context.requestClientRegistry(function(isOK) {
                        if(isOK) {
                            context.requestVersionscache();
                        }
                    });
                }
                else if(!xhr["aborted"]) {
                    context.requestVersionscache();
                }
            }
        });
    };

    /**
     * @param {*} data
     */
    fjs.fdp.SyncManager.prototype.onSync = function (data) {
        var _data = null;
        /**
         *
         * @type {fjs.fdp.SyncManager}
         */
        var context= this ;
        try {
            _data = JSON.parse(data);
        }
        catch (e) {
            try {
                _data = (new Function("return " + data+ ";" ))();
            }
            catch(e) {
                console.error('Sync data error', e);
            }
        }

        function isSource(sourceId) {
            return sourceId != 'full';
        }
        this.fireEvent(null, {eventType: sm.eventTypes.SYNC_START});
        for (var feedName in _data) {
            if (_data.hasOwnProperty(feedName)) {
                var feedData = _data[feedName];
                this.fireEvent(feedName, {eventType: sm.eventTypes.FEED_START, feed:feedName});
                for (var sourceId in feedData) {
                    if (feedData.hasOwnProperty(sourceId) && isSource(sourceId)) {
                        var _source = feedData[sourceId];
                        var ver = _source["xef001ver"];
                        var items = _source["items"];
                        var type = _source["xef001type"];
                        this.fireEvent(feedName, {eventType: sm.eventTypes.SOURCE_START, syncType: type, feed:feedName, sourceId:sourceId});
                        for (var j = 0; j < items.length; j++) {
                            var etype = items[j]["xef001type"] || 'push';
                            var xpid = sourceId + "_" + items[j]["xef001id"];
                            delete items[j]["xef001type"];
                            items[j]["xpid"] = xpid;
                            var entry = {eventType: etype, feed:feedName, xpid: xpid, entry: items[j]};
                            switch(etype) {
                                case "push":
                                    context.db.insertOne(feedName, entry.entry, null);
                                    break;
                                case "delete":
                                    context.db.deleteByKey(feedName, entry.xpid, null);
                                    break;
                            }
                            this.fireEvent(feedName, entry);
                        }
                        this.fireEvent(feedName, {eventType: sm.eventTypes.SOURCE_COMPLETE, feed:feedName});
                        this.saveVersions(feedName, sourceId, ver);
                    }
                }
                this.fireEvent(feedName, {eventType: sm.eventTypes.FEED_COMPLETE, feed:feedName});
            }
        }
        this.fireEvent(null, {eventType: sm.eventTypes.SYNC_COMPLETE});
    };

    /**
     * Sync request
     * @param {Object} feeds
     */
    fjs.fdp.SyncManager.prototype.syncRequest = function(feeds) {
        var context = this, url = this.serverHost+sm.SYNC_PATH;
        this.sendRequest(url, feeds, function(xhr, data, isOK) {
            if(isOK) {
                context.onSync(data);
                context.requestVersionscache();
            }
        });
    };

    /**
     *
     * @param {string} feedName
     * @param {string} actionName
     * @param {*} data
     * @param {Function} callback
     */
    fjs.fdp.SyncManager.prototype.sendAction = function(feedName, actionName, data, callback) {
        var context = this;
        data["action"] = actionName;
        this.sendRequest(this.serverHost+"/v1/"+feedName, data, function(responce, isOK){
            if(callback) {
                var _responce = context.parseFdpData(responce);
                callback(isOK && _responce.result == "OK");
            }
        });
    };

    /**
     * @param {Array} feeds
     */
    fjs.fdp.SyncManager.prototype.startSync = function(feeds) {
        var data = {};
        var  context=this;
        if(feeds) {
            var _count=0;
            for(var i=0; i<feeds.length; i++) {
                _count++;
                this.syncFeeds.push(feeds[i]);
                this.getVersions(feeds[i], data, function(){
                    --_count;
                    if(_count===0) {
                        context.requestVersions(data);
                    }
                });
            }
        }
        else {
            new Error ("You must set feeds names array");
        }
    };

    /**
     * @return {string}
     */
    fjs.fdp.SyncManager.prototype.getOrigin = function() {
        return location.protocol+"//"+location.host + (location.port ? ":" + location.port : "")+"/";
    };
    /**
     * ClientRegistry request
     * @param callback
     */
    fjs.fdp.SyncManager.prototype.requestClientRegistry = function(callback) {
        /**
         * @type {fjs.fdp.SyncManager}
         */
        var context = this;
        var url = this.serverHost+sm.CLIENT_REGISRY_PATH;

        this.sendRequest(url, {"path":this.getOrigin(), "no_image":"/img/Generic-Avatar-Small.png" }, function(xhr, data, isOk) {
            if(isOk) {
                var _data = context.parseFdpData(data);
                if(_data["node"]) {
                    context.node = _data["node"];
                    context.authHandler.setNode(context.node);
                    callback(isOk, data);
                }
            }
            else {
                if(xhr.status == 403) {
                    callback(false);
                    context.getAuthTicket();
                }
                else {
                    context.requestClientRegistry(callback);
                }
            }
        });
    };


    fjs.fdp.SyncManager.prototype.getAuthTicket = function() {
        var context = this;
        if(this.state == sm.states.READY && this.db) {
            this.db.clear(function(){
                context.authHandler.requestAuth();
            });
        }
        else {
            this.authHandler.requestAuth();
        }
    };

    /**
     *
     * @param {string} feedName
     * @param {Function} listener
     */
    fjs.fdp.SyncManager.prototype.addListener = function(feedName, listener) {
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

        if(this.state != sm.states.READY ) {
            if(this.suspendFeeds.indexOf(feedName)<0) {
                this.suspendFeeds.push(feedName);
            }
        }
        else if(this.syncFeeds.indexOf(feedName)<0) {
            if(this.versionsFeeds.indexOf(feedName) < 0) {
                this.versionsFeeds.push(feedName);
            }
            if(this.versionsTimeoutId != null) {
                clearTimeout(this.versionsTimeoutId);
                this.versionsTimeoutId = null;
            }
            this.versionsTimeoutId = setTimeout(function(){
                context.startSync(context.versionsFeeds);
                context.versionsFeeds = [];
                context.versionsTimeoutId = null;
            },100);
            this.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_START, feed:feedName}, listener);
            this.getFeedData(feedName, function(data){
                if(data.eventType == sm.eventTypes.FEED_COMPLETE) {
                    this.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_COMPLETE, feed:feedName}, listener);
                }
                listener(data);
            });
        }
        else if(this.syncFeeds.indexOf(feedName) >= 0 && this.states==sm.READY) {
            this.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_START, feed:feedName}, listener);
            this.getFeedData(feedName, function(data){
                if(data.eventType == sm.eventTypes.FEED_COMPLETE) {
                    this.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_COMPLETE, feed:feedName}, listener);
                }
                listener(data);
            });
        }
    };

    /**
     * @param {string} feedName
     * @param {Function=} listener
     */
    fjs.fdp.SyncManager.prototype.getFeedData = function(feedName, listener) {
        var context = this, data = {eventType:sm.eventTypes.FEED_START , syncType: "F", feed:feedName};
        this.fireEvent(feedName, data, listener);
        if(this.db) {
            this.db.selectAll(feedName, function(item){
                var data = {eventType: sm.eventTypes.ENTRY_CHANGE, feed:feedName, xpid: item.xpid, entry: item};
                context.fireEvent(feedName, data, listener);
            }
            , function() {
                var data = {eventType: sm.eventTypes.FEED_COMPLETE, feed:feedName};
                context.fireEvent(feedName, data, listener);
            });
        }
        else {
            var entry = {eventType: sm.eventTypes.FEED_COMPLETE, feed:feedName};
            this.fireEvent(feedName, entry, listener);
        }
    };
    /**
     *
     * @param {string} feedName
     * @param {Function} listener
     */
    fjs.fdp.SyncManager.prototype.removeListener = function(feedName, listener) {
        var _listeners = this.listeners[feedName];
        if(_listeners)
        {
            var i = _listeners.indexOf(listener);
            if(i > -1) {
                _listeners.splice(i, 1);
            }
        }
    };

    /**
     * @param {string} feedName
     * @param {*} data
     * @param {Function} listener
     */
    fjs.fdp.SyncManager.prototype.fireEvent = function(feedName, data, listener) {
        var _listeners, i , _listener;
        if(listener) {
            listener(data);
        }
        else if(feedName) {
            _listeners = this.listeners[feedName];
            if (_listeners) {
                for (i = 0; i < _listeners.length; i++) {
                    _listener = _listeners[i];
                    _listener(data);
                }
            }
        }
        else {
            for(var _feedName in this.listeners) {
                if(this.listeners.hasOwnProperty(_feedName)) {
                    _listeners = this.listeners[_feedName];
                    if (_listeners) {
                        for (i = 0; i < _listeners.length; i++) {
                            _listener = _listeners[i];
                            _listener(data);
                        }
                    }
                }
            }
        }
    };

    fjs.fdp.SyncManager.prototype.loadNext = function(feedName, filter, count) {
        var url = this.serverHost+"v1/history/"+feedName;
        var _data = {"s.limit":count, "sh.filter": filter};
        this.sendRequest(url, _data, function(xhr, data, isOK) {
            if(isOK) {

            }
        });
    };

    fjs.fdp.SyncManager.prototype.logout = function() {
        this.ticket = null;
        this.node = null;
        this.serverHost = null;
        this.getAuthTicket();
        this.state = sm.states.NOT_INITIALIZED;
    }
})();





