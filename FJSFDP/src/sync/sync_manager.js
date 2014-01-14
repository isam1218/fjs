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
     * @param {*} config
     * @constructor
     */
    fjs.fdp.SyncManager = function(dbProvider, ajaxProvider, config) {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;

        this.state = sm.states.NOT_INITIALIZED;

        this.config = config;

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
         * @type {Object}
         * @private
         */
        this.listeners = {};
        /**
         * @dict
         * @private
         */
        this.versions = {};
        /**
         * @dict
         * @private
         */
        this.historyversions = {};
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
        this.serverHost = this.config.SERVER.serverURL;
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
        /**
         * @type {number}
         * @private
         */
        this._clientRegistryFailedCount = 0;
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
     * FDP sync types
     * @enum {string}
     */
    fjs.fdp.SyncManager.syncTypes = {
        'FULL':'F'
        , 'KEEP':'I'
        , 'LAZY':'L'
        , 'HISTORY':'H'
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
     * @param {{requestAuth:Function, setNode:function(string)}} authHandler
     * @param {Function} callback
     */
    fjs.fdp.SyncManager.prototype.init = function(ticket, node, authHandler, callback) {
        var context = this;
        /**
         * @type {states}
         */
        this.state = sm.states.INITIALIZATION;
        this.ticket = ticket;
        this.node = node;
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
            this.db.selectByIndex("versions", {"feedName":feedName}, function(item) {
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
        //TODO: parse db and server versions;
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
     * @param str
     * @returns {*}
     * @private
     */
    fjs.fdp.SyncManager.prototype.parseJSON = function(str) {
        var _data = null;
        try {
            _data = JSON.parse(str);
        }
        catch (e) {
            try {
                _data = (new Function("return " + str+ ";" ))();
            }
            catch(e) {
                console.error('Sync data error', e);
            }
        }
        return _data;
    };

    fjs.fdp.SyncManager.prototype.parseSyncSourceData = function(items, feedName, sourceId) {
        for (var j = 0; j < items.length; j++) {
            var etype = items[j]["xef001type"] || 'push';
            var xpid = sourceId + "_" + items[j]["xef001id"];
            delete items[j]["xef001type"];
            items[j]["xpid"] = xpid;
            var entry = {eventType: etype, feed:feedName, xpid: xpid, entry: items[j]};
            switch(etype) {
                case "push":
                    this.db.insertOne(feedName, entry.entry, null);
                    break;
                case "delete":
                    this.db.deleteByKey(feedName, entry.xpid, null);
                    break;
            }
            this.fireEvent(feedName, entry);
        }
    };


    /**
     * @param {*} data
     */
    fjs.fdp.SyncManager.prototype.onSync = function (data) {
        /**
         *
         * @type {fjs.fdp.SyncManager}
         */
        var context= this ;
        var _data = this.parseJSON(data);

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
                        if(type == sm.syncTypes.FULL) {
                            context.db.deleteByIndex(feedName, {'source': sourceId}, function(items) {
                                for(var i=0; i<items.length; i++) {
                                    var entry = {eventType: sm.eventTypes.ENTRY_DELETION, feed:feedName, xpid: items.xpid, entry: null};
                                    context.fireEvent(feedName, entry);
                                }
                            });
                        }
                        this.parseSyncSourceData(items, feedName, sourceId);
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
            var _count = 0;
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
                this._clientRegistryFailedCount = 0;
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
                    if(this._clientRegistryFailedCount<10) {
                        this._clientRegistryFailedCount++;
                        context.requestClientRegistry(callback);
                    }
                    else {
                        callback(false);
                        context.getAuthTicket();
                    }
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
                    context.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_COMPLETE, feed:feedName}, listener);
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

    /**
     *
     * @param {string} feedName
     * @param {*} _filter
     * @param {number} count
     * @param callback
     */
    fjs.fdp.SyncManager.prototype.loadNext = function(feedName, _filter, count, callback) {

        var filter = JSON.stringify(_filter);
        var feedHVersions = this.historyversions[feedName];
        if(!feedHVersions){
            feedHVersions={};
            this.historyversions[feedName] = feedHVersions;
        }
        if(feedHVersions[filter]){
            this.processHistoryVersions(feedName, filter, count, feedHVersions[filter], callback);
            return;
        }

        var context = this;
        var hVersions = [];
        this.fillHistoryVersions(feedName, filter, count, hVersions, function(){
            context.processHistoryVersions(feedName, filter, count, hVersions, callback);
        });
    };

    fjs.fdp.SyncManager.prototype.fillHistoryVersions = function (feedName, filter, count, _historyVersions, callback) {
        if (this.db) {
            var context = this;
            this.db.selectByIndex("historyversions", {"feedName": feedName, "filter": filter}, function (item) {
                _historyVersions.push(item["source"] + ":" + item["version"]);
            }, function () {
                if(_historyVersions.length==0){
                    context.fillEmptyHistoryVersionsFromFeed(feedName,_historyVersions, callback);
                } else {
                    callback();
                }
            });
        }
    };

    fjs.fdp.SyncManager.prototype.fillEmptyHistoryVersionsFromFeed = function(feedName, _historyVersions, callback) {
        if(this.db) {
            //fill 0 versions for known sources
            this.db.selectByIndex("versions", {"feedName":feedName}, function(item) {
                _historyVersions.push(item["source"]+":0");
            }, callback);
        }
    };

    fjs.fdp.SyncManager.prototype.processHistoryVersions = function(feedName, filter, count, _historyVersions, callback) {
        if(_historyVersions.length==0)
        {
            if(callback){
                callback(false);
            }
            return;
        }
        this.historyversions[feedName][filter]=_historyVersions;

        var url = this.serverHost+"/v1/history/"+feedName;
        var _data = {"s.limit":count, "sh.filter": filter, "sh.versions": _historyVersions.join("@")};

        var context = this;
        this.sendRequest(url, _data, function(xhr, data, isOK) {
            if(isOK) {
                if(context.processHistory(feedName,  filter, data,_historyVersions)){
                    //save versions
                    context.notifyTabsHistory(feedName, filter, data, _historyVersions);
                }else{
                    setTimeout(function()
                    {
                        context.loadNext(feedName, filter, count);
                    }, 500);
                }
            }else{
                console.debug("loadNext: onAjaxError: " + feedName + " " + filter + " " + count);
            }
        });
        if(callback){
            callback(true);
        }
    };

    /**
     * @param {string} feedName
     * @param {*} data
     * @param {*} filter
     * @param {*} historyVersions
     * @return boolean
     * @private
     */
    fjs.fdp.SyncManager.prototype.processHistory = function(feedName, filter, data, historyVersions) {
        var hasData = false;
        var _data ;
        try {
            _data = JSON.parse(data);
        }
        catch (e) {
//            try {
//                _data = (new Function("return " + data+ ";" ))();
//            }
//            catch(e) {
//                console.error('Sync data error', e);
//            }
            console.error('Sync data error', e);
            return false;
        }
        this.fireEvent(feedName, {eventType: sm.eventTypes.SYNC_START, syncType: "Lazy", feed:feedName});
        for(var _sourceId in _data)
        {
            if(!_data.hasOwnProperty(_sourceId)){
                continue;
            }
            var source = _data[_sourceId];

            var items = source["items"];
            var /**@type {string}*/ hver = source["h_ver"] || "-1";
            if("-2" == hver)
            {
                //server error occurred
                return false;
            }

            var /**@type {number}*/ cnt = items.length;

            if(cnt > 0)
            {
                hasData = true;
                //listeners.onSyncStart(lazy)
                this.fireEvent(feedName, {eventType: sm.eventTypes.SOURCE_START, syncType: "Lazy", feed:feedName, sourceId:_sourceId});

                for(var i = 0; i < cnt; i ++)
                {
                    {
                        var type = items[i]["xef001type"];
                        if(type == "push")
                        {
                            var xpid = _sourceId + "_" + items[i]["xef001id"];
                            delete items[i]["xef001type"];
                            items[i]["xpid"] = xpid;
                            var entry = {eventType: type, feed:feedName, xpid: xpid, entry: items[i]};

                            this.db.insertOne(feedName, entry.entry, null);
                            this.fireEvent(feedName, entry);
                        }
                        else
                        {
                            throw new Error("Unexpected item type in history sync " + type);
                        }
                    }
                    // if last item has been processed:
                }
                //save history versions in db and cache
                this.saveHistoryVersions(feedName, _sourceId, filter, hver);
                this.fireEvent(feedName, {eventType: sm.eventTypes.SOURCE_COMPLETE, feed:feedName});
            }
        }
        if(!hasData)
        {
            this.saveEmptyHistoryVersions(feedName, filter);
        }

        this.fireEvent(feedName, {eventType: sm.eventTypes.FEED_COMPLETE, feed:feedName});

        return true;
    };

    /**
     * Saves versions
     * @param {string} feedName
     * @param {string} source
     * @param {string} filter
     * @param {string} version
     */
    fjs.fdp.SyncManager.prototype.saveHistoryVersions = function(feedName, source, filter, version) {
        if(this.db) {
            this.db.insertOne("historyversions", {"feedSourceFilter": feedName+"_"+source+"_"+"filter", "feedName":feedName, "source":source, filter: filter, "version":version});
            var feedHVersions = this.historyversions[feedName];
            if(feedHVersions){
                delete feedHVersions[filter];
                if(!feedHVersions){
                    delete this.historyversions[feedName];
                }
            }

        }
    };

    /**
     * Saves versions
     * @param {string} feedName
     * @param {string} filter
     */
    fjs.fdp.SyncManager.prototype.saveEmptyHistoryVersions = function(feedName, filter) {
        if(this.db) {
            this.db.insertOne("historyversions", {"feedName":feedName, filter: filter, "version":"-1"});
            delete this.historyversions[feedName];
        }
    };

    /**
     * @param {string} feedName
     * @param {*} data
     * @param {*} filter
     * @param {*} historyVersions
     * @return boolean
     * @private
     */
    fjs.fdp.SyncManager.prototype.notifyTabsHistory = function (feedName, filter, data, historyVersions) {
//            final JsonObject dataObj = new JsonObject();
//            dataObj.$set("_type", "history");
//            dataObj.$set("data", data);
//            dataObj.$set("name", feedName);
//            dataObj.$set("filter", filter);
//            dataObj.$set("version", historyVersions);
//
//            final String str = JSON.stringify(dataObj);
//            this.dataSynchronizer.writeData(SYNC_PROCESS, str);
    };

    fjs.fdp.SyncManager.prototype.logout = function() {
        this.ticket = null;
        this.node = null;
        this.getAuthTicket();
        this.state = sm.states.NOT_INITIALIZED;
    }
})();
