describe("SyncManager", function() {
    var testConfig = {
        SERVER: {
            serverURL: ""
            , loginURL: ""
        }
        , DB: {
            name: "testDB"
            , version: 3
            /**
             * @type {Array}
             */
            , tables: [
                {name:"versions", key:"feedSource", indexes:["source", "feedName"]}
                , {name:"historyversions", key:"feedSourceFilter", indexes:["source", "feedName", "filter",["feedName", "filter"]]}
                , {name:"testFeed", key: "xpid", indexes:["source"]}
            ]
        }
    };

    var sm = new fjs.fdp.SyncManager(new fjs.db.IndexedDBProvider(window), new fjs.ajax.TestAjaxProvider(), testConfig);

    it("parseFdpData", function() {
        var data = "Success\n"
            + "DB =1_1\n"
            + "node = node2\n"
            + "db_version=3\n"
            + "runtime_version= 4\n"
            + "it= 7\n"
            + "build= 3.7.0.0\n";
        var _data = sm.parseFdpData(data);
        expect('1_1').toBe(_data['DB']);
        expect('node2').toBe(_data['node']);
        expect('3').toBe(_data['db_version']);
        expect('4').toBe(_data['runtime_version']);
        expect('7').toBe(_data['it']);
        expect('3.7.0.0').toBe(_data['build']);
    });

    it("parseVersionsResponse", function(){
       var data1 = "1388142757416;4161404170;testFeed1;testFeed2;testFeed3;;db3a5185ec22e4f3aebdc8c38ffd84efabaf4f76e5639da31394";
       var _data1 = sm.parseVersionsResponse(data1);
       expect('').toBe(_data1['testFeed1']);
       expect('').toBe(_data1['testFeed2']);
       expect('').toBe(_data1['testFeed3']);
        var data2 = "1388142757416;4161404170;;db3a5185ec22e4f3aebdc8c38ffd84efabaf4f76e5639da31394";
        var _data2 = sm.parseVersionsResponse(data2);
        expect(null).toBe(_data2);
    });

    it("getAuthTicket", function(){
        var doneFlag = false;
        sm.authHandler = {
            requestAuth:function(){
                doneFlag = true;
            }
            , setNode:function(node) {

            }
        };
        sm.getAuthTicket();

        expect(true).toBe(doneFlag);

    });

    it("init/badAuth", function() {

        var doneFlag = false;

        fjs.fdp.SyncManager.__instance = null;
        sm = new fjs.fdp.SyncManager(null, new fjs.ajax.TestAjaxProvider(), testConfig);
        runs(function(){
            var authHandler = {
                requestAuth:function(){
                    doneFlag = true;
                }
                , setNode:function(node) {

                }
            };
            sm.init("", null, authHandler, function(){

            });
        });
        waitsFor(function() {
            return doneFlag;
        }, "Flag should be set", 2000);
        runs(function(){
            expect(true).toBe(doneFlag);
        });
    });

    it("init/errorAuth", function() {
        var doneFlag = false;
        fjs.fdp.SyncManager.__instance = null;
        sm = new fjs.fdp.SyncManager(null, new fjs.ajax.TestAjaxProvider(), testConfig);
        runs(function(){
            var authHandler = {
                requestAuth:function(){
                    doneFlag = true;
                }
                , setNode:function(node) {

                }
            };
            sm.init("error", null, authHandler, function(){

            });
        });
        waitsFor(function() {
            return doneFlag;
        }, "Flag should be set", 2000);
        runs(function(){
            expect(true).toBe(doneFlag);
        });
    });
    it("init/validAuth", function() {
        var doneFlag = false, node;
        fjs.fdp.SyncManager.__instance = null;
        sm = new fjs.fdp.SyncManager(null, new fjs.ajax.TestAjaxProvider(), testConfig);
        runs(function(){
            var authHandler = {
                requestAuth:function(){

                }
                , setNode:function(_node) {
                    node = _node;
                }
            };
            sm.init("validTicket", null, authHandler, function(){
                doneFlag = true;
            });
        });
        waitsFor(function() {
            return doneFlag;
        }, "Flag should be set", 10000);
        runs(function(){
            expect(true).toBe(doneFlag);
            expect("node").toBe(node);
        });
    });

});