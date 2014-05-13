describe("ProxyModelTest", function () {
    var proxyModel1, doneFlag, data;
    it("addListener", function(){
        var callbackCalled = false, attachCalled = false;
        var testProxy = {
            listeners:[]
            , feedName:'test'
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

        fjs.fdp.model.ProxyModel.prototype.addListener.call(testProxy, handlerFn);

        expect(false).toBe(callbackCalled);
        expect(true).toBe(testProxy._attached);
        expect(true).toBe(attachCalled);
        expect(1).toBe(testProxy.listeners.length);

        attachCalled = false;
        testProxy._changes = {f1:2, f2:5};

        fjs.fdp.model.ProxyModel.prototype.addListener.call(testProxy, handlerFn);

        expect(false).toBe(callbackCalled);
        expect(true).toBe(testProxy._attached);
        expect(false).toBe(attachCalled);
        expect(1).toBe(testProxy.listeners.length);

        fjs.fdp.model.ProxyModel.prototype.addListener.call(testProxy, function(e){
            callbackCalled = true;
            expect('test').toBe(e.feed);
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
            expect('test').toBe(e.feed);
            expect(2).toBe(e.changes.f1);
            expect(5).toBe(e.changes.f2);
        };

        fjs.fdp.model.ProxyModel.prototype.removeListener.call(testProxy, handlerFn1);
        expect(false).toBe(detachCalled);
        expect(false).toBe(callbackCalled);
        expect(false).toBe(testProxy._attached);
        expect(0).toBe(testProxy.listeners.length);

        fjs.fdp.model.ProxyModel.prototype.addListener.call(testProxy, handlerFn1);

        expect(false).toBe(callbackCalled);
        expect(true).toBe(testProxy._attached);
        expect(true).toBe(attachCalled);
        expect(1).toBe(testProxy.listeners.length);

        fjs.fdp.model.ProxyModel.prototype.removeListener.call(testProxy, handlerFn1);

        expect(false).toBe(callbackCalled);
        expect(false).toBe(testProxy._attached);
        expect(true).toBe(detachCalled);
        expect(0).toBe(testProxy.listeners.length);

        fjs.fdp.model.ProxyModel.prototype.addListener.call(testProxy, handlerFn1);

        expect(1).toBe(testProxy.listeners.length);
        expect(true).toBe(testProxy._attached);

        attachCalled = false;
        testProxy._changes = {f1:2, f2:5};

        fjs.fdp.model.ProxyModel.prototype.addListener.call(testProxy, handlerFn2);

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

    it("fireEvent", function() {

        var testProxy = {
            listeners:[]
            , feedName:'test'
            , _attached:false
            , detach: function() {
            }
            , attach:function(){
            }
            , createFullChange: function() {
                return this._changes;
            }
            , _changes:null
        };


        var listener1CallsCount = 0;
        var listener2CallsCount = 0;
        var listener3CallsCount = 0;
        var listener4CallsCount = 0;

        var listener1 = function(){listener1CallsCount++};
        var listener2 = function(){
            listener2CallsCount++;
            fjs.fdp.model.ProxyModel.prototype.removeListener.call(testProxy, listener1);
        };
        var listener3 = function(){
            listener3CallsCount++;
            fjs.fdp.model.ProxyModel.prototype.removeListener.call(testProxy, listener3);
        };
        var listener4 = function(){listener4CallsCount++;};

        fjs.fdp.model.ProxyModel.prototype.addListener.call(testProxy, listener1);
        fjs.fdp.model.ProxyModel.prototype.addListener.call(testProxy, listener2);
        fjs.fdp.model.ProxyModel.prototype.addListener.call(testProxy, listener3);
        fjs.fdp.model.ProxyModel.prototype.addListener.call(testProxy, listener4);
        fjs.fdp.model.ProxyModel.prototype.fireEvent.call(testProxy, {f1:1, f2:2});
        expect(1).toBe(listener1CallsCount);
        expect(1).toBe(listener2CallsCount);
        expect(1).toBe(listener3CallsCount);
        expect(1).toBe(listener4CallsCount);
        fjs.fdp.model.ProxyModel.prototype.fireEvent.call(testProxy, {f1:1, f2:2});
        expect(1).toBe(listener1CallsCount);
        expect(2).toBe(listener2CallsCount);
        expect(1).toBe(listener3CallsCount);
        expect(2).toBe(listener4CallsCount);
    });

    it('createChange', function(){
        var testProxy = {};
        var changeObject = fjs.fdp.model.ProxyModel.prototype.createChange.call(testProxy, '123_123');
        expect('{"xpid":"123_123","entry":{}}').toBe(fjs.utils.JSON.stringify(changeObject));
        expect('{"xpid":"123_123","entry":{}}').toBe(fjs.utils.JSON.stringify(testProxy.changes['123_123']));
        expect('123_123').toBe(testProxy.changes['123_123'].xpid);
    });

    it('createFullChange', function(){
        var testProxy = {
            items:{}
        };
        var changes = fjs.fdp.model.ProxyModel.prototype.createFullChange.call(testProxy);
        expect(null).toBe(changes);
        testProxy.items = {'2':{field1:4, field2:'3'}, '3':{field1:6, field2:'4'}};
        changes = fjs.fdp.model.ProxyModel.prototype.createFullChange.call(testProxy);
        expect('2').toBe(changes['2'].xpid);
        expect('change').toBe(changes['2'].type);
        expect(4).toBe(changes['2'].entry.field1);
        expect('3').toBe(changes['2'].entry.field2);
        expect('3').toBe(changes['3'].xpid);
        expect('change').toBe(changes['3'].type);
        expect(6).toBe(changes['3'].entry.field1);
        expect('4').toBe(changes['3'].entry.field2);
    });

    it('collectFields', function(){
        var testProxy = {
            feedName: 'test'
            , feedFields: {}
            , fieldPass: fjs.fdp.model.ProxyModel.prototype.fieldPass
        };
        var entry1 = {f1:1, f2:"2", f3:false, xpid:'0_1'};
        var entry2 = {test1_f1:2, test1_f2:"3", test1_f3:true, test1_xpid:'0_2'};
        var entry3 = {test2_f4:3, test2_f5:"4", test2_f6:false, test2_xpid:'0_1'};

        fjs.fdp.model.ProxyModel.prototype.collectFields.call(testProxy, 'test', entry1);
        expect('{}').toBe(fjs.utils.JSON.stringify(testProxy.feedFields));
        fjs.fdp.model.ProxyModel.prototype.collectFields.call(testProxy, 'test1', entry2);
        expect(undefined).toBe(testProxy.feedFields['test']);
        expect(null).toBe(testProxy.feedFields['test1'].test1_f1);
        expect(null).toBe(testProxy.feedFields['test1'].test1_f2);
        expect(null).toBe(testProxy.feedFields['test1'].test1_f3);
        expect(undefined).toBe(testProxy.feedFields['test1'].xpid);
        expect(undefined).toBe(testProxy.feedFields['test1'].test1_xpid);
        fjs.fdp.model.ProxyModel.prototype.collectFields.call(testProxy, 'test2', entry3);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f4);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f5);
        expect(null).toBe(testProxy.feedFields['test2'].test2_f6);
        expect(undefined).toBe(testProxy.feedFields['test2'].xpid);
        expect(undefined).toBe(testProxy.feedFields['test2'].test2_xpid);
    });

    it('prepareEntry', function(){
        var testProxy = {
            feedName: 'test'
        };
        var prepared = fjs.fdp.model.ProxyModel.prototype.prepareEntry.call(testProxy, {f1:1, f2:2}, 'test');
        expect(1).toBe(prepared.f1);
        expect(2).toBe(prepared.f2);
        var prepared = fjs.fdp.model.ProxyModel.prototype.prepareEntry.call(testProxy, {f1:1, f2:2}, 'test2');
        expect(1).toBe(prepared["test2_f1"]);
        expect(2).toBe(prepared["test2_f2"]);
    });

    it('fieldPass', function(){
        var testProxy = {
            feedName: 'test'
        };
        expect(true).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test', 'f1', false));
        expect(true).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test', 'xpid', true));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test', 'xpid', false));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test', 'xef001id', false));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test', 'xef001iver', true));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test', 'xef001type', false));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test', 'source', true));

        expect(true).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test2', 'xpid', true));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test2', 'xpid', false));
        expect(true).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test2', 'test2_f1', true));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test2', 'test2_xpid', true));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test2', 'test2_xpid', false));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test2', 'test2_xef001id', false));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test2', 'test2_xef001iver', true));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test2', 'test2_xef001type', false));
        expect(false).toBe(fjs.fdp.model.ProxyModel.prototype.fieldPass.call(testProxy, 'test2', 'test2_source', true));


    });

    it('fillChange', function() {
        var testProxy = {
            feedName: 'test'
            , feedFields: {}
            , items:{}
            , collectFields: fjs.fdp.model.ProxyModel.prototype.collectFields
            , createChange: fjs.fdp.model.ProxyModel.prototype.createChange
            , fillChange:fjs.fdp.model.ProxyModel.prototype.fillChange
            , fieldPass:fjs.fdp.model.ProxyModel.prototype.fieldPass
        };
        testProxy.fillChange('0_4', {f1:5, f2:'2', xpid:'0_4', source:'0'}, 'test');
        testProxy.fillChange('0_5', {f1:7, f2:'5', xpid:'0_5', source:'0'}, 'test');
        testProxy.fillChange('0_5', {test2_f3:9, test2_f4:'7', test2_source:'0', test2_xpid:'0_5'}, "test2");
        testProxy.fillChange('0_4', {test2_f3:9, test2_f4:'7', test2_source:'0', test2_xpid:'0_4'}, "test2");

        expect('0_4').toBe(testProxy.changes['0_4'].xpid);
        expect('0_5').toBe(testProxy.changes['0_5'].xpid);
        expect('change').toBe(testProxy.changes['0_4'].type);
        expect('change').toBe(testProxy.changes['0_5'].type);

        expect(5).toBe(testProxy.changes['0_4'].entry.f1);
        expect('2').toBe(testProxy.changes['0_4'].entry.f2);
        expect(undefined).toBe(testProxy.changes['0_4'].entry.source);
        expect(7).toBe(testProxy.changes['0_5'].entry.f1);
        expect('5').toBe(testProxy.changes['0_5'].entry.f2);
        expect(undefined).toBe(testProxy.changes['0_5'].entry.source);
        expect(9).toBe(testProxy.changes['0_5'].entry.test2_f3);
        expect(undefined).toBe(testProxy.changes['0_5'].entry.test2_xpid);
        expect(undefined).toBe(testProxy.changes['0_5'].entry.test2_source);
        expect('7').toBe(testProxy.changes['0_5'].entry.test2_f4);
        expect(undefined).toBe(testProxy.changes['0_4'].entry.test2_xpid);
        expect(undefined).toBe(testProxy.changes['0_4'].entry.test2_source);
    });

    it('fillDeletion', function() {

        var testProxy = {
            feedName: 'test'
            , feedFields: {}
            , items:{}
            , keepEntries:{}
            , collectFields: fjs.fdp.model.ProxyModel.prototype.collectFields
            , createChange: fjs.fdp.model.ProxyModel.prototype.createChange
            , fillChange:fjs.fdp.model.ProxyModel.prototype.fillChange
            , fillDeletion:fjs.fdp.model.ProxyModel.prototype.fillDeletion
            , prepareEntry:fjs.fdp.model.ProxyModel.prototype.prepareEntry
            , fieldPass:fjs.fdp.model.ProxyModel.prototype.fieldPass
            , onEntryChange:fjs.fdp.model.ProxyModel.prototype.onEntryChange
        };

        testProxy.onEntryChange({xpid: '0_4', entry:{f1:5, f2:'2', xpid:'0_4', source:'0'}, feed:'test'});
        testProxy.onEntryChange({xpid:'0_5', entry:{f1:7, f2:'5', xpid:'0_5', source:'0'}, feed:'test'});
        testProxy.onEntryChange({xpid:'0_5', entry:{f3:9, f4:'7', source:'0', xpid:'0_5'}, feed:"test2"});
        testProxy.onEntryChange({xpid:'0_4', entry:{f3:9, f4:'7', source:'0', xpid:'0_4'}, feed:"test2"});

        testProxy.fillDeletion('0_4', 'test');
        expect('delete').toBe(testProxy.changes['0_4'].type);
        expect(null).toBe(testProxy.changes['0_4'].entry);

        testProxy.fillDeletion('0_5', 'test2');

        expect(7).toBe(testProxy.changes['0_5'].entry.f1);
        expect('5').toBe(testProxy.changes['0_5'].entry.f2);
        expect(null).toBe(testProxy.changes['0_5'].entry.test2_f3);
        expect(null).toBe(testProxy.changes['0_5'].entry.test2_f4);
        expect('change').toBe(testProxy.changes['0_5'].type);
        testProxy.fillDeletion('0_5', "test");
        expect('delete').toBe(testProxy.changes['0_5'].type);
        expect(null).toBe(testProxy.changes['0_5'].entry);

        testProxy.fillDeletion('0_7', 'test2');
        expect(undefined).toBe(testProxy.changes['0_7']);
    });

    it('onEntryChange', function() {
        var testProxy = {
            feedName: 'test'
            , feedFields: {}
            , items:{}
            , keepEntries: {}
            , collectFields: fjs.fdp.model.ProxyModel.prototype.collectFields
            , createChange: fjs.fdp.model.ProxyModel.prototype.createChange
            , fillChange:fjs.fdp.model.ProxyModel.prototype.fillChange
            , fillDeletion:fjs.fdp.model.ProxyModel.prototype.fillDeletion
            , fieldPass:fjs.fdp.model.ProxyModel.prototype.fieldPass
            , prepareEntry:fjs.fdp.model.ProxyModel.prototype.prepareEntry
            , onEntryChange:fjs.fdp.model.ProxyModel.prototype.onEntryChange
        };

        testProxy.onEntryChange({xpid:'0_6', entry:{f1:1, f2:"2", xpid:'0_6', source:'0', xef001id: "6", xef001iver: "4169" }, feed:'test', eventType: "push"});

        expect('0_6').toBe(testProxy.changes['0_6'].xpid);
        expect('change').toBe(testProxy.changes['0_6'].type);

        expect(1).toBe(testProxy.changes['0_6'].entry.f1);
        expect('2').toBe(testProxy.changes['0_6'].entry.f2);

        expect(undefined).toBe(testProxy.changes['0_6'].entry.source);
        expect(undefined).toBe(testProxy.changes['0_6'].entry.xef001id);
        expect(undefined).toBe(testProxy.changes['0_6'].entry.xef001iver);

        expect(1).toBe(testProxy.items['0_6'].f1);
        expect('2').toBe(testProxy.items['0_6'].f2);

        expect('0').toBe(testProxy.items['0_6'].source);
        expect('6').toBe(testProxy.items['0_6'].xef001id);
        expect('4169').toBe(testProxy.items['0_6'].xef001iver);

        testProxy.onEntryChange({xpid:'0_7', entry:{f1:2, f2:"3", xpid:'0_7', source:'0', xef001id: "7", xef001iver: "4167"}, feed:'test', eventType: "push"});
        testProxy.onEntryChange({xpid:'0_7', entry:{f3:1, f4:"2", xpid:'0_7', source:'0', xef001id: "7", xef001iver: "4168"}, feed:'test2', eventType: "push"});
        expect('0_7').toBe(testProxy.changes['0_7'].xpid);
        expect('change').toBe(testProxy.changes['0_7'].type);

        expect(2).toBe(testProxy.changes['0_7'].entry.f1);
        expect('3').toBe(testProxy.changes['0_7'].entry.f2);
        expect(1).toBe(testProxy.changes['0_7'].entry.test2_f3);
        expect('2').toBe(testProxy.changes['0_7'].entry.test2_f4);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.source);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.xef001id);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.xef001iver);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.test2_source);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.test2_xef001id);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.test2_xef001iver);

        expect(2).toBe(testProxy.items['0_7'].f1);
        expect('3').toBe(testProxy.items['0_7'].f2);
        expect(1).toBe(testProxy.items['0_7'].test2_f3);
        expect('2').toBe(testProxy.items['0_7'].test2_f4);
        expect('0').toBe(testProxy.items['0_7'].source);
        expect('7').toBe(testProxy.items['0_7'].xef001id);
        expect('4167').toBe(testProxy.items['0_7'].xef001iver);
        expect('0').toBe(testProxy.items['0_7'].test2_source);
        expect('7').toBe(testProxy.items['0_7'].test2_xef001id);
        expect('4168').toBe(testProxy.items['0_7'].test2_xef001iver);

        testProxy.changes = null;

        testProxy.onEntryChange({xpid:'0_6', entry:{f1:1, f2:"3", xpid:'0_6', source:'0', xef001id: "6", xef001iver: "4179" }, feed:'test', eventType: "push"});

        expect('0_6').toBe(testProxy.changes['0_6'].xpid);
        expect('change').toBe(testProxy.changes['0_6'].type);

        expect(undefined).toBe(testProxy.changes['0_6'].entry.f1);
        expect('3').toBe(testProxy.changes['0_6'].entry.f2);

        expect(undefined).toBe(testProxy.changes['0_6'].entry.source);
        expect(undefined).toBe(testProxy.changes['0_6'].entry.xef001id);
        expect(undefined).toBe(testProxy.changes['0_6'].entry.xef001iver);

        expect(1).toBe(testProxy.items['0_6'].f1);
        expect('3').toBe(testProxy.items['0_6'].f2);

        expect('0').toBe(testProxy.items['0_6'].source);
        expect('6').toBe(testProxy.items['0_6'].xef001id);
        expect('4179').toBe(testProxy.items['0_6'].xef001iver);

        testProxy.changes = null;

        testProxy.onEntryChange({xpid:'0_7', entry:{f3:2, f4:"2", xpid:'0_7', source:'0', xef001id: "7", xef001iver: "4198"}, feed:'test2', eventType: "push"});

        expect('0_7').toBe(testProxy.changes['0_7'].xpid);
        expect('change').toBe(testProxy.changes['0_7'].type);

        expect(undefined).toBe(testProxy.changes['0_7'].entry.f1);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.f2);
        expect(2).toBe(testProxy.changes['0_7'].entry.test2_f3);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.test2_f4);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.source);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.xef001id);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.xef001iver);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.test2_source);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.test2_xef001id);
        expect(undefined).toBe(testProxy.changes['0_7'].entry.test2_xef001iver);

        expect(2).toBe(testProxy.items['0_7'].f1);
        expect('3').toBe(testProxy.items['0_7'].f2);
        expect(2).toBe(testProxy.items['0_7'].test2_f3);
        expect('2').toBe(testProxy.items['0_7'].test2_f4);
        expect('0').toBe(testProxy.items['0_7'].source);
        expect('7').toBe(testProxy.items['0_7'].xef001id);
        expect('4167').toBe(testProxy.items['0_7'].xef001iver);
        expect('0').toBe(testProxy.items['0_7'].test2_source);
        expect('7').toBe(testProxy.items['0_7'].test2_xef001id);
        expect('4198').toBe(testProxy.items['0_7'].test2_xef001iver);
    });

    it('onEntryDeletion', function(){

        var testProxy = {
            feedName: 'test'
            , feedFields: {}
            , items:{}
            , keepEntries: {}
            , collectFields: fjs.fdp.model.ProxyModel.prototype.collectFields
            , createChange: fjs.fdp.model.ProxyModel.prototype.createChange
            , fillChange:fjs.fdp.model.ProxyModel.prototype.fillChange
            , fillDeletion:fjs.fdp.model.ProxyModel.prototype.fillDeletion
            , fieldPass:fjs.fdp.model.ProxyModel.prototype.fieldPass
            , prepareEntry:fjs.fdp.model.ProxyModel.prototype.prepareEntry
            , onEntryChange:fjs.fdp.model.ProxyModel.prototype.onEntryChange
            , onEntryDeletion:fjs.fdp.model.ProxyModel.prototype.onEntryDeletion
        };

        testProxy.onEntryChange({xpid:'0_6', entry:{f1:1, f2:"2", xpid:'0_6', source:'0', xef001id: "6", xef001iver: "4169" }, feed:'test', eventType: "push"});
        testProxy.onEntryChange({xpid:'0_7', entry:{f1:2, f2:"3", xpid:'0_7', source:'0', xef001id: "7", xef001iver: "4167"}, feed:'test', eventType: "push"});
        testProxy.onEntryChange({xpid:'0_7', entry:{f3:1, f4:"2", xpid:'0_7', source:'0', xef001id: "7", xef001iver: "4168"}, feed:'test2', eventType: "push"});


        testProxy.onEntryDeletion({xpid:'0_6', eventType:'delete', feed:'test'});

        expect('delete').toBe(testProxy.changes['0_6'].type);
        expect(null).toBe(testProxy.changes['0_6'].entry);
        expect(undefined).toBe(testProxy.items['0_6']);

        testProxy.onEntryDeletion({xpid:'0_7', feed:'test2', eventType:'delete'});
        expect('change').toBe(testProxy.changes['0_7'].type);
        expect(null).toBe(testProxy.changes['0_7'].entry.test2_f3);
        expect(null).toBe(testProxy.changes['0_7'].entry.test2_f4);
        expect(2).toBe(testProxy.items['0_7'].f1);
        expect('3').toBe(testProxy.items['0_7'].f2);

        testProxy.onEntryDeletion({xpid:'0_7', feed:'test', eventType:'delete'});
        expect('delete').toBe(testProxy.changes['0_7'].type);
        expect(null).toBe(testProxy.changes['0_7'].entry);
        expect(undefined).toBe(testProxy.items['0_7']);
        testProxy.changes=null;

        testProxy.onEntryChange({xpid:'0_8', entry:{f1:2, f2:"3", xpid:'0_8', source:'0', xef001id: "7", xef001iver: "4167"}, feed:'test', eventType: "push"});
        testProxy.onEntryChange({xpid:'0_8', entry:{f3:1, f4:"2", xpid:'0_8', source:'0', xef001id: "7", xef001iver: "4168"}, feed:'test2', eventType: "push"});

        testProxy.onEntryDeletion({xpid:'0_8', feed:'test', eventType:'delete'});
        expect('delete').toBe(testProxy.changes['0_8'].type);
        expect(null).toBe(testProxy.changes['0_8'].entry);
        expect(undefined).toBe(testProxy.items['0_8']);
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

    it('onSourceComplete', function(){
        var testProxy = {
            feedName: 'test'
            , feedFields: {}
            , items:{
                "0_5":{f1:2, f2:'3', xpid:'0_5', source:'0', xef001id: '7', xef001iver: '4167'}
                , "0_6":{f1:2, f2:'3', test2_f3:'4', test2_xpid:'0_6', xpid:'0_6', test2_source:'0', source:'0', test2_xef001id:'6', xef001id: '6', test2_xef001iver: '4167', xef001iver: '4167'}
                , "0_7":{f1:2, f2:'3', xpid:'0_7', source:'0', xef001id: '7', xef001iver: '4167'}
                , "0_8":{f1:2, f2:'3', test2_f3:'6', test2_xpid:'0_8', xpid:'0_8', test2_source:'0', source:'0', test2_xef001id:'8', xef001id: '8', test2_xef001iver: '4167', xef001iver: '4167'}
                , "1_7":{f1:2, f2:'3', xpid:'1_7', source:'1', xef001id: '7', xef001iver: '4167'}
            }
            , keepEntries: {"0_7":{}, "0_8":{}}
            , createChange: fjs.fdp.model.ProxyModel.prototype.createChange
            , fillDeletion:fjs.fdp.model.ProxyModel.prototype.fillDeletion
            , onEntryDeletion:fjs.fdp.model.ProxyModel.prototype.onEntryDeletion
            , onSourceComplete:fjs.fdp.model.ProxyModel.prototype.onSourceComplete
        };

        testProxy.onSourceComplete({'feed':'test', syncType:fjs.fdp.SyncManager.syncTypes.FULL, sourceId:'0'});
        expect(undefined).toBe(testProxy.items['0_5']);
        expect(undefined).toBe(testProxy.items['0_6']);
        expect(true).toBe(!!testProxy.items['0_7']);
        expect(true).toBe(!!testProxy.items['0_8']);
        expect(true).toBe(!!testProxy.items['1_7']);

        expect('delete').toBe(testProxy.changes['0_5'].type);
        expect('delete').toBe(testProxy.changes['0_6'].type);

        testProxy.changes = null;

        testProxy.keepEntries = {"0_7":{}}

        testProxy.onSourceComplete({'feed':'test2', syncType:fjs.fdp.SyncManager.syncTypes.FULL, sourceId:'0'});

        expect(true).toBe(!!testProxy.items['0_7']);
        expect(true).toBe(!!testProxy.items['0_8']);
        expect(true).toBe(!!testProxy.items['1_7']);

        expect('change').toBe(testProxy.changes['0_8'].type);

    });

    it('onSyncComplete', function(){
        var syncFired = false;
        var testProxy = {
            feedName:'test'
            , fireEvent: function(e) {
                expect('test').toBe(e.feed);
                expect(true).toBe(!!e.changes);
                syncFired = true;
            }
            , onSyncComplete: fjs.fdp.model.ProxyModel.prototype.onSyncComplete
        };

        testProxy.onSyncComplete();
        expect(false).toBe(syncFired);
        testProxy.changes={"0_1":{f2:3}};
        testProxy.onSyncComplete();
        expect(true).toBe(syncFired);
    });

    it('onSyncEvent', function(){
        var changeCalled, deletionCalled, keepCalled, sourceCompleteCalled, syncCompleteCalled;
        var testProxy = {
            onSyncEvent:fjs.fdp.model.ProxyModel.prototype.onSyncEvent
            , onEntryChange:function(event){changeCalled = event.eventType == fjs.fdp.SyncManager.eventTypes.ENTRY_CHANGE}
            , onEntryDeletion: function(event){deletionCalled = event.eventType == fjs.fdp.SyncManager.eventTypes.ENTRY_DELETION}
            , onEntryKeep: function(event){keepCalled = event.eventType == fjs.fdp.SyncManager.eventTypes.ENTRY_KEEP}
            , onSourceComplete: function(event){sourceCompleteCalled= event.eventType == fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE}
            , onSyncComplete:function(event){syncCompleteCalled = event.eventType == fjs.fdp.SyncManager.eventTypes.SYNC_COMPLETE}
        };
        testProxy.onSyncEvent({eventType:fjs.fdp.SyncManager.eventTypes.ENTRY_CHANGE});
        expect(true).toBe(changeCalled);
        testProxy.onSyncEvent({eventType:fjs.fdp.SyncManager.eventTypes.ENTRY_DELETION});
        expect(true).toBe(deletionCalled);
        testProxy.onSyncEvent({eventType:fjs.fdp.SyncManager.eventTypes.ENTRY_KEEP});
        expect(true).toBe(keepCalled);
        testProxy.onSyncEvent({eventType:fjs.fdp.SyncManager.eventTypes.SOURCE_COMPLETE});
        expect(true).toBe(sourceCompleteCalled);
        testProxy.onSyncEvent({eventType:fjs.fdp.SyncManager.eventTypes.SYNC_COMPLETE});
        expect(true).toBe(syncCompleteCalled);
    });

    it("fullTest", function(){

        var TestSyncManager = function() {
            fjs.EventsSource.call(this);
        };

        TestSyncManager.extend(fjs.EventsSource);

        TestSyncManager.prototype.addFeedListener = function(feedName, handler) {
            this.superClass.addEventListener.call(this, feedName, handler)
        };
        TestSyncManager.prototype.removeFeedListener = function(feedName, handler) {
            this.superClass.removeEventListener.call(this, feedName, handler)
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

        var proxyModel = new fjs.fdp.model.ProxyModel(['test', 'test2', 'test3'], sm);

        var syncHandler1 = function(syncEvent) {};
        proxyModel.addListener(syncHandler1);
        expect(1).toBe(sm.listeners['test'].length);
        expect(1).toBe(sm.listeners['test2'].length);
        expect(1).toBe(sm.listeners['test3'].length);
        expect(true).toBe(proxyModel._attached);
        expect(1).toBe(proxyModel.listeners.length);
        proxyModel.removeListener(syncHandler1);

        expect(0).toBe(sm.listeners['test'].length);
        expect(0).toBe(sm.listeners['test2'].length);
        expect(0).toBe(sm.listeners['test3'].length);
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

            expect('test').toBe(sync.feed);
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

            expect('test').toBe(sync.feed);
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

        expect('test').toBe(sync.feed);
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