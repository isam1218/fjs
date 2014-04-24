describe("syncManager", function () {
    var sm;
    it("initialization", function(){
        var doneFlag = false;
        runs(function () {
            sm = new fjs.fdp.SyncManager(CONFIG);
            sm.init(fjs.test.Tickets.get()+"1", null, function () {
                doneFlag = true;
            });
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
        });
    });

    it("startSyncronization", function(){
        var doneFlag = false, db, entry;

        runs(function () {
            db = sm.db;
            sm.db = null;
            sm.addFeedListener("testFeed", function(e){
                if(e.eventType=="push") {
                    entry = e.entry;
                    doneFlag = true;
                }
            });
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect(5).toBe(entry.field1);
            expect("asd").toBe(entry.field2);
            sm.db = db;
        });
    });

    it("addAction", function(){
        var doneFlag = false, db, entry;

        runs(function () {
            db = sm.db;
            sm.db = null;
            sm.addFeedListener("testFeed", function(e){
                if(e.eventType=="push") {
                    entry = e.entry;
                    doneFlag = true;
                }
            });
            sm.sendAction("testFeed", "create", {field1:0, field2:"zero"});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect(0).toBe(entry.field1);
            expect("zero").toBe(entry.field2);
            sm.db = db;
        });
    }) ;

    it("deleteAction", function(){
        var doneFlag = false, db, entry;

        runs(function () {
            db = sm.db;
            sm.db = null;
            sm.addFeedListener("testFeed", function(e){
                if(e.eventType=="delete") {
                    entry = e.entry;
                    doneFlag = true;
                }
            });
            sm.sendAction("testFeed", "delete", {pid:'0_1'});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect('0_1').toBe(entry.xpid);
            sm.db = db;
        });
    }) ;

});