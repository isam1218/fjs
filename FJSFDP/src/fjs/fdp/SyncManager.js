(function(){
    namespace("fjs.fdp");
    /**
     * 123
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
        this.syncs = [];
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
        this.syncTimeoutId = null;

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

        this.feeds = [];

        /**
         *
         * @type {fjs.api.TabsSynchronizer}
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
        'ENTRY_KEEP': 'keep',

        'CLEAR': 'clear'
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

        if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization()) {
            this.tabsSyncronizer = new fjs.api.TabsSynchronizer();
            if(fjs.utils.Browser.isIE11()) {
                this.tabsSyncronizer.addEventListener('lsp_clientSync', function (e) {
                    context.onStorage(e)
                });
                this.tabsSyncronizer.addEventListener('lsp_message', function (e) {
                    context.onStorage(e)
                });
                this.tabsSyncronizer.addEventListener('lsp_error', function (e) {
                    context.onStorage(e)
                });
                this.tabsSyncronizer.addEventListener('lsp_action', function (e) {
                    context.onStorage(e)
                });
            }
            else {
                self.addEventListener('storage', function (e) {
                    context.onStorage(e)
                }, false);
            }
            this.tabsSyncronizer.addEventListener('master_changed', function(){
                context.onMasterChanged();
            });
        }
        this.transport = fjs.fdp.transport.TransportFactory.getTransport(this.ticket, this.node, this.serverHost, this.type);
        this.addTransportEvents();
        this.initDataBase(callback);
    };

    fjs.fdp.SyncManager.prototype.onMasterChanged = function() {
        this.transport.close();
        this.transport = fjs.fdp.transport.TransportFactory.getTransport(this.ticket, this.node, this.serverHost, this.type);
        this.addTransportEvents();
        clearTimeout(this.versionsTimeoutId);
        this.startSync(this.syncFeeds);
    };

    fjs.fdp.SyncManager.prototype.onStorage = function(e) {
        if(e.key.indexOf('lsp_')>-1) {
            var eventType = e.key.replace('lsp_', '');
            if(new fjs.api.TabsSynchronizer().isMaster) {
                var obj = fjs.utils.JSON.parse(e.newValue);
                if(eventType == "clientSync") {
                    this.onClientSync(obj.data);
                }
                else {
                    this.transport.send({type:eventType, data:obj});
                }
            }
        }
    };

    fjs.fdp.SyncManager.prototype.addTransportEvents = function() {
        var context = this;
        this.transport.addEventListener('message', function(e){
            if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && new fjs.api.TabsSynchronizer().isMaster) {
                fjs.fdp.transport.LocalStorageTransport.masterSend('message', e);
            }
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
                case sm.eventTypes.CLEAR:
                    context.fireEvent(null, {eventType: sm.eventTypes.CLEAR});
                    break;
                default:
                    context.fireEvent(e.type, e);
                    break;
            }
        });
        this.transport.addEventListener('error', function(e){
            if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && new fjs.api.TabsSynchronizer().isMaster) {
                fjs.fdp.transport.LocalStorageTransport.masterSend('error', e);
            }
            switch(e.type) {
                default:
                    context.fireEvent(e.type, e);
            }
        });
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
            this.db.open(this.config.DB.name, this.config.DB.version, function(dbProvider){
                if(!dbProvider) {
                    context.db = null;
                }
                context.finishInitialization(callback);
                if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && context.tabsSyncronizer.isMaster) {
                    context.db.deleteByKey('tabsync', null);
                };
            });
        }
        else {
            this.finishInitialization(callback);
        }
    };

    fjs.fdp.SyncManager.prototype.getDataForFeeds = function (feeds, callback) {
        var context = this;
        fjs.utils.Core.asyncForIn(feeds, function(key, value, next){
            context.getFeedData(value, function(data){
                context.fireEvent(data.feed, data);
                if(data.eventType == sm.eventTypes.FEED_COMPLETE) {
                    next();
                }
            });
        }, function(){
            callback();
        });
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

        function endOfInit () {
            if(context.suspendFeeds.length>0) {
                context.startSync(context.suspendFeeds);
            }
            context.suspendFeeds = [];
            context.suspendClientFeeds = [];
            context.status = sm.states.READY;
            callback();
        }

        if(this.suspendLoginData) {
            var _suspendLoginData = this.suspendLoginData;
            if(this.db) {
                this.db.clear(function () {
                    context.transport.send({type: 'SFLogin', data: _suspendLoginData});
                    endOfInit();
                });
            }
            else {
                context.transport.send({type: 'SFLogin', data: _suspendLoginData});
                endOfInit();
            }
            this.suspendLoginData=null;
        }
        else {
            if (this.suspendFeeds.length > 0) {
                this.fireEvent(null, {eventType: sm.eventTypes.SYNC_START});
                this.getDataForFeeds(this.suspendFeeds, function () {
                    if (context.suspendClientFeeds.length > 0) {
                        context.getDataForFeeds(context.suspendClientFeeds, function () {
                            context.fireEvent(null, {eventType:sm.eventTypes.SYNC_COMPLETE});
                            endOfInit();
                        });
                    }
                    else {
                        context.fireEvent(null, {eventType:sm.eventTypes.SYNC_COMPLETE});
                        endOfInit();
                    }
                });
            }
            else if (this.suspendClientFeeds.length > 0) {
                this.fireEvent(null, {eventType: sm.eventTypes.SYNC_START});
                this.getDataForFeeds(this.suspendClientFeeds, function () {
                    context.fireEvent(null, {eventType:sm.eventTypes.SYNC_COMPLETE});
                    endOfInit();
                });
            }
            else {
                endOfInit();
            }
        }
    };

    /**
     * @param {Array.<string>} feeds
     * @private
     */
    fjs.fdp.SyncManager.prototype.startSync = function(feeds) {
        var data = {};
        var  context=this;
        if(feeds) {
            fjs.utils.Core.asyncForIn(feeds, function(key, value, next){
                context.getVersions(value, data, function() {
                    next();
                });
            }, function(){
                context.transport.send({'type': 'synchronize', data: {versions: data}});
            });
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
        if(this.db && version !== undefined && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
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
        else {
            if (this.db) {
                this.db.selectByIndex("versions", {"feedName": feedName}, function (item) {
                    versionsArr.push(item.source + "@" + item.version);
                }, function () {
                    context.versions[feedName] = data[feedName] = versionsArr.join(",");
                    callback(data[feedName]);
                });
            }
            else {
                setTimeout(function () {
                    callback(context.versions[feedName] = data[feedName] = "");
                }, 0);
            }
        }
    };

    fjs.fdp.SyncManager.prototype.lazySyncProcessItems = function(items, feedName, sourceId) {
        var entriesForSave = [];
        for (var j = 0; j < items.length; j++) {
            var entry = items[j];
            var etype = (entry["xef001type"] || sm.eventTypes.ENTRY_CHANGE) ;
            var xpid = entry.xpid = entry.xpid ? entry.xpid : (sourceId ? sourceId + "_" + entry["xef001id"] : entry["xef001id"]);
            delete entry["xef001type"];
            entry.source = sourceId;
            var event = {eventType: etype, feed:feedName, xpid: xpid, entry: entry};
            if(this.db) {
                switch (etype) {
                    case sm.eventTypes.ENTRY_CHANGE:
                        entriesForSave.push(event.entry);
                        break;
                    case sm.eventTypes.ENTRY_DELETION:
                        if((!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster))
                        this.db.deleteByKey(feedName, event.xpid, null);
                        break;
                    default:
                        fjs.utils.Console.error("Incorrect item change type: " + etype+" for Lazy sync");
                        break;
                }
            }
            this.fireEvent(feedName, event);
        }
        if(this.db && entriesForSave.length>0 && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
            this.db.insertArray(feedName, entriesForSave, null);
        }
    };

    fjs.fdp.SyncManager.prototype.fullSyncProcessItems = function(items, feedName, sourceId) {
        var context = this, entriesForSave=[];
            for (var j = 0; j < items.length; j++) {
                var entry = items[j];
                var etype = (entry["xef001type"] || sm.eventTypes.ENTRY_CHANGE) ;
                entry.source = sourceId;
                if(etype===sm.eventTypes.ENTRY_CHANGE) {
                    var xpid = entry.xpid = entry.xpid ? entry.xpid : (sourceId ? sourceId + "_" + entry["xef001id"] : entry["xef001id"]);
                    delete entry["xef001type"];
                    var event = {eventType: etype, feed: feedName, xpid: xpid, entry: entry};
                    entriesForSave.push(entry);
                    this.fireEvent(feedName, event);
                }
                else {
                    fjs.utils.Console.error("Incorrect item change type: " + etype+" for Full sync");
                }
            }
            if(this.db && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
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
            entry.source = sourceId;
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
                        fjs.utils.Console.error("Incorrect item change type: " + etype+" for Keep sync");
                        break;
                }
            }
            this.fireEvent(feedName, event);
        }
        if(this.db && entriesForSave.length > 0 && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
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
                fjs.utils.Console.error("Unknown sync type: "+type);
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

        var _data = fjs.utils.JSON.parse(data), context = this;
        if(this.syncTimeoutId !=null) {
            clearTimeout(this.syncTimeoutId);
            this.syncTimeoutId = null;
        }
        this.syncs.push(_data);
        if(this.syncs.length==1) {
            this.fireEvent(null, {eventType: sm.eventTypes.SYNC_START});
            for(var i=0; i <this.syncs.length; i++) {
                for (var feedName in this.syncs[i]) {
                    if (this.syncs[i].hasOwnProperty(feedName)) {
                        var feedData = this.syncs[i][feedName];
                        this.processFeedData(feedName, feedData);
                    }
                }
            }
            context.syncs = [];
            this.syncTimeoutId = setTimeout(function(){
                context.fireEvent(null, {eventType: sm.eventTypes.SYNC_COMPLETE});
                context.syncTimeoutId = null;
            },100);
        }
        else {
            fjs.utils.Console.log("!!!!Double onSync!!", this.syncs[0],  _data);
        }
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
     * @param {boolean} notBroadcast
     */
    fjs.fdp.SyncManager.prototype.onClientSync = function(message, notBroadcast) {
        if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && new fjs.api.TabsSynchronizer().isMaster) {
            fjs.fdp.transport.LocalStorageTransport.masterSend('message', {type:"sync", data:message});
        }
        else if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && !notBroadcast) {
            fjs.fdp.transport.LocalStorageTransport.masterSend('clientSync', {type:"clientSync", data:message});
        }
        if(!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster) {
            this.onSync(message);
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

        if(this.feeds.indexOf(feedName)<0) {
            this.feeds.push(feedName);
        }

        this.superClass.addEventListener.apply(this, arguments);

        if(this.status != sm.states.READY ) {
            if(isClient) {
                if (this.suspendClientFeeds.indexOf(feedName) < 0) {
                    this.suspendClientFeeds.push(feedName);
                }
            }
            else {
                if(this.suspendFeeds.indexOf(feedName)<0) {
                    this.suspendFeeds.push(feedName);
                }
                if(this.syncFeeds.indexOf(feedName)<0) {
                    this.syncFeeds.push(feedName);
                }
            }
        }
        else if(this.syncFeeds.indexOf(feedName)<0) {
            if(!isClient) {
                this.syncFeeds.push(feedName);
                if (this.versionsFeeds.indexOf(feedName)<0) {
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
        var index;
        if(index = (this.feeds.indexOf(feedName)>=0)) {
            this.feeds.splice(index, 1);
        }
        this.superClass.removeEventListener.apply(this, arguments);
        if(!isClient) {
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
                    if(this.feeds.indexOf(_feedName)>-1) {
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
        if(this.db && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
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
        if(this.db && (!fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() || new fjs.api.TabsSynchronizer().isMaster)) {
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
                context.fireEvent(null, {eventType: sm.eventTypes.CLEAR});
                for(var key in context.versions) {
                    if(context.versions.hasOwnProperty(key)) {
                        context.versions[key] = '';
                    }
                }
                if(fjs.fdp.transport.TransportFactory.useLocalStorageSyncronization() && new fjs.api.TabsSynchronizer().isMaster) {
                    fjs.fdp.transport.LocalStorageTransport.masterSend('message', {type: sm.eventTypes.CLEAR});
                }
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
