describe("ajaxTransport", function () {
    it("wrongAuthTicket", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.TestAjaxTransport("notValidTicket", null, 'http://localhost:99');
        var errorType = null;
        runs(function () {
            transport.addEventListener('error', function(e){
                errorType = e.type;
                doneFlag = true;
            });
            transport.addEventListener('message', function(e) {
            });
            transport.send({type:'synchronize', data:{versions:{test_feed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect('auth').toBe(errorType);
        });
    });

    it("errorAuthTicket", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.TestAjaxTransport("error", null, 'http://localhost:99');
        var errorType = null;
        runs(function () {
            transport.addEventListener('error', function(e){
                errorType = e.type;
                doneFlag = true;
            });
            transport.addEventListener('message', function(e) {
            });
            transport.send({type:'synchronize', data:{versions:{test_feed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect('requestError').toBe(errorType);
        });
    });

    it("getNode", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.TestAjaxTransport("validTicket", null, 'http://localhost:99');
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
            transport.send({type:'synchronize', data:{versions:{test_feed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect(null).toBe(errorType);
            expect('node').toBe(node);
        });
    });


    it("getNode", function () {
        var doneFlag = false;
        var transport = new fjs.fdp.TestAjaxTransport("validTicket", null, 'http://localhost:99');
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
            transport.send({type:'synchronize', data:{versions:{test_feed:null}}});
        });
        waitsFor(function () {
            return doneFlag;
        }, "Flag should be set", 5000);
        runs(function () {
            expect(true).toBe(doneFlag);
            expect(null).toBe(errorType);
            expect('node').toBe(node);
        });
    });
});