ddescribe("ClientProxyModelTest", function () {
    it("createSyncData", function () {
        var testProxy1 = {
            feedName: 'test'
            , clientFeedName: 'test'
        };
        var syncObj = fjs.fdp.model.ClientFeedProxyModel.prototype.createSyncData.call(testProxy1, "push", {f1:1, f2:"2", xpid:'0_2'});
        expect('{"test":{"":{"items":[{"f1":1,"f2":"2","xpid":"0_2","xef001type":"push"}],"xef001type":"L"}}}').toBe(fjs.utils.JSON.stringify(syncObj));
        syncObj = fjs.fdp.model.ClientFeedProxyModel.prototype.createSyncData.call(testProxy1, "delete", {xpid:'0_2'});
        expect('{"test":{"":{"items":[{"xpid":"0_2","xef001type":"delete"}],"xef001type":"L"}}}').toBe(fjs.utils.JSON.stringify(syncObj));
        var testProxy2 = {
            feedName: 'test2'
            , clientFeedName: 'test'
        };
        syncObj = fjs.fdp.model.ClientFeedProxyModel.prototype.createSyncData.call(testProxy2, "push", {f1:1, f2:"2", xpid:'0_2'});
        expect('{"test":{"":{"items":[{"f1":1,"f2":"2","xpid":"0_2","xef001type":"push"}],"xef001type":"L"}}}').toBe(fjs.utils.JSON.stringify(syncObj));
        syncObj = fjs.fdp.model.ClientFeedProxyModel.prototype.createSyncData.call(testProxy2, "delete", {xpid:'0_2'});
        expect('{"test":{"":{"items":[{"xpid":"0_2","xef001type":"delete"}],"xef001type":"L"}}}').toBe(fjs.utils.JSON.stringify(syncObj));

    });

    it('onSyncComplete', function(){
        var syncFired = false;
        var testProxy = {
            feedName:'test'
            , clientFeedName: 'test2'
            , fireEvent: function(e) {
                expect('test2').toBe(e.feed);
                expect(true).toBe(!!e.changes);
                syncFired = true;
            }
            , onSyncComplete: fjs.fdp.model.ClientFeedProxyModel.prototype.onSyncComplete
        };

        testProxy.onSyncComplete();
        expect(false).toBe(syncFired);
        testProxy.changes={"0_1":{f2:3}};
        testProxy.onSyncComplete();
        expect(true).toBe(syncFired);
    });

    it("sendAction", function(){
        var actionSended = false, syncData = null;
        var testProxy = {
            feedName: 'test'
            , clientFeedName: 'test2'
            , createSyncData:fjs.fdp.model.ClientFeedProxyModel.prototype.createSyncData
            , sendAction:fjs.fdp.model.ClientFeedProxyModel.prototype.sendAction
            , sm: {
                sendAction:function(feedName){
                    actionSended = (feedName == testProxy.feedName);
                }
                , onClientSync:function(sync) {
                    syncData = fjs.utils.JSON.parse(sync);
                }
            }
            , superClass:fjs.fdp.model.ProxyModel.prototype
        };
        testProxy.sendAction('test2', 'action', {f1:1, f2:'2', xpid:'0_1'});
        expect(true).toBe(actionSended);
        expect(null).toBe(syncData);
        actionSended = false;
        testProxy.sendAction('test2', 'push', {f1:2, f2:'3', xpid:'0_2'});
        expect(false).toBe(actionSended);
        expect(1).toBe(syncData['test2'][''].items.length);
        expect('L').toBe(syncData['test2'][''].xef001type);
        expect('push').toBe(syncData['test2'][''].items[0].xef001type);
        expect(2).toBe(syncData['test2'][''].items[0].f1);
        expect('3').toBe(syncData['test2'][''].items[0].f2);
        expect('0_2').toBe(syncData['test2'][''].items[0].xpid);
        testProxy.sendAction('test2', 'delete', {xpid:'0_2'});
        expect(false).toBe(actionSended);
        expect(1).toBe(syncData['test2'][''].items.length);
        expect('L').toBe(syncData['test2'][''].xef001type);
        expect('delete').toBe(syncData['test2'][''].items[0].xef001type);
        expect('0_2').toBe(syncData['test2'][''].items[0].xpid);
    });
    it("onEntryDeletion", function(){
        var deleteClientActionCalled = false;
        var testProxy = {
            feedName: 'test'
            , feedFields: {}
            , items:{}
            , keepEntries: {}
            , sendAction: function(feedName, actionName, data){
                deleteClientActionCalled = actionName == 'delete';
            }
            , clientFeedName: 'test2'
            , collectFields: fjs.fdp.model.ProxyModel.prototype.collectFields
            , createChange: fjs.fdp.model.ProxyModel.prototype.createChange
            , fillChange:fjs.fdp.model.ProxyModel.prototype.fillChange
            , fillDeletion:fjs.fdp.model.ProxyModel.prototype.fillDeletion
            , fieldPass:fjs.fdp.model.ProxyModel.prototype.fieldPass
            , prepareEntry:fjs.fdp.model.ProxyModel.prototype.prepareEntry
            , onEntryChange:fjs.fdp.model.ProxyModel.prototype.onEntryChange
            , onEntryDeletion:fjs.fdp.model.ClientFeedProxyModel.prototype.onEntryDeletion
            , createSyncData:fjs.fdp.model.ClientFeedProxyModel.prototype.createSyncData
        };

        testProxy.onEntryChange({xpid:'0_6', entry:{f1:1, f2:"2", xpid:'0_6', source:'0', xef001id: "6", xef001iver: "4169" }, feed:'test', eventType: "push"});
        testProxy.onEntryChange({xpid:'0_7', entry:{f1:2, f2:"3", xpid:'0_7', source:'0', xef001id: "7", xef001iver: "4167"}, feed:'test', eventType: "push"});
        testProxy.onEntryChange({xpid:'0_7', entry:{f3:1, f4:"2", xpid:'0_7', source:'0', xef001id: "7", xef001iver: "4168"}, feed:'test2', eventType: "push"});


        testProxy.onEntryDeletion({xpid:'0_6', eventType:'delete', feed:'test'});

        expect('delete').toBe(testProxy.changes['0_6'].type);
        expect(true).toBe(deleteClientActionCalled);
        expect(null).toBe(testProxy.changes['0_6'].entry);
        expect(undefined).toBe(testProxy.items['0_6']);

        deleteClientActionCalled = false;

        testProxy.onEntryDeletion({xpid:'0_7', feed:'test2', eventType:'delete'});
        expect('change').toBe(testProxy.changes['0_7'].type);
        expect(null).toBe(testProxy.changes['0_7'].entry.test2_f3);
        expect(null).toBe(testProxy.changes['0_7'].entry.test2_f4);
        expect(2).toBe(testProxy.items['0_7'].f1);
        expect('3').toBe(testProxy.items['0_7'].f2);
        expect(false).toBe(deleteClientActionCalled);

        testProxy.onEntryDeletion({xpid:'0_7', feed:'test', eventType:'delete'});
        expect('delete').toBe(testProxy.changes['0_7'].type);
        expect(null).toBe(testProxy.changes['0_7'].entry);
        expect(undefined).toBe(testProxy.items['0_7']);
        expect(true).toBe(deleteClientActionCalled);

        testProxy.changes=null;
        deleteClientActionCalled = false;

        testProxy.onEntryChange({xpid:'0_8', entry:{f1:2, f2:"3", xpid:'0_8', source:'0', xef001id: "7", xef001iver: "4167"}, feed:'test', eventType: "push"});
        testProxy.onEntryChange({xpid:'0_8', entry:{f3:1, f4:"2", xpid:'0_8', source:'0', xef001id: "7", xef001iver: "4168"}, feed:'test2', eventType: "push"});

        testProxy.onEntryDeletion({xpid:'0_8', feed:'test', eventType:'delete'});
        expect('delete').toBe(testProxy.changes['0_8'].type);
        expect(null).toBe(testProxy.changes['0_8'].entry);
        expect(undefined).toBe(testProxy.items['0_8']);
        expect(true).toBe(deleteClientActionCalled);
        testProxy.onEntryDeletion({xpid:'0_8', feed:'test1', eventType:'delete'});
        expect('delete').toBe(testProxy.changes['0_8'].type);
        expect(null).toBe(testProxy.changes['0_8'].entry);
        expect(undefined).toBe(testProxy.items['0_8']);

        testProxy.changes=null;

        testProxy.onEntryChange({xpid:'0_9', entry:{f1:2, f2:"3", xpid:'0_9', source:'0', xef001id: "7", xef001iver: "4167"}, feed:'test', eventType: "push"});
        testProxy.onEntryChange({xpid:'0_9', entry:{f3:1, f4:"2", xpid:'0_9', source:'0', xef001id: "7", xef001iver: "4168"}, feed:'test2', eventType: "push"});

        testProxy.onEntryDeletion({xpid:'0_9', feed:'test', eventType:'delete'});
        expect('delete').toBe(testProxy.changes['0_9'].type);
        expect(null).toBe(testProxy.changes['0_9'].entry);
        expect(undefined).toBe(testProxy.items['0_9']);

        testProxy.onEntryChange({xpid:'0_9', entry:{f3:1, f4:"2", xpid:'0_9', source:'0', xef001id: "7", xef001iver: "4168"}, feed:'test2', eventType: "push"});
        expect('delete').toBe(testProxy.changes['0_9'].type);
        expect(null).toBe(testProxy.changes['0_9'].entry);
        expect(undefined).toBe(testProxy.items['0_9']);
    });

    it("addListener", function(){
        var callbackCalled = false, attachCalled = false;
        var testProxy = {
            listeners:[]
            , feedName:'test'
            , clientFeedName:'test1'
            , _attached:false
            , attach:function(){
                attachCalled = true;
            }
            , createFullChange: function() {
                return this._changes;
            }
            , _changes:null
        };

        var handlerFn = function(){
            callbackCalled = true;
        };

        fjs.fdp.model.ClientFeedProxyModel.prototype.addListener.call(testProxy, handlerFn);

        expect(false).toBe(callbackCalled);
        expect(true).toBe(testProxy._attached);
        expect(true).toBe(attachCalled);
        expect(1).toBe(testProxy.listeners.length);

        attachCalled = false;
        testProxy._changes = {f1:2, f2:5};

        fjs.fdp.model.ClientFeedProxyModel.prototype.addListener.call(testProxy, handlerFn);

        expect(false).toBe(callbackCalled);
        expect(true).toBe(testProxy._attached);
        expect(false).toBe(attachCalled);
        expect(1).toBe(testProxy.listeners.length);

        fjs.fdp.model.ClientFeedProxyModel.prototype.addListener.call(testProxy, function(e){
            callbackCalled = true;
            expect('test1').toBe(e.feed);
            expect(2).toBe(e.changes.f1);
            expect(5).toBe(e.changes.f2);
        });

        expect(true).toBe(callbackCalled);
        expect(true).toBe(testProxy._attached);
        expect(false).toBe(attachCalled);
        expect(2).toBe(testProxy.listeners.length);
    });

    it("removeListener", function(){
        var callbackCalled = false, attachCalled = false, detachCalled = false;
        var testProxy = {
            listeners:[]
            , feedName:'test'
            , clientFeedName:'test1'
            , _attached:false
            , detach: function() {
                detachCalled = true;
            }
            , attach:function(){
                attachCalled = true;
            }
            , createFullChange: function() {
                return this._changes;
            }
            , _changes:null
        };

        var handlerFn1 = function(){
            callbackCalled = true;
        };

        var handlerFn2 = function(e){
            callbackCalled = true;
            expect('test1').toBe(e.feed);
            expect(2).toBe(e.changes.f1);
            expect(5).toBe(e.changes.f2);
        };

        fjs.fdp.model.ProxyModel.prototype.removeListener.call(testProxy, handlerFn1);
        expect(false).toBe(detachCalled);
        expect(false).toBe(callbackCalled);
        expect(false).toBe(testProxy._attached);
        expect(0).toBe(testProxy.listeners.length);

        fjs.fdp.model.ClientFeedProxyModel.prototype.addListener.call(testProxy, handlerFn1);

        expect(false).toBe(callbackCalled);
        expect(true).toBe(testProxy._attached);
        expect(true).toBe(attachCalled);
        expect(1).toBe(testProxy.listeners.length);

        fjs.fdp.model.ProxyModel.prototype.removeListener.call(testProxy, handlerFn1);

        expect(false).toBe(callbackCalled);
        expect(false).toBe(testProxy._attached);
        expect(true).toBe(detachCalled);
        expect(0).toBe(testProxy.listeners.length);

        fjs.fdp.model.ClientFeedProxyModel.prototype.addListener.call(testProxy, handlerFn1);

        expect(1).toBe(testProxy.listeners.length);
        expect(true).toBe(testProxy._attached);

        attachCalled = false;
        testProxy._changes = {f1:2, f2:5};

        fjs.fdp.model.ClientFeedProxyModel.prototype.addListener.call(testProxy, handlerFn2);

        expect(2).toBe(testProxy.listeners.length);
        expect(true).toBe(callbackCalled);
        expect(true).toBe(testProxy._attached);
        expect(false).toBe(attachCalled);

        fjs.fdp.model.ProxyModel.prototype.removeListener.call(testProxy, handlerFn1);

        expect(true).toBe(testProxy._attached);
        expect(1).toBe(testProxy.listeners.length);

        fjs.fdp.model.ProxyModel.prototype.removeListener.call(testProxy, handlerFn1);

        expect(true).toBe(testProxy._attached);
        expect(1).toBe(testProxy.listeners.length);

        fjs.fdp.model.ProxyModel.prototype.removeListener.call(testProxy, handlerFn2);

        expect(false).toBe(testProxy._attached);
        expect(0).toBe(testProxy.listeners.length);
    });


    it("collectFields", function() {
        var testProxy = {
            feedName:'test'
            , clientFeedName:'test2'
            , feedFields: {}
            , fieldPass: fjs.fdp.model.ProxyModel.prototype.fieldPass
        }

        var entry1 = {f1:1, f2:"2", f3:false, xpid:'0_1'};
        var entry2 = {test1_f1:2, test1_f2:"3", test1_f3:true, test1_xpid:'0_2'};
        var entry3 = {test2_f4:3, test2_f5:"4", test2_f6:false, test2_xpid:'0_1'};
        var entry4 = {test2_f7:3, test2_f8:"4", test2_f9:false, test2_xpid:'0_1'};

        fjs.fdp.model.ClientFeedProxyModel.prototype.collectFields.call(testProxy, 'test', entry1);
        expect('{}').toBe(fjs.utils.JSON.stringify(testProxy.feedFields));
        fjs.fdp.model.ClientFeedProxyModel.prototype.collectFields.call(testProxy, 'test1', entry2);
        expect(undefined).toBe(testProxy.feedFields['test']);
        expect(null).toBe(testProxy.feedFields['test1'].test1_f1);
        expect(null).toBe(testProxy.feedFields['test1'].test1_f2);
        expect(null).toBe(testProxy.feedFields['test1'].test1_f3);
        expect(undefined).toBe(testProxy.feedFields['test1'].xpid);
        expect(undefined).toBe(testProxy.feedFields['test1'].test1_xpid);
        fjs.fdp.model.ClientFeedProxyModel.prototype.collectFields.call(testProxy, 'test2', entry3);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f4);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f5);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f6);
        expect(undefined).toBe(testProxy.feedFields['test2'].xpid);
        expect(undefined).toBe(testProxy.feedFields['test2'].test2_xpid);
        fjs.fdp.model.ClientFeedProxyModel.prototype.collectFields.call(testProxy, 'test2', entry4);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f4);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f5);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f6);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f7);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f8);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f9);
        expect(undefined).toBe(testProxy.feedFields['test2'].xpid);
        expect(undefined).toBe(testProxy.feedFields['test2'].test2_xpid);
    });
    it("fullTest", function(){

        var TestSyncManager = function() {
            fjs.EventsSource.call(this);
            this.clientSync = null;
        };

        TestSyncManager.extend(fjs.EventsSource);

        TestSyncManager.prototype.addFeedListener = function(feedName, handler) {
            this.superClass.addEventListener.call(this, feedName, handler)
        };
        TestSyncManager.prototype.removeFeedListener = function(feedName, handler) {
            this.superClass.removeEventListener.call(this, feedName, handler)
        };

        TestSyncManager.prototype.onClientSync = function(sync) {
            this.clientSync = fjs.utils.JSON.parse(sync);
        };

        TestSyncManager.prototype.fireEvent = function(feedName, data, listener) {
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

        var sm = new TestSyncManager();

        var proxyModel = new fjs.fdp.model.ClientFeedProxyModel(['test', 'test2'], sm);

        var syncHandler1 = function(syncEvent) {};
        proxyModel.addListener(syncHandler1);
        expect(1).toBe(sm.listeners['test'].length);
        expect(1).toBe(sm.listeners['test2'].length);
        expect(true).toBe(proxyModel._attached);
        expect(1).toBe(proxyModel.listeners.length);
        proxyModel.removeListener(syncHandler1);

        expect(0).toBe(sm.listeners['test'].length);
        expect(0).toBe(sm.listeners['test2'].length);
        expect(false).toBe(proxyModel._attached);
        expect(0).toBe(proxyModel.listeners.length);

        var sync = null, doneFlag = false;
        var syncHandler2 = function(syncEvent) {
            sync = syncEvent;
            doneFlag = true;
        };

        proxyModel.addListener(syncHandler1);
        proxyModel.addListener(syncHandler2);

        /**FirstSync**/

        sm.fireEvent(null, {eventType: fjs.fdp.SyncManager.eventTypes.SYNC_START});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_START, feed:'test'});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test', sourceId:0});
        sm.fireEvent('test', {eventType: 'push', feed: 'test', xpid: '0_1', entry: {f1:1, f2:"2", xpid:'0_1', source:'0', xef001id: "1", xef001iver: "4167"}});
        sm.fireEvent('test', {eventType: 'push', feed: 'test', xpid: '0_2', entry: {f1:2, f2:"3", xpid:'0_2', source:'0', xef001id: "2", xef001iver: "4167"}});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test', sourceId:0});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test', sourceId:1});
        sm.fireEvent('test', {eventType: 'push', feed: 'test', xpid: '1_1', entry: {f1:3, f2:"4", xpid:'1_1', source:'1', xef001id: "1", xef001iver: "4167"}});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test', sourceId:1});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_COMPLETE, feed:'test'});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_START, feed:'test2'});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test2', sourceId:0});
        sm.fireEvent('test2', {eventType: 'push', feed: 'test2', xpid: '0_1', entry: {f1:4, f2:"5", xpid:'0_1', source:'0', xef001id: "1", xef001iver: "4167"}});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test2', sourceId:0});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test2', sourceId:1});
        sm.fireEvent('test2', {eventType: 'push', feed: 'test2', xpid: '1_1', entry: {f1:5, f2:"6", xpid:'1_1', source:'1', xef001id: "1", xef001iver: "4167"}});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test2', sourceId:1});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_COMPLETE, feed:'test2'});
        sm.fireEvent(null, {eventType: fjs.fdp.SyncManager.eventTypes.SYNC_COMPLETE});

        expect('test2').toBe(sync.feed);
        expect('change').toBe(sync.changes['0_1'].type);
        expect(1).toBe(sync.changes['0_1'].entry.f1);
        expect('2').toBe(sync.changes['0_1'].entry.f2);
        expect('0_1').toBe(sync.changes['0_1'].entry.xpid);
        expect(undefined).toBe(sync.changes['0_1'].entry.source);
        expect(undefined).toBe(sync.changes['0_1'].entry.xef001id);
        expect(undefined).toBe(sync.changes['0_1'].entry.xef001iver);
        expect(4).toBe(sync.changes['0_1'].entry.test2_f1);
        expect('5').toBe(sync.changes['0_1'].entry.test2_f2);
        expect(undefined).toBe(sync.changes['0_1'].entry.test2_xpid);
        expect('change').toBe(sync.changes['0_2'].type);
        expect(2).toBe(sync.changes['0_2'].entry.f1);
        expect('3').toBe(sync.changes['0_2'].entry.f2);
        expect('0_2').toBe(sync.changes['0_2'].entry.xpid);
        expect(undefined).toBe(sync.changes['0_2'].entry.source);
        expect(undefined).toBe(sync.changes['0_2'].entry.xef001id);
        expect(undefined).toBe(sync.changes['0_2'].entry.xef001iver);
        expect('change').toBe(sync.changes['1_1'].type);
        expect(3).toBe(sync.changes['1_1'].entry.f1);
        expect('4').toBe(sync.changes['1_1'].entry.f2);
        expect('1_1').toBe(sync.changes['1_1'].entry.xpid);
        expect(undefined).toBe(sync.changes['1_1'].entry.source);
        expect(undefined).toBe(sync.changes['1_1'].entry.xef001id);
        expect(undefined).toBe(sync.changes['1_1'].entry.xef001iver);
        expect(5).toBe(sync.changes['1_1'].entry.test2_f1);
        expect('6').toBe(sync.changes['1_1'].entry.test2_f2);
        expect(undefined).toBe(sync.changes['1_1'].entry.test2_xpid);

        /**LazySync**/

        sm.fireEvent(null, {eventType: fjs.fdp.SyncManager.eventTypes.SYNC_START});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_START, feed:'test'});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.LAZY, feed:'test', sourceId:0});
        sm.fireEvent('test', {eventType: 'delete', feed: 'test', xpid: '0_1'});
        sm.fireEvent('test', {eventType: 'push', feed: 'test', xpid: '0_2', entry: {f1:2, f2:"4", xpid:'0_2', source:'0', xef001id: "2", xef001iver: "4168"}});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.LAZY, feed:'test', sourceId:0});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.LAZY, feed:'test', sourceId:1});
        sm.fireEvent('test', {eventType: 'push', feed: 'test', xpid: '1_1', entry: {f1:3, f2:"4", xpid:'1_1', source:'1', xef001id: "1", xef001iver: "4168"}});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.LAZY, feed:'test', sourceId:1});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_COMPLETE, feed:'test'});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_START, feed:'test2'});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.LAZY, feed:'test2', sourceId:0});
        sm.fireEvent('test2', {eventType: 'delete', feed: 'test2', xpid: '0_1'});
        sm.fireEvent('test2', {eventType: 'push', feed: 'test2', xpid: '0_2', entry: {f1:0, f2:"0", xpid:'0_2', source:'0', xef001id: "2", xef001iver: "4168"}});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.LAZY, feed:'test2', sourceId:0});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.LAZY, feed:'test2', sourceId:1});
        sm.fireEvent('test2', {eventType: 'delete', feed: 'test2', xpid: '1_1'});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.LAZY, feed:'test2', sourceId:1});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_COMPLETE, feed:'test2'});
        sm.fireEvent(null, {eventType: fjs.fdp.SyncManager.eventTypes.SYNC_COMPLETE});

        expect('test2').toBe(sync.feed);
        expect('delete').toBe(sync.changes['0_1'].type);
        expect(null).toBe(sync.changes['0_1'].entry);
        expect('change').toBe(sync.changes['0_2'].type);
        expect(undefined).toBe(sync.changes['0_2'].entry.f1);
        expect('4').toBe(sync.changes['0_2'].entry.f2);
        expect('0_2').toBe(sync.changes['0_2'].entry.xpid);
        expect(undefined).toBe(sync.changes['0_2'].entry.source);
        expect(undefined).toBe(sync.changes['0_2'].entry.xef001id);
        expect(undefined).toBe(sync.changes['0_2'].entry.xef001iver);
        expect(0).toBe(sync.changes['0_2'].entry.test2_f1);
        expect('0').toBe(sync.changes['0_2'].entry.test2_f2);
        expect(undefined).toBe(sync.changes['1_1'].entry.test2_xpid);
        expect('change').toBe(sync.changes['1_1'].type);
        expect(undefined).toBe(sync.changes['1_1'].entry.f1);
        expect(undefined).toBe(sync.changes['1_1'].entry.f2);
        expect('1_1').toBe(sync.changes['1_1'].entry.xpid);
        expect(undefined).toBe(sync.changes['1_1'].entry.source);
        expect(undefined).toBe(sync.changes['1_1'].entry.xef001id);
        expect(undefined).toBe(sync.changes['1_1'].entry.xef001iver);
        expect(null).toBe(sync.changes['1_1'].entry.test2_f1);
        expect(null).toBe(sync.changes['1_1'].entry.test2_f2);
        expect(undefined).toBe(sync.changes['1_1'].entry.test2_xpid);

        /**FullSync**/

        sm.fireEvent(null, {eventType: fjs.fdp.SyncManager.eventTypes.SYNC_START});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_START, feed:'test'});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test', sourceId:0});
        sm.fireEvent('test', {eventType: 'push', feed: 'test', xpid: '0_3', entry: {f1:2, f2:"4", xpid:'0_3', source:'0', xef001id: "3", xef001iver: "4168"}});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test', sourceId:0});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test', sourceId:1});
        sm.fireEvent('test', {eventType: 'push', feed: 'test', xpid: '1_1', entry: {f1:3, f2:"4", xpid:'1_1', source:'1', xef001id: "1", xef001iver: "4168"}});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test', sourceId:1});
        sm.fireEvent('test', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_COMPLETE, feed:'test'});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_START, feed:'test2'});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test2', sourceId:0});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test2', sourceId:0});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_START, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test2', sourceId:1});
        sm.fireEvent('test2', {eventType: 'push', feed: 'test2', xpid: '1_2', entry: {f1:3, f2:"4", xpid:'1_2', source:'1', xef001id: "2", xef001iver: "4168"}});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE, syncType: fjs.fdp.SyncManager.syncTypes.FULL, feed:'test2', sourceId:1});
        sm.fireEvent('test2', {eventType: fjs.fdp.SyncManager.eventTypes.FEED_COMPLETE, feed:'test2'});
        sm.fireEvent(null, {eventType: fjs.fdp.SyncManager.eventTypes.SYNC_COMPLETE});

        expect('test2').toBe(sync.feed);
        expect('delete').toBe(sync.changes['0_2'].type);
        expect(null).toBe(sync.changes['0_2'].entry);
        expect('change').toBe(sync.changes['0_3'].type);
        expect(2).toBe(sync.changes['0_3'].entry.f1);
        expect('4').toBe(sync.changes['0_3'].entry.f2);
        expect('0_3').toBe(sync.changes['0_3'].entry.xpid);
        expect(undefined).toBe(sync.changes['1_1']);
        expect('change').toBe(sync.changes['1_2'].type);
        expect(undefined).toBe(sync.changes['1_2'].entry.f1);
        expect(undefined).toBe(sync.changes['1_2'].entry.f2);
        expect('1_2').toBe(sync.changes['1_2'].entry.xpid);
        expect(undefined).toBe(sync.changes['1_2'].entry.source);
        expect(undefined).toBe(sync.changes['1_2'].entry.xef001id);
        expect(undefined).toBe(sync.changes['1_2'].entry.xef001iver);
        expect(3).toBe(sync.changes['1_2'].entry.test2_f1);
        expect('4').toBe(sync.changes['1_2'].entry.test2_f2);
        expect(undefined).toBe(sync.changes['1_2'].entry.test2_xpid);
    });
});

