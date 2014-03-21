(function(){
    namespace("fjs.fdp");
    /**
     * <p>
     *     Synchronization manager. Main logic of synchronization with FDP server.
     * <p>
     * <p>
     *      It starts synchronization loop, receives required fdp data, sends actions to FDP server.
     * </p>
     * @param {Object} config
     * @constructor
     * @extends fjs.EventsSource
     */
    fjs.fdp.SyncManager = function(config) {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;

        fjs.EventsSource.call(this);

        this.db = new fjs.db.DBFactory().getDB();

        /**
         * Current SyncManager state
         * @type {fjs.fdp.SyncManager.states|number}
         */
        this.status = sm.states.NOT_INITIALIZED;

        /**
         * @type {Object}
         * @private
         */
        this.config = config;

        /**
         * Ajax provider
         * @type {fjs.fdp.FDPTransport}
         */
        this.transport = null;

        /**
         * Listeners for db data that don't sync with server
         * @type {Object}
         * @private
         */
        this.suspendedDbListeners = {};
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
         * Auth ticket
         * @type {string}
         */
        this.ticket = null;
        /**
         * Node Id
         * @type {string}
         */
        this.node = null;
        /**
         * URl to FDP server
         * @type {string}
         */
        this.serverHost = this.config.SERVER.serverURL;
        /**
         * @type {Array}
         * @private
         */
        this.syncFeeds = [];
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
         * @private
         */
        this.versionsTimeoutId = null;


        this.tabsSyncronizer = null;
    };

    fjs.fdp.SyncManager.extend(fjs.EventsSource);

    var sm = fjs.fdp.SyncManager;

    /**
     * <b>Enumerator</b> <br/> SyncManager states
     * @enum {number}
     */
    fjs.fdp.SyncManager.states = {
        /**
         * SyncManager not initialized. To start initialization you should call .init(ticket, node, authHandler, callback) method;
         */
        'NOT_INITIALIZED':-1,
        /**
         * SyncManager is in the process of initialization;
         */
         'INITIALIZATION':0,
        /**
         * SyncManager initialized and ready to work.
         */
        'READY':1
    };

    /**
     * <b>Enumerator</b> <br/>
     * Sync manager event types
     * @enum {string}
     */
    fjs.fdp.SyncManager.eventTypes = {
        /**
         * Start of receiving (parsing) FDP sync data
         */
        'SYNC_START': 'syncStart',
        /**
         * End of receiving (parsing) FDP sync data
         */
        'SYNC_COMPLETE': 'syncComplete',
        /**
         * Start of parsing sync data for specified feed
         */
        'FEED_START': 'feedStart',
        /**
         * End of parsing data for specified feed
         */
        'FEED_COMPLETE': 'feedComplete',
        /**
         * Start of parsing data for specified data source
         */
        'SOURCE_START': 'sourceStart',
        /**
         * End of parsing data for specified data source
         */
        'SOURCE_COMPLETE': 'sourceComplete',
        /**
         * Entry was added or changed
         */
        'ENTRY_CHANGE': 'push',
        /**
         * Entry was deleted
         */
        'ENTRY_DELETION': 'delete'
    };

    /**
     * <b>Enumerator</b> <br/>
     * FDP sync types
     * @enum {string}
     */
    fjs.fdp.SyncManager.syncTypes = {
        /**
         * Full sync, need to remove all previous data entries
         */
        'FULL':'F',
        /**
         * Keep sync, need to remove previous data entries except with status 'keep'
         */
        'KEEP':'I',
        /**
         * Lazy sync, need apple received changes only
         */
        'LAZY':'L',
        /**
         * History sync, part fo feed history was downloaded
         */
        'HISTORY':'H'
    };



    /**
     * Initializes Synchronization Manager
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {fjs.fdp.IAuthHandler} authHandler Handler of authentication events and errors
     * @param {Function} callback Method to execute when SyncManager initialized
     */
    fjs.fdp.SyncManager.prototype.init = function(ticket, node, authHandler, callback) {
        var context = this;
        /**
         * @type {states}
         */
        this.status = sm.states.INITIALIZATION;
        this.ticket = ticket;
        this.node = node;
        /**
         * @type {fjs.fdp.IAuthHandler}
         */
        this.authHandler = authHandler;

        /**
         * @param {fjs.fdp.FDPTransport} transport
         */
        function addTransportEvents(transport) {
            transport.addEventListener('message', function(e){
                switch(e.type) {
                    case 'sync':
                        context.onSync(e.data);
                        break;
                    case 'node':
                        context.authHandler.setNode(e.data.nodeId);
                        break;
                }
                if(new fjs.fdp.TabsSyncronizer().isMaster) {
                    fjs.fdp.LocalStorageTransport.masterSend('message', e);
                }
            });
            transport.addEventListener('error', function(e){
                switch(e.type) {
                    case 'requestError':

                        break;
                    case 'auth':
                        context.authHandler.requestAuth();
                        break;
                }
                if(new fjs.fdp.TabsSyncronizer().isMaster) {
                    fjs.fdp.LocalStorageTransport.masterSend('error', e);
                }
            });
        }

        if(fjs.fdp.TabsSyncronizer.useLocalStorageSyncronization()) {
            this.tabsSyncronizer = new fjs.fdp.TabsSyncronizer();
            this.tabsSyncronizer.addEventListener('master_changed', function(){
                context.transport.close();
                context.transport = fjs.fdp.TransportFactory.getTransport(context.ticket, context.node, context.serverHost);
                addTransportEvents(context.transport);
                clearTimeout(context.versionsTimeoutId);
                context.startSync(context.syncFeeds);
            });
        }
        this.transport = fjs.fdp.TransportFactory.getTransport(context.ticket, context.node, context.serverHost);
        addTransportEvents(this.transport);
        this.initDataBase(callback);
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

        for(var feedName in this.suspendedDbListeners) {
            if(this.suspendedDbListeners.hasOwnProperty(feedName)){
                for(var i = 0; i<this.suspendedDbListeners[feedName].length; i++){
                    this.doFillDbData(feedName, this.suspendedDbListeners[feedName][i]);
                }
            }
        }
        this.suspendedDbListeners = {};

        if(this.suspendFeeds.length > 0) {
            /**
             * Load data from localDB
             */
            var count = this.suspendFeeds.length;
            for(i=0; i<this.suspendFeeds.length; i++) {
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

        this.status = sm.states.READY;
        callback();
    };

    fjs.fdp.SyncManager.prototype.startSync = function(feeds) {
        var data = {};
        var  context=this;
        if(feeds) {
            var _count = 0;
            for(var i=0; i<feeds.length; i++) {
                _count++;
                this.getVersions(feeds[i], data, function(){
                    --_count;
                    if(_count===0) {
                        context.transport.send({'type':'synchronize', data:{versions:data}});
                    }
                });
            }
        }
        else {
            new Error ("You must set feeds names array");
        }
    };


    /**
     * Saves versions
     * @param {string} feedName
     * @param {string} source
     * @param {string} version
     * @private
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
     * @private
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

    fjs.fdp.SyncManager.prototype.parseSyncSourceData = function(items, feedName, sourceId) {
        for (var j = 0; j < items.length; j++) {
            var etype = (items[j]["xef001type"] || 'push') ;
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
     * @private
     */
    fjs.fdp.SyncManager.prototype.onSync = function (data) {
        /**
         *
         * @type {fjs.fdp.SyncManager}
         */
        var context= this ;
        var _data = fjs.utils.JSON.parse(data);

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
     * Sends action to FDP server
     * @param {string} feedName Feed name
     * @param {string} actionName Action name
     * @param {Object} data Request parameters ({'key':'value',...})
     */
    fjs.fdp.SyncManager.prototype.sendAction = function(feedName, actionName, data) {
        var context = this;
        data["action"] = actionName;
        this.sendRequest(this.serverHost+"/v1/"+feedName, data, function(){});
    };

    /**
     * @param feedName
     * @param entry
     * @param listener
     * @private
     */
    fjs.fdp.SyncManager.prototype.insertDbEntry = function(feedName, entry, listener) {
        if(this.db){
            var context = this, data = {eventType:sm.eventTypes.SYNC_START , syncType: "L", feed:feedName};
            this.fireEvent(feedName, data, listener);
            this.db.insertOne(feedName, entry.entry, function(){
                var data = {eventType: sm.eventTypes.ENTRY_CHANGE, feed:feedName, xpid: entry.xpid, entry: entry.entry};
                context.fireEvent(feedName, data, listener);
                context.fireEvent(feedName, {eventType: sm.eventTypes.SYNC_COMPLETE, feed:feedName}, listener);
            });

        }else{
            console.error("SyncManager error: can't insert db entry:"+feedName+" :" + entry + ". Db is not initialized.");
        }
    };



    /**
     * @private
     */
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
     * Adds listener on feed. If feed does not synchronize, adds this feed to synchronization.
     * @param {string} feedName Feed name
     * @param {Function} listener
     */
    fjs.fdp.SyncManager.prototype.addListener = function(feedName, listener) {

        var context = this;

        this.superClass.addEventListener.apply(this, arguments);

        if(this.status != sm.states.READY ) {
            if(this.suspendFeeds.indexOf(feedName)<0) {
                this.suspendFeeds.push(feedName);
            }
        }
        else if(this.syncFeeds.indexOf(feedName)<0) {
            this.syncFeeds.push(feedName);
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
     * Fills data from db if ready else - postpone.
     * @param feedName
     * @param listener
     * @private
     */
    fjs.fdp.SyncManager.prototype.fillDbData = function(feedName, listener) {
        if(!listener || !feedName){
            console.error("SyncManager error: try to fill db data for empty feed:"+feedName+" or listener:" + listener);
            return;
        }
        if(this.states==sm.states.READY) {
            this.doFillDbData(feedName, listener);
        }else{
            var tmpListeners = this.suspendedDbListeners[feedName];
            if(!tmpListeners) {
                tmpListeners = this.suspendedDbListeners[feedName] = [];
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
     * Fill data without check
     * @param feedName
     * @param listener
     * @private
     */
    fjs.fdp.SyncManager.prototype.doFillDbData = function(feedName, listener) {
        var context = this;
        this.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_START, feed:feedName}, listener);
        this.getFeedData(feedName, function(data){
            if(data.eventType == sm.eventTypes.FEED_COMPLETE) {
                context.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_COMPLETE, feed:feedName}, listener);
            }
            listener(data);
        });
    };

    /**
     * @param {string} feedName
     * @param {Function=} listener
     * @private
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
     * Removes listener from feed, if the number of listeners == 0, it stops synchronization for this feed.
     * @param {string} feedName
     * @param {Function} listener
     */
    fjs.fdp.SyncManager.prototype.removeListener = function(feedName, listener) {
        this.superClass.removeEventListener.apply(this, arguments);
        var index;
        if((index = this.syncFeeds.indexOf(feedName))>-1) {
            this.syncFeeds.splice(index, 1);
        }
        if(this.listeners[feedName] && this.listeners[feedName].length == 0) {
            this.transport.send({'type':'forget', 'data':{'feedName':feedName}});
        }
    };

    /**
     * @param {string} feedName
     * @param {*} data
     * @param {Function} listener
     * @private
     */
    fjs.fdp.SyncManager.prototype.fireEvent = function(feedName, data, listener) {
        if(listener) {
            listener(data);
        }
        else if(feedName) {
            this.superClass.fireEvent.call(this, feedName, data);
        }
        else {
            for(var _feedName in this.listeners) {
                if(this.listeners.hasOwnProperty(_feedName)) {
                    this.superClass.fireEvent.call(this, _feedName, data);
                }
            }
        }
    };

    /**
     * Loads more items for feeds with dynamic loading
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

    /**
     *
     * @param feedName
     * @param filter
     * @param count
     * @param _historyVersions
     * @param callback
     * @private
     */
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

    /**
     *
     * @param feedName
     * @param _historyVersions
     * @param callback
     * @private
     */
    fjs.fdp.SyncManager.prototype.fillEmptyHistoryVersionsFromFeed = function(feedName, _historyVersions, callback) {
        if(this.db) {
            //fill 0 versions for known sources
            this.db.selectByIndex("versions", {"feedName":feedName}, function(item) {
                _historyVersions.push(item["source"]+":0");
            }, callback);
        }
    };

    /**
     *
     * @param feedName
     * @param filter
     * @param count
     * @param _historyVersions
     * @param callback
     * @private
     */
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

        this.fireEvent(feedName, {eventType: sm.eventTypes.SYNC_COMPLETE, feed:feedName});

        return true;
    };

    /**
     * Saves versions
     * @param {string} feedName
     * @param {string} source
     * @param {string} filter
     * @param {string} version
     * @private
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
     * @private
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
    /**
     * Forgets auth info and call requestAuth method from the Auth Handler.
     */
    fjs.fdp.SyncManager.prototype.logout = function() {
        this.ticket = null;
        this.node = null;
        this.getAuthTicket();
        this.status = sm.states.NOT_INITIALIZED;
    }
})();
