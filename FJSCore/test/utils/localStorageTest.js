describe("localStorage", function () {
    it("set", function () {
        fjs.utils.LocalStorage.set('testF1', 'test');
        expect('test').toBe(localStorage['testF1']);
        fjs.utils.LocalStorage.set('testF1', 1);
        expect('1').toBe(localStorage['testF1']);
        fjs.utils.LocalStorage.set('testF2', 2);
        expect('1').toBe(localStorage['testF1']);
        expect('2').toBe(localStorage['testF2']);
    });

    it("get", function() {
        fjs.utils.LocalStorage.set('testF1', 'test');
        expect('test').toBe(fjs.utils.LocalStorage.get('testF1'));
        fjs.utils.LocalStorage.set('testF1', 1);
        expect('1').toBe(fjs.utils.LocalStorage.get('testF1'));
        fjs.utils.LocalStorage.set('testF1', {a:1});
        expect('[object Object]').toBe(fjs.utils.LocalStorage.get('testF1'));
    });

    it("remove", function(){
        fjs.utils.LocalStorage.set('testF1', 'test');
        expect('test').toBe(fjs.utils.LocalStorage.get('testF1'));
        fjs.utils.LocalStorage.remove('testF1');
        expect(null).toBe(fjs.utils.LocalStorage.get('testF1'));
    });

    it("check", function() {
        expect(true).toBe(fjs.utils.LocalStorage.check());
    });
});