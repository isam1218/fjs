describe("JSONUtils", function() {
    it("check", function () {
        expect(true).toBe(fjs.utils.JSON.check('{"a":2,"b":[]}'));
        expect(true).toBe(fjs.utils.JSON.check('{a:2,b:[],c:"123"}'));
        expect(false).toBe(fjs.utils.JSON.check('{a:2,b:[],c:"123",g}'));
        expect(false).toBe(fjs.utils.JSON.check('{a:2,b:[],c:"123",{}}'));
        expect(false).toBe(fjs.utils.JSON.check('{a:2,b:{[]},c:"123"}'));
        expect(false).toBe(fjs.utils.JSON.check('{a:2,b:{},c:f}'));
    });
    it("parse", function () {
        var obj1 = fjs.utils.JSON.parse('{"a":2}');
        expect(2).toBe(obj1.a);
        var obj2 = fjs.utils.JSON.parse('{a:{e:null},b:[],c:"123"}');
        expect(null).toBe(obj2.a.e);
        expect(0).toBe(obj2.b.length);
        expect("123").toBe(obj2.c);
    });
    it("stringify", function () {
        var str1 = fjs.utils.JSON.stringify({"a":2});
        expect('{"a":2}').toBe(str1);
        var str2 = fjs.utils.JSON.stringify({a:{e:null},b:[],c:"123"});
        expect('{"a":{"e":null},"b":[],"c":"123"}').toBe(str2);
    });
});