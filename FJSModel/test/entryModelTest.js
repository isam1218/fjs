describe("entryModel", function() {
    it("constuctor", function () {
        var model1 = new fjs.model.EntryModel({xpid:'0_1', a:1, b:'b'});
        expect('0_1').toBe(model1.xpid);
        expect(1).toBe(model1.a);
        expect('b').toBe(model1.b);
        var model2 = new fjs.model.EntryModel({xpid:'0_2', a:true, b:{c:'c'}});
        expect('0_2').toBe(model2.xpid);
        expect(true).toBe(model2.a);
        expect('c').toBe(model2.b.c);
    });

    it("fill", function () {
        var model1 = new fjs.model.EntryModel({xpid:'0_1', a:1, b:'b'});
        expect('0_1').toBe(model1.xpid);
        expect(1).toBe(model1.a);
        expect('b').toBe(model1.b);
        model1.fill({a:2,b:'c'});
        expect('0_1').toBe(model1.xpid);
        expect(2).toBe(model1.a);
        expect('c').toBe(model1.b);
    });
});