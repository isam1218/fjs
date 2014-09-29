describe("cookies", function () {
    it("set", function () {
        fjs.utils.Cookies.set('testF1', 'test');
        expect(true).toBe(/testF1=test/.test(document.cookie));
        fjs.utils.Cookies.set('testF1', 1);
        expect(false).toBe(/testF1=test/.test(document.cookie));
        expect(true).toBe(/testF1=1/.test(document.cookie));
        fjs.utils.Cookies.set('testF2', 2);
        expect(true).toBe(/testF2=2/.test(document.cookie));
        expect(true).toBe(/testF1=1/.test(document.cookie));
    });

    it("get", function() {
        fjs.utils.Cookies.set('testF1', 'test');
        expect('test').toBe(fjs.utils.Cookies.get('testF1'));
        fjs.utils.Cookies.set('testF1', 1);
        expect('1').toBe(fjs.utils.Cookies.get('testF1'));
        fjs.utils.Cookies.set('testF1', {a:1});
        expect('[object Object]').toBe(fjs.utils.Cookies.get('testF1'));
    });

    it("remove", function(){
        fjs.utils.Cookies.set('testF1', 'test');
        expect('test').toBe(fjs.utils.Cookies.get('testF1'));
        fjs.utils.Cookies.remove('testF1');
        expect(undefined).toBe(fjs.utils.Cookies.get('testF1'));
    });

    it("check", function() {
        expect(true).toBe(fjs.utils.Cookies.check());
    });
});