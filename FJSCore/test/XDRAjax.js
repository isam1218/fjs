describe("XDRAjax", function () {
    if(self["XDomainRequest"]) {
        it("200GETrequest", function () {
            var ajax = new fjs.ajax.XDRAjax(), status, _isOk, doneFlag, response;
            runs(function () {
                ajax.send('get', 'http://localhost:99/testRequest', null, null, function (xhr, responseText, isOk) {
                    status = xhr.status;
                    _isOk = isOk;
                    response = responseText;
                    doneFlag = true;
                });
            });
            waitsFor(function () {
                return doneFlag;
            }, "Flag should be set", 5000);
            runs(function () {
                expect(true).toBe(doneFlag);
                expect(200).toBe(status);
                expect(true).toBe(_isOk);
                expect('{"a":"a","b":2,"c":[123],"d":null}').toBe(response);
            });
        });

        it("200POSTrequest", function () {
            var ajax = new fjs.ajax.XDRAjax(), status, _isOk, doneFlag, response;
            runs(function () {
                ajax.send('post', 'http://localhost:99/testRequest', null, null, function (xhr, responseText, isOk) {
                    status = xhr.status;
                    _isOk = isOk;
                    response = responseText;
                    doneFlag = true;
                });
            });
            waitsFor(function () {
                return doneFlag;
            }, "Flag should be set", 5000);
            runs(function () {
                expect(true).toBe(doneFlag);
                expect(200).toBe(status);
                expect(true).toBe(_isOk);
                expect('{"a":"a","b":2,"c":[123],"d":null}').toBe(response);
            });
        });

        it("404GETrequest", function () {
            var ajax = new fjs.ajax.XDRAjax(), status, _isOk, doneFlag;
            runs(function () {
                ajax.send('get', 'http://localhost:99/test404', null, null, function (xhr, responseText, isOk) {
                    _isOk = isOk;
                    doneFlag = true;
                });
            });
            waitsFor(function () {
                return doneFlag;
            }, "Flag should be set", 5000);
            runs(function () {
                expect(true).toBe(doneFlag);
                expect(false).toBe(_isOk);
            });
        });
        it("404POSTrequest", function () {
            var ajax = new fjs.ajax.XDRAjax(), status, _isOk, doneFlag;
            runs(function () {
                ajax.send('post', 'http://localhost:99/test404', null, null, function (xhr, responseText, isOk) {
                    _isOk = isOk;
                    doneFlag = true;
                });
            });
            waitsFor(function () {
                return doneFlag;
            }, "Flag should be set", 5000);
            runs(function () {
                expect(true).toBe(doneFlag);
                expect(false).toBe(_isOk);
            });
        });
    }
});