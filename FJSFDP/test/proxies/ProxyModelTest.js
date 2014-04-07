describe("ProxyModelTest", function () {
    var proxyModel1, doneFlag, data ;
    it("addListener", function () {
        var listener = function (e) {
            data = e;
            doneFlag = true;
        };
        runs(function () {

            proxyModel1 = new fjs.fdp.model.ProxyModel(["testFakeModel"]);
            proxyModel1.addListener(listener);
            proxyModel1.fireEvent({field1: 1, xpid: '1'});
        });

        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);

        runs(function(){
            expect(1).toBe(data.field1);
            expect('1').toBe(data.xpid);
            proxyModel1.removeListener(listener);
        });
    });

    it("removeListener", function () {
        var doneFlag, timeoutId;
        runs(function () {
            proxyModel1 = new fjs.fdp.model.ProxyModel(["testFakeModel"]);
            var callbackFn = function(){
                clearTimeout(timeoutId);
            }
            proxyModel1.addListener(callbackFn);
            proxyModel1.removeListener(callbackFn);

            timeoutId = setTimeout(function(){
                doneFlag = true;
            },500);

            proxyModel1.fireEvent({field1: 1, xpid: '1'});
        });

        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);

        runs(function(){
            expect(true).toBe(doneFlag);
        });
    });

    it('createChange', function(){
        var changeObject = proxyModel1.createChange('123_123');
        expect('{"xpid":"123_123","entry":{}}').toBe(fjs.utils.JSON.stringify(changeObject));
        expect('{"xpid":"123_123","entry":{}}').toBe(fjs.utils.JSON.stringify(proxyModel1.changes['123_123']));
        expect('123_123').toBe(proxyModel1.changes['123_123'].xpid);
        proxyModel1.changes = {};
    });

    it('createFullChange', function(){
        expect(null).toBe(proxyModel1.createFullChange());
        proxyModel1.items = {'2':{field1:4, field2:'3'}, '3':{field1:6, field2:'4'}};
        var changes = proxyModel1.createFullChange();
        expect('2').toBe(changes['2'].xpid);
        expect('change').toBe(changes['2'].type);
        expect(4).toBe(changes['2'].entry.field1);
        expect('3').toBe(changes['2'].entry.field2);

        expect('3').toBe(changes['3'].xpid);
        expect('change').toBe(changes['3'].type);
        expect(6).toBe(changes['3'].entry.field1);
        expect('4').toBe(changes['3'].entry.field2);
        proxyModel1.items = {};
    });

    it('fillChange', function() {
        proxyModel1.fillChange('4', {field1:5, field2:'2', xpid:'4'}, "testFakeModel");
        proxyModel1.fillChange('5', {field1:7, field2:'5', xpid:'5'}, "testFakeModel");
        proxyModel1.fillChange('5', {testFakeModel2_field3:9, testFakeModel2_field4:'7', xpid:'5'}, "testFakeModel2");
        expect('4').toBe(proxyModel1.changes['4'].xpid);
        expect('5').toBe(proxyModel1.changes['5'].xpid);
        expect('change').toBe(proxyModel1.changes['4'].type);
        expect('change').toBe(proxyModel1.changes['5'].type);

        expect(5).toBe(proxyModel1.changes['4'].entry.field1);
        expect('2').toBe(proxyModel1.changes['4'].entry.field2);
        expect(7).toBe(proxyModel1.changes['5'].entry.field1);
        expect('5').toBe(proxyModel1.changes['5'].entry.field2);
        expect(9).toBe(proxyModel1.changes['5'].entry.testFakeModel2_field3);
        expect('7').toBe(proxyModel1.changes['5'].entry.testFakeModel2_field4);
    });

    it('fillDeletion', function(){
        proxyModel1.fillDeletion('4', "testFakeModel");
        expect('delete').toBe(proxyModel1.changes['4'].type);
        expect(null).toBe(proxyModel1.changes['4'].entry);

        proxyModel1.fillDeletion('5', "testFakeModel2");
        expect(7).toBe(proxyModel1.changes['5'].entry.field1);
        expect('5').toBe(proxyModel1.changes['5'].entry.field2);
        expect(null).toBe(proxyModel1.changes['5'].entry.testFakeModel2_field3);
        expect(null).toBe(proxyModel1.changes['5'].entry.testFakeModel2_field4);
        expect('change').toBe(proxyModel1.changes['5'].type);
        proxyModel1.fillDeletion('5', "testFakeModel");
        expect('delete').toBe(proxyModel1.changes['5'].type);
        expect(null).toBe(proxyModel1.changes['5'].entry);
        proxyModel1.changes = {};
    });

    it('onEntryChange', function(){
        proxyModel1.onEntryChange({xpid:'6', entry:{field1:1, field2:"2", xpid:'6'}, feed:'testFakeModel'});
        expect('6').toBe(proxyModel1.changes['6'].xpid);
        expect('change').toBe(proxyModel1.changes['6'].type);
        expect(1).toBe(proxyModel1.changes['6'].entry.field1);
        expect('2').toBe(proxyModel1.changes['6'].entry.field2);
        expect(1).toBe(proxyModel1.items['6'].field1);
        expect('2').toBe(proxyModel1.items['6'].field2);
        proxyModel1.onEntryChange({xpid:'7', entry:{field1:1, field2:"2", xpid:'7'}, feed:'testFakeModel'});
        proxyModel1.onEntryChange({xpid:'7', entry:{field3:1, field4:"2", xpid:'7'}, feed:'testFakeModel2'});
        expect('7').toBe(proxyModel1.changes['7'].xpid);
        expect('change').toBe(proxyModel1.changes['7'].type);

        expect(1).toBe(proxyModel1.changes['7'].entry.field1);
        expect('2').toBe(proxyModel1.changes['7'].entry.field2);
        expect(1).toBe(proxyModel1.changes['7'].entry.testFakeModel2_field3);
        expect('2').toBe(proxyModel1.changes['7'].entry.testFakeModel2_field4);

        expect(1).toBe(proxyModel1.items['7'].field1);
        expect('2').toBe(proxyModel1.items['7'].field2);
        expect(1).toBe(proxyModel1.items['7'].testFakeModel2_field3);
        expect('2').toBe(proxyModel1.items['7'].testFakeModel2_field4);

    });

    it('onEntryDeletion', function(){
        proxyModel1.onEntryDeletion({xpid:'6', feed:'testFakeModel'});
        expect('delete').toBe(proxyModel1.changes['6'].type);
        expect(null).toBe(proxyModel1.changes['6'].entry);
        expect(undefined).toBe(proxyModel1.items['6']);
        proxyModel1.onEntryDeletion({xpid:'7', feed:'testFakeModel2'});
        expect('change').toBe(proxyModel1.changes['7'].type);
        expect(null).toBe(proxyModel1.changes['7'].entry.testFakeModel2_field3);
        expect(null).toBe(proxyModel1.changes['7'].entry.testFakeModel2_field4);
        expect(1).toBe(proxyModel1.items['7'].field1);
        proxyModel1.onEntryDeletion({xpid:'7', feed:'testFakeModel'});
        expect('delete').toBe(proxyModel1.changes['7'].type);
        expect(null).toBe(proxyModel1.changes['7'].entry);
        expect(undefined).toBe(proxyModel1.items['7']);
        proxyModel1.changes={};
        proxyModel1.items = {};
    });

    it('onSyncEvent', function(){
        var doneFlag, changeEvent;
        runs(function(){

            proxyModel1.addListener(function(e){
                changeEvent = e;
                doneFlag = true;
            });
            proxyModel1.onSyncEvent({eventType:'syncStart'});
            proxyModel1.onSyncEvent({eventType:'feedStart'});
            proxyModel1.onSyncEvent({eventType:'sourceStart'});
            proxyModel1.onSyncEvent({eventType:'push', xpid:'10', entry:{field3:3, field4:"4", xpid:'10'}, feed:'testFakeModel1'});
            proxyModel1.onSyncEvent({eventType:'sourceComplete'});
            proxyModel1.onSyncEvent({eventType:'feedComplete'});
            proxyModel1.onSyncEvent({eventType:'feedStart'});
            proxyModel1.onSyncEvent({eventType:'sourceStart'});
            proxyModel1.onSyncEvent({eventType:'push', xpid:'9', entry:{field1:1, field2:"2", xpid:'9'}, feed:'testFakeModel'});
            proxyModel1.onSyncEvent({eventType:'sourceComplete'});
            proxyModel1.onSyncEvent({eventType:'sourceStart'});
            proxyModel1.onSyncEvent({eventType:'push', xpid:'10', entry:{field1:5, field2:"6", xpid:'10'}, feed:'testFakeModel'});
            proxyModel1.onSyncEvent({eventType:'sourceComplete'});
            proxyModel1.onSyncEvent({eventType:'feedComplete'});
            proxyModel1.onSyncEvent({eventType:'syncComplete'});

        });

        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);

        runs(function() {
            expect("testFakeModel").toBe(changeEvent.feed);
            expect("change").toBe(changeEvent.changes['9'].type);
            expect("change").toBe(changeEvent.changes['10'].type);
            expect("10").toBe(changeEvent.changes['10'].xpid);
            expect("9").toBe(changeEvent.changes['9'].xpid);
            expect(1).toBe(changeEvent.changes['9'].entry.field1);
            expect('2').toBe(changeEvent.changes['9'].entry.field2);
            expect(5).toBe(changeEvent.changes['10'].entry.field1);
            expect("6").toBe(changeEvent.changes['10'].entry.field2);
            expect(3).toBe(changeEvent.changes['10'].entry.testFakeModel1_field3);
            expect('4').toBe(changeEvent.changes['10'].entry.testFakeModel1_field4);
        });

    });

});