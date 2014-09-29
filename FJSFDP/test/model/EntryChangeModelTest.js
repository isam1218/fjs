describe("EntryChangeModel", function () {
    it("constructor", function () {
        var entryModel = new fjs.fdp.model.EntryChangeModel({field1:1, field2:"2"});
        expect(1).toBe(entryModel.field1);
        expect("2").toBe(entryModel.field2);
        var entryModel2 = new fjs.fdp.model.EntryChangeModel({field1:2, field2:"3", xpid:"0_3", xef001id:"123", xef001iver:"222", source:"0"});
        expect(2).toBe(entryModel2.field1);
        expect("3").toBe(entryModel2.field2);
        expect("0_3").toBe(entryModel2.xpid);
        expect(undefined).toBe(entryModel2.xef001id);
        expect(undefined).toBe(entryModel2.xef001iver);
        expect(undefined).toBe(entryModel2.source);
        var entryModel3 = new fjs.fdp.model.EntryChangeModel({call_field1:2, call_field2:"3", call_xpid:"0_3", call_xef001id:"123", call_xef001iver:"222", call_source:"0"});
        expect(2).toBe(entryModel3.call_field1);
        expect("3").toBe(entryModel3.call_field2);
        expect(undefined).toBe(entryModel3.call_xpid);
        expect(undefined).toBe(entryModel3.call_xef001id);
        expect(undefined).toBe(entryModel3.call_xef001iver);
        expect(undefined).toBe(entryModel3.call_source);
    });

    it("fill", function(){
        var model1 = new fjs.fdp.model.EntryChangeModel({xpid:'0_1', a:1, b:'b'});
        expect('0_1').toBe(model1.xpid);
        expect(1).toBe(model1.a);
        expect('b').toBe(model1.b);
        model1.fill({a:2,b:'c',d:7, source:'0', xef001id:'1'});
        expect('0_1').toBe(model1.xpid);
        expect(2).toBe(model1.a);
        expect('c').toBe(model1.b);
        expect(7).toBe(model1.d);
        expect(undefined).toBe(model1.source);
        expect(undefined).toBe(model1.xef001id);
        model1.fill({feed_xpid:'0_1', a:4, feed_b:'f', d:5, feed_source:'0', feed_xef001id:'1'});
        expect('0_1').toBe(model1.xpid);
        expect(4).toBe(model1.a);
        expect('f').toBe(model1.feed_b);
        expect(5).toBe(model1.d);
        expect(undefined).toBe(model1.feed_xpid);
        expect(undefined).toBe(model1.feed_source);
        expect(undefined).toBe(model1.feed_xef001id);
    });
});
