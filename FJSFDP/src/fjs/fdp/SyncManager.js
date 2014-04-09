(function(){
    namespace("fjs.fdp");
    /**
     * <p>
     *     Synchronization manager. Main logic of synchronization with FDP server.
     * <p>
     * <p>
     *      It starts synchronization loop, receives required fdp data, sends actions to FDP server.
     * </p>
     * <b>Singleton</b>
     * @param {Object} config Properties object
     * @constructor
     * @extends fjs.EventsSource
     */
    fjs.fdp.SyncManager = function(config) {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;

        fjs.EventsSource.call(this);

        this.db = new fjs.db.DBFactory(config).getDB();

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
         * Transport to communicate with FDP server
         * @type {fjs.fdp.transport.FDPTransport}
         */
        this.transport = null;

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

        this.type = this.config.CLIENT.type;
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
         *
         * @type {Array}
         */
        this.suspendClientFeeds = [];
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

        /**
         *
         * @type {fjs.fdp.TabsSynchronizer}
         * @private
         */
        this.tabsSyncronizer = null;

        this.suspendLoginData = null;
    };

    fjs.fdp.SyncManager.extend(fjs.EventsSource);

    var sm = fjs.fdp.SyncManager;

    /**
     * <b>Enumerator</b> <br/> SyncManager states
     * @enum {number}
     */
    fjs.fdp.SyncManager.states = {
        /**
         * SyncManager not initialized. To start initialization you should call .init(ticket, node, callback) method;
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
        'ENTRY_DELETION': 'delete',
        /**
         * Entry should be keeped
         */
        'ENTRY_KEEP': 'keep'
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
     * @param {Function} callback Method to execute when SyncManager initialized
     */
    fjs.fdp.SyncManager.prototype.init = function(ticket, node, callback) {
        var context = this;
        /**
         * @type {states}
         */
        this.status = sm.states.INITIALIZATION;
        this.ticket = ticket;
        this.node = node;



        /**
         * @param {fjs.fdp.transport.FDPTransport} transport
         */
        function addTransportEvents(transport) {
            transport.addEventListener('message', function(e){
                switch(e.type) {
                    case 'sync':
                        context.onSync(e.data);
                        break;

                        context.fireEvent('node', e);
                        break;
                    case 'ticket':
                        context.fireEvent('ticket', e);
                        context.startSync(context.syncFeeds);
                        break;
                    default:
                        context.fireEvent(e.type, e);
                        break;
                }
                if(fjs.fdp.TabsSynchronizer.useLocalStorageSyncronization() && new fjs.fdp.TabsSynchronizer().isMaster) {
                    fjs.fdp.transport.LocalStorageTransport.masterSend('message', e);
                }
            });
            transport.addEventListener('error', function(e){
                switch(e.type) {
                    default:
                        context.fireEvent(e.type, e);
                }
                if(fjs.fdp.TabsSynchronizer.useLocalStorageSyncronization() && new fjs.fdp.TabsSynchronizer().isMaster) {
                    fjs.fdp.transport.LocalStorageTransport.masterSend('error', e);
                }
            });
        }

        if(fjs.fdp.TabsSynchronizer.useLocalStorageSyncronization()) {
            this.onStorage = function(e) {
                if(e.key.indexOf('lsp_')>-1) {
                    var eventType = e.key.replace('lsp_', '');
                    if(new fjs.fdp.TabsSynchronizer().isMaster) {
                        var obj = fjs.utils.JSON.parse(e.newValue);
                        if(eventType == "clientSync") {
                            context.onClientSync(obj);
                        }
                        else {
                            context.transport.send({type:eventType, data:obj});
                        }
                    }
                }
            };
            window.addEventListener('storage', this.onStorage, false);
            this.tabsSyncronizer = new fjs.fdp.TabsSynchronizer();
            this.tabsSyncronizer.addEventListener('master_changed', function(){
                context.transport.close();
                context.transport = fjs.fdp.transport.TransportFactory.getTransport(context.ticket, context.node, context.serverHost, context.type);
                addTransportEvents(context.transport);
                clearTimeout(context.versionsTimeoutId);
                context.startSync(context.syncFeeds);
            });
        }
        this.transport = fjs.fdp.transport.TransportFactory.getTransport(context.ticket, context.node, context.serverHost, context.type);
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

        if(this.suspendFeeds.length > 0) {
            /**
             * Load data from localDB
             */
            var count = this.suspendFeeds.length;
            for(var i=0; i<this.suspendFeeds.length; i++) {
                if(this.syncFeeds.indexOf(this.suspendFeeds[i])<0) {
                    this.syncFeeds.push(this.suspendFeeds[i]);
                }
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
        if(this.suspendLoginData) {
            var _suspendLoginData = this.suspendLoginData;
            this.db.clear(function(){
                context.transport.send({type:'SFLogin', data:_suspendLoginData});

            });
            this.suspendLoginData=null;
        }
        this.status = sm.states.READY;
        callback();
    };

    /**
     * @param {Array.<string>} feeds
     * @private
     */
    fjs.fdp.SyncManager.prototype.startSync = function(feeds) {
        var data = {};
        var  context=this;
        if(feeds) {
            var _count = 0;
            for(var i=0; i<feeds.length; i++) {
                _count++;
                this.getVersions(feeds[i], data, function(){
                    _count--;
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
        if(this.db && version !== undefined) {
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
            setTimeout(function(){
                callback(data[feedName] = context.versions[feedName]);
            },0);
        }
        if(this.db) {
            this.db.selectByIndex("versions", {"feedName":feedName}, function(item) {
                versionsArr.push(item.source+"@"+item.version);
            }, function() {
                context.versions[feedName] = data[feedName] = versionsArr.join(",");
                callback(data[feedName]);
            });
        }
        else {
            setTimeout(function(){
                callback(data[feedName] = "");
            },0);
        }
    };

    fjs.fdp.SyncManager.prototype.lazySyncProcessItems = function(items, feedName, sourceId) {
        var entriesForSave = [];
        for (var j = 0; j < items.length; j++) {
            var entry = items[j];
            var etype = (entry["xef001type"] || sm.eventTypes.ENTRY_CHANGE) ;
            var xpid = entry.xpid = entry.xpid ? entry.xpid : (sourceId ? sourceId + "_" + entry["xef001id"] : entry["xef001id"]);
            delete entry["xef001type"];
            var event = {eventType: etype, feed:feedName, xpid: xpid, entry: entry};
            if(this.db) {
                switch (etype) {
                    case sm.eventTypes.ENTRY_CHANGE:
                        entriesForSave.push(event.entry);
                        break;
                    case sm.eventTypes.ENTRY_DELETION:
                        this.db.deleteByKey(feedName, event.xpid, null);
                        break;
                    default:
                        console.error("Incorrect item change type: " + etype+" for Lazy sync");
                        break;
                }
            }
            this.fireEvent(feedName, event);
        }
        if(this.db && entriesForSave.length>0) {
            this.db.insertArray(feedName, entriesForSave, null);
        }
    };

    fjs.fdp.SyncManager.prototype.fullSyncProcessItems = function(items, feedName, sourceId) {
        var context = this, entriesForSave=[];
            for (var j = 0; j < items.length; j++) {
                var entry = items[j];
                var etype = (entry["xef001type"] || sm.eventTypes.ENTRY_CHANGE) ;
                if(etype===sm.eventTypes.ENTRY_CHANGE) {
                    var xpid = entry.xpid = entry.xpid ? entry.xpid : (sourceId ? sourceId + "_" + entry["xef001id"] : entry["xef001id"]);
                    delete entry["xef001type"];
                    var event = {eventType: etype, feed: feedName, xpid: xpid, entry: entry};
                    entriesForSave.push(entry);
                    this.fireEvent(feedName, event);
                }
                else {
                    console.error("Incorrect item change type: " + etype+" for Full sync");
                }
            }
            if(this.db) {
                this.db.deleteByIndex(feedName, {'source': sourceId}, function () {
                    context.db.insertArray(feedName, entriesForSave, null);
                });
            }
    };

    fjs.fdp.SyncManager.prototype.keepSyncProcessItems = function(items, feedName, sourceId) {
        var entriesForSave = [], idsForKeep=[], idsForPush=[], context=this;
        for (var j = 0; j < items.length; j++) {
            var entry = items[j];
            var etype = (entry["xef001type"] || sm.eventTypes.ENTRY_CHANGE);
            var xpid = entry.xpid = entry.xpid ? entry.xpid : (sourceId ? sourceId + "_" + entry["xef001id"] : entry["xef001id"]);
            delete entry["xef001type"];
            var event = {eventType: etype, feed:feedName, xpid: xpid, entry: entry};
            if(this.db) {
                switch (etype) {
                    case sm.eventTypes.ENTRY_CHANGE:
                        entriesForSave.push(event.entry);
                        idsForPush.push(event.entry.xpid);
                        break;
                    case sm.eventTypes.ENTRY_KEEP:
                        idsForKeep.push(event.entry.xpid);
                        break;
                    default:
                        console.error("Incorrect item change type: " + etype+" for Keep sync");
                        break;
                }
            }
            this.fireEvent(feedName, event);
        }
        if(this.db && entriesForSave.length > 0) {
            this.db.selectByIndex(feedName, {'source':sourceId}, function(item){
                if(idsForKeep.indexOf(item.xpid)<0 && idsForPush.indexOf(item.xpid)<0) {
                    context.db.deleteByKey(feedName, item.xpid, null);
                }
            },  function(){
                    context.db.insertArray(feedName, entriesForSave, null);
            });
        }
    };

    fjs.fdp.SyncManager.prototype.processFeedData = function(feedName, feedData) {

        var isSource = function(sourceId) {
            return sourceId != 'full'
       };

        this.fireEvent(feedName, {eventType: sm.eventTypes.FEED_START, feed:feedName});

        for(var sourceId in feedData) {
            if(feedData.hasOwnProperty(sourceId) && isSource(sourceId)) {
                var sourceData = feedData[sourceId];
                this.processSourceData(feedName, sourceId, sourceData);
            }
        }

        this.fireEvent(feedName, {eventType: sm.eventTypes.FEED_COMPLETE, feed:feedName});
    };


    fjs.fdp.SyncManager.prototype.processSourceData = function(feedName, sourceId, sourceData) {
        var ver = sourceData["xef001ver"];
        if(sourceData["filter"]) {
            this.saveHistoryVersions(feedName, sourceId, sourceData["filter"], sourceData["h_ver"]);
        }
        var items = sourceData["items"];
        var type = sourceData["xef001type"];
        this.fireEvent(feedName, {eventType: sm.eventTypes.SOURCE_START, syncType: type, feed:feedName, sourceId:sourceId});
        switch(type) {
            case sm.syncTypes.LAZY:
                this.lazySyncProcessItems(items, feedName, sourceId);
                break;
            case sm.syncTypes.FULL:
                this.fullSyncProcessItems(items, feedName, sourceId);
                break;
            case sm.syncTypes.KEEP:
                this.keepSyncProcessItems(items, feedName, sourceId);
                break;
            default:
                console.error("Unknown sync type: "+type);
                break;
        }
        this.fireEvent(feedName, {eventType: sm.eventTypes.SOURCE_COMPLETE, feed:feedName, sourceId:sourceId, syncType: type});
        this.saveVersions(feedName, sourceId, ver);
    };

    /**
     * @param {*} data
     * @private
     */
    fjs.fdp.SyncManager.prototype.onSync = function (data) {

        var _data = fjs.utils.JSON.parse(data);

        this.fireEvent(null, {eventType: sm.eventTypes.SYNC_START});
        for (var feedName in _data) {
            if (_data.hasOwnProperty(feedName)) {
                var feedData = _data[feedName];
                this.processFeedData(feedName, feedData);
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
        data["action"] = actionName;
        this.transport.send({type:"action", data:{feedName:feedName, actionName:actionName, parameters: data}});
    };

    /**
     * Handler function to execute when client feed data has hanged.
     * @param {Object} message sync object (changes object)
     */
    fjs.fdp.SyncManager.prototype.onClientSync = function(message) {
        if(!fjs.fdp.TabsSynchronizer.useLocalStorageSyncronization() || new fjs.fdp.TabsSynchronizer().isMaster) {
           this.onSync(message);
           fjs.fdp.transport.LocalStorageTransport.masterSend('message', {type:"sync", data:message});
        }
        else {
            fjs.fdp.transport.LocalStorageTransport.masterSend('clientSync', message);
        }
    };

    /**
     * Clears stored data and throw auth error
     * @private
     */
    fjs.fdp.SyncManager.prototype.getAuthTicket = function() {
        var context = this;
        if(this.state == sm.states.READY && this.db) {
            this.db.clear(function(){
                context.fireEvent("authError", {type:'authError', message:'Auth ticket wrong or expired'});
            });
        }
        else {
            context.fireEvent("authError", {type:'authError', message:'Auth ticket wrong or expired'});
        }
    };

    /**
     * Adds listener on feed. If feed does not synchronize, adds this feed to synchronization.
     * @param {string} feedName Feed name
     * @param {Function} listener Handler function to execute when feed data changed
     * @param {boolean=} isClient True if is client feed (optional)
     */
    fjs.fdp.SyncManager.prototype.addFeedListener = function(feedName, listener, isClient) {

        var context = this;

        this.superClass.addEventListener.apply(this, arguments);

        if(this.status != sm.states.READY ) {
            if(isClient) {
                if (this.suspendClientFeeds.indexOf(feedName) < 0) {
                    this.suspendClientFeeds.push(feedName);
                }
            }
            if(this.suspendFeeds.indexOf(feedName)<0) {
                this.suspendFeeds.push(feedName);
            }
        }
        else if(this.syncFeeds.indexOf(feedName)<0) {
            if(!isClient) {
                this.syncFeeds.push(feedName);
                if (this.versionsFeeds.indexOf(feedName) < 0) {
                    this.versionsFeeds.push(feedName);
                }
                if (this.versionsTimeoutId != null) {
                    clearTimeout(this.versionsTimeoutId);
                    this.versionsTimeoutId = null;
                }
                this.versionsTimeoutId = setTimeout(function () {
                    context.startSync(context.versionsFeeds);
                    context.versionsFeeds = [];
                    context.versionsTimeoutId = null;
                }, 100);
            }
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
                    context.fireEvent(feedName, {eventType:sm.eventTypes.SYNC_COMPLETE, feed:feedName}, listener);
                }
                listener(data);
            });
        }
    };

    /**
     * Removes listener from feed, if the number of listeners == 0, it stops synchronization for this feed.
     * @param {string} feedName
     * @param {Function} listener
     * @param {boolean=} isClient
     */
    fjs.fdp.SyncManager.prototype.removeFeedListener = function(feedName, listener, isClient) {
        this.superClass.removeEventListener.apply(this, arguments);
        if(!isClient) {
            var index;
            if ((index = this.syncFeeds.indexOf(feedName)) > -1) {
                this.syncFeeds.splice(index, 1);
            }
            if (this.listeners[feedName] && this.listeners[feedName].length == 0) {
                this.transport.send({'type': 'forget', 'data': {'feedName': feedName}});
            }
        }
    };

    /**
     * Selects data for feed form database.
     * @param {string} feedName Feed name
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
     * Sends event to listeners
     *
     * @param {string} feedName Feed name
     * @param {*} data Event object
     * @param {Function} listener Handler function
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
                    if(this.syncFeeds.indexOf(_feedName)>-1) {
                        this.superClass.fireEvent.call(this, _feedName, data);
                    }
                }
            }
        }
    };

    /**
     * Loads more items for feeds with dynamic loading
     * @param {string} feedName Feed name
     * @param {*} _filter Filter to load only specified data
     * @param {number} count Count of items
     */
    fjs.fdp.SyncManager.prototype.loadNext = function(feedName, _filter, count) {

        var filter = fjs.utils.JSON.stringify(_filter);
        var feedHVersions = this.historyversions[feedName];
        if(!feedHVersions){
            feedHVersions={};
            this.historyversions[feedName] = feedHVersions;
        }
        if(feedHVersions[filter]){
            this.processHistoryVersions(feedName, filter, count, feedHVersions[filter], function(){});
            return;
        }

        var context = this;
        var hVersions = [];
        this.fillHistoryVersions(feedName, filter, count, hVersions, function(){
            context.processHistoryVersions(feedName, filter, count, hVersions, function(){});
        });
    };

    /**
     * @param {string} feedName
     * @param {Object} filter
     * @param {number} count
     * @param {Array} _historyVersions
     * @param {Function} callback
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
     * @param {string} feedName
     * @param {Array} _historyVersions
     * @param {Function} callback
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
     * @param {string} feedName
     * @param {Object} filter
     * @param {number} count
     * @param {Array} _historyVersions
     * @param {Function} callback
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

        var _data = {"s.limit":count, "sh.filter": filter, "sh.versions": _historyVersions.join("@")};

        this.transport.send({type:"loadNext", data:{feedName:feedName, data:_data}});
        if(callback){
            callback(true);
        }
    };

    /**
     * Saves history versions
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
     * Forgets auth info and call requestAuth method from the Auth Handler.
     */
    fjs.fdp.SyncManager.prototype.logout = function() {
        this.ticket = null;
        this.node = null;
        this.getAuthTicket();
        this.status = sm.states.NOT_INITIALIZED;
    };

    fjs.fdp.SyncManager.prototype.SFLogin = function(loginData) {
        var context = this;
        if(this.status == sm.states.READY && this.db) {
            this.db.clear(function(){
                context.transport.send({type:'SFLogin', data:loginData});
            });
        }
        else if(!this.db) {
            this.transport.send({type:'SFLogin', data:loginData});
        }
        else {
            this.suspendLoginData = loginData;
        }
    }
})();
