describe("AjaxProviderBase", function () {
    it("getParamData", function () {
        var ajax = new fjs.ajax.AjaxProviderBase();
        expect('a=1&b=2').toBe(ajax.getParamData({a:1,b:2}));
        expect('a=1&b=2').toBe(ajax.getParamData({a:"1",b:2}));
        expect('a=1&b=asd&c=123').toBe(ajax.getParamData({'a':1,'b':'asd','c':'123'}));
    });
});