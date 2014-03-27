describe("XHRTransport.js", function () {
    it("wrongAuthTicket", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.XHRTransport("notValidTicket", null, 'http://localhost:99');
        var errorType = null;
        runs(function () {
            transport.addEventListener('error', function(e){
                errorType = e.type;
                doneFlag = true;
            });
            transport.addEventListener('message', function(e) {
            });
            transport.send({type:'synchronize', data:{versions:{testFeed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect('authError').toBe(errorType);
            transport.close()
        });
    });

    it("errorAuthTicket", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.XHRTransport("error", null, 'http://localhost:99');
        var errorType = null;
        runs(function () {
            transport.addEventListener('error', function(e){
                errorType = e.type;
                doneFlag = true;
            });
            transport.addEventListener('message', function(e) {
            });
            transport.send({type:'synchronize', data:{versions:{testFeed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect('requestError').toBe(errorType);
            transport.close()
        });
    });

    it("getNode", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.XHRTransport(fjs.test.Tickets.get(), null, 'http://localhost:99');
        var errorType = null;
        var node = null
        runs(function () {
            transport.addEventListener('error', function(e){
                errorType = e.type;
            });
            transport.addEventListener('message', function(e) {
                if(e.data.nodeId) {
                    doneFlag = true;
                    node = e.data.nodeId;
                }
            });
            transport.send({type:'synchronize', data:{versions:{testFeed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect(null).toBe(errorType);
            expect('node').toBe(node);
            transport.close()
        });
    });


    it("FirsSync", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.XHRTransport(fjs.test.Tickets.get(), "node", 'http://localhost:99');
        var errorType = null;
        var messageType = null;
        var data = null;
        runs(function () {
            transport.addEventListener('error', function(e){
                errorType = e.type;
            });
            transport.addEventListener('message', function(e) {
                messageType = e.type;
                data = fjs.utils.JSON.parse(e.data);
                doneFlag = true;
            });
            transport.send({type:'synchronize', data:{versions:{testFeed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect(null).toBe(errorType);
            expect('sync').toBe(messageType);
            expect(true).toBe(!!data.testFeed);
            expect(2).toBe(data.testFeed["0"].items.length);
            expect("F").toBe(data.testFeed["0"]["xef001type"]);
            expect("qwe").toBe(data.testFeed["0"].items[0].field2);
            transport.close()
        });
    });
    it("newEntry", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.XHRTransport(fjs.test.Tickets.get(), "node", 'http://localhost:99');
        var errorType = null;
        var messageType = null;
        var data = null;
        runs(function () {
            transport.addEventListener('error', function(e){
                errorType = e.type;
            });
            transport.addEventListener('message', function(e) {
                data = fjs.utils.JSON.parse(e.data);
                if(data.testFeed.full) {
                    transport.sendAction("testFeed", "create", {field1:0, field2:"zero"});
                }
                else {
                    messageType = e.type;
                    doneFlag = true;
                }
            });
            transport.send({type:'synchronize', data:{versions:{testFeed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect(null).toBe(errorType);
            expect('sync').toBe(messageType);
            expect(true).toBe(!!data.testFeed);
            expect(1).toBe(data.testFeed["0"].items.length);
            expect("L").toBe(data.testFeed["0"]["xef001type"]);
            expect(0).toBe(data.testFeed["0"].items[0].field1);
            expect("zero").toBe(data.testFeed["0"].items[0].field2);
            transport.close();
        });
    });
    it("deleteEntry", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.XHRTransport(fjs.test.Tickets.get(), "node", 'http://localhost:99');
        var errorType = null;
        var messageType = null;
        var data = null;
        runs(function () {
            transport.addEventListener('error', function(e){
                errorType = e.type;
            });
            transport.addEventListener('message', function(e) {
                data = fjs.utils.JSON.parse(e.data);
                if(data.testFeed.full) {
                    transport.sendAction("testFeed", "delete", {pid:"0_"+data.testFeed["0"].items[0].xef001id});
                }
                else {
                    messageType = e.type;
                    doneFlag = true;
                }
            });
            transport.send({type:'synchronize', data:{versions:{testFeed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect(null).toBe(errorType);
            expect('sync').toBe(messageType);
            expect(true).toBe(!!data.testFeed);
            expect(1).toBe(data.testFeed["0"].items.length);
            expect("L").toBe(data.testFeed["0"]["xef001type"]);
            expect("delete").toBe(data.testFeed["0"].items[0].xef001type);
            transport.close();
        });
    });
    it("updateEntry", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.XHRTransport(fjs.test.Tickets.get(), "node", 'http://localhost:99');
        var errorType = null;
        var messageType = null;
        var data = null;
        var changedPid = null;
        runs(function () {
            transport.addEventListener('error', function(e){
                errorType = e.type;
            });
            transport.addEventListener('message', function(e) {
                data = fjs.utils.JSON.parse(e.data);
                if(data.testFeed.full) {
                    changedPid = data.testFeed["0"].items[0].xef001id;
                    transport.sendAction("testFeed", "update", {field1:0, field2:"zero", pid:"0_"+data.testFeed["0"].items[0].xef001id});
                }
                else {
                    messageType = e.type;
                    doneFlag = true;
                }
            });
            transport.send({type:'synchronize', data:{versions:{testFeed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect(null).toBe(errorType);
            expect('sync').toBe(messageType);
            expect(true).toBe(!!data.testFeed);
            expect(1).toBe(data.testFeed["0"].items.length);
            expect("L").toBe(data.testFeed["0"]["xef001type"]);
            expect(0).toBe(data.testFeed["0"].items[0].field1);
            expect("zero").toBe(data.testFeed["0"].items[0].field2);
            expect(changedPid).toBe(data.testFeed["0"].items[0].xef001id);
            transport.close();
        });
    });
});