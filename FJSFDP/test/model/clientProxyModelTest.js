describe("ClientProxyModelTest", function () {
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
            , changes:{}
            , fireEvent: function(eventType, e) {
                expect('test2').toBe(e.feed);
                expect(true).toBe(!!e.changes);
                syncFired = true;
            }
            , onSyncComplete: fjs.fdp.model.ClientFeedProxyModel.prototype.onSyncComplete
        };

        testProxy.onSyncComplete();
        expect(false).toBe(syncFired);
        testProxy.changes={"0_1":new fjs.fdp.model.EntryChange('test', '0_1', {f2:3}, 'change')};
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
            , changes: {}
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

        testProxy.changes={};
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

        testProxy.changes={};

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


    it("fullTest", function(){

        var TestSyncManager = function() {
            fjs.model.EventsSource.call(this);
            this.clientSync = null;
        };

        fjs.core.inherits(TestSyncManager, fjs.model.EventsSource);

        TestSyncManager.prototype.addFeedListener = function(feedName, handler) {
            TestSyncManager.super_.prototype.addEventListener.call(this, feedName, handler)
        };
        TestSyncManager.prototype.removeFeedListener = function(feedName, handler) {
            TestSyncManager.super_.prototype.removeEventListener.call(this, feedName, handler)
        };

        TestSyncManager.prototype.onClientSync = function(sync) {
            this.clientSync = fjs.utils.JSON.parse(sync);
        };

        TestSyncManager.prototype.fireEvent = function(feedName, data, listener) {
            if(listener) {
                listener(data);
            }
            else if(feedName) {
                TestSyncManager.super_.prototype.fireEvent.call(this, feedName, data);
            }
            else {
                for(var _feedName in this.listeners) {
                    if(this.listeners.hasOwnProperty(_feedName)) {
                        TestSyncManager.super_.prototype.fireEvent.call(this, _feedName, data);
                    }
                }
            }
        };

        var sm = new TestSyncManager();

        var proxyModel = new fjs.fdp.model.ClientFeedProxyModel(['test', 'test2'], sm);

        var syncHandler1 = function(syncEvent) {};
        proxyModel.addEventListener('feed_change', syncHandler1);
        expect(1).toBe(sm.listeners['test'].length);
        expect(1).toBe(sm.listeners['test2'].length);
        expect(1).toBe(proxyModel.listeners['feed_change'].length);

        proxyModel.removeEventListener('feed_change', syncHandler1);

        expect(0).toBe(sm.listeners['test'].length);
        expect(0).toBe(sm.listeners['test2'].length);
        expect(0).toBe(proxyModel.listeners['feed_change'].length);

        var sync = null, doneFlag = false;
        var syncHandler2 = function(syncEvent) {
            sync = syncEvent;
            doneFlag = true;
        };

        proxyModel.addEventListener('feed_change', syncHandler1);
        proxyModel.addEventListener('feed_change', syncHandler2);

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
        expect(undefined).toBe(sync.changes['1_2']);
    });
});

