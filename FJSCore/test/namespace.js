describe("namespace", function() {
    it("get", function () {
        window.ns = {
            ns2:{
                a:5
            }
        };
        expect(ns).toBe(namespace('ns'));
        expect(ns.ns2).toBe(namespace('ns.ns2'));
        expect(5).toBe(ns.ns2.a);
    });
    it("create", function () {
        namespace('nsp.nsp2.nsp3');
        expect(!!window["nsp"]["nsp2"]["nsp3"]).toBe(true);
    });
});