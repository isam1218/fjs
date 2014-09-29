describe("namespace", function() {
    it("get", function () {
        window.ns = {
            ns2:{
                a:5
            }
        };
        expect(ns).toBe(fjs.core.namespace('ns'));
        expect(ns.ns2).toBe(fjs.core.namespace('ns.ns2'));
        expect(5).toBe(ns.ns2.a);
    });
    it("create", function () {
        fjs.core.namespace('nsp.nsp2.nsp3');
        expect(!!window["nsp"]["nsp2"]["nsp3"]).toBe(true);
    });
});