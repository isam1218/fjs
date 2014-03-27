describe("clientProxyModelTest.js", function () {
    var clientProxy;
    it("createSyncData", function () {
        clientProxy = new fjs.fdp.ClientProxyModel(["tesClientFeed"]);;
        var syncObj = clientProxy.createSyncData("push", {field1:1, field2:"2"});
        expect('{"tesClientFeed":{"":{"items":[{"field1":1,"field2":"2","xef001type":"push"}]}}}').toBe(fjs.utils.JSON.stringify(syncObj));
        syncObj = clientProxy.createSyncData("delete", {xpid:1});
        expect('{"tesClientFeed":{"":{"items":[{"xpid":1,"xef001type":"delete"}]}}}').toBe(fjs.utils.JSON.stringify(syncObj));
    });
    it("sendActionPush", function(){
        var doneFlag, entry, newEntryId = "1", changeType;
        runs(function () {
            clientProxy.addListener(function (e) {
                entry = e.changes[newEntryId].entry;
                changeType = e.changes[newEntryId].type;
                doneFlag = true;
            });
            clientProxy.sendAction("tesClientFeed", "push", {field1: 1, field2: "2", xpid: newEntryId});
        });

        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);

        runs(function () {
            expect("1").toBe(entry.xpid);
            expect(1).toBe(entry.field1);
            expect("2").toBe(entry.field2);
            expect("change").toBe(changeType);
        });
    });
    it("sendActionDelete", function(){
        var doneFlag, change, newEntryId = "1";
        runs(function () {
            clientProxy.addListener(function (e) {
                change = e.changes[newEntryId];
                doneFlag = true;
            });
            clientProxy.sendAction("tesClientFeed", "delete", {xpid: newEntryId});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect("1").toBe(change.xpid);
            expect("delete").toBe(change.type);
        });
    });
});

