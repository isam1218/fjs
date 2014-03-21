describe("cookies", function () {
    it("get/set", function () {
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
    })
});