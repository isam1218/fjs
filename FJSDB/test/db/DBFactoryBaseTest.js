describe("DBFactory", function() {
    var confDB = {
        dbProviders:['testProvider1', 'testProvider2', 'testProvider3']
    };

    var  testProvider1 = function() {
    };
    testProvider1.check = function(){return false && !testProvider2.failed};
    testProvider1.prototype.open = function(config, callback) {
        testProvider2.failed = true;
        callback(null);
    };

    var  testProvider2 = function() {
    };
    testProvider2.failed = false;
    testProvider2.check = function(){return true && !testProvider2.failed};
    testProvider2.prototype.open = function(config, callback) {
        setTimeout(function(){
            testProvider2.failed = true;
            callback(null)
        },0);
    };

    var  testProvider3 = function() {
        this.state = -1;
    };
    testProvider3.failed = false;
    testProvider3.check = function(){return true && !testProvider3.failed};
    testProvider3.prototype.open = function(config, callback) {
        this.state = 0;
        var context = this;
        setTimeout(function(){
            context.state = 1;
            callback(context);
        },0);
    };

    it("getDB", function() {
        var db = null, doneFlag;
        var dbFactory = new fjs.db.DBFactory(confDB);
        dbFactory._dbRegister = {
            'testProvider1':testProvider1, 'testProvider2':testProvider2, 'testProvider3':testProvider3
        };
        runs(function(){
            dbFactory.getDB(function(_db){
                db = _db;
                doneFlag = true;

            });
        });
        waitsFor(function() {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function(){
            expect(1).toBe(db.state);
        });
    });
});
