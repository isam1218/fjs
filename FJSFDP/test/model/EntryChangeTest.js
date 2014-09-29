describe("EntryChange", function () {
    it("constructor", function () {
        var change = new fjs.fdp.model.EntryChange('feed1', '0_1', {xpid:'0_1', a:1, b:4}, 'change');
        expect('feed1').toBe(change.feedName);
        expect('0_1').toBe(change.xpid);
        expect('0_1').toBe(change.entry.xpid);
        expect('change').toBe(change.type);
    });
    it("prepareChange", function(){
        var change = new fjs.fdp.model.EntryChange('feed1', '0_1');
        var _change = change.prepareChange({a:1,b:'2'}, 'feed1');
        expect(1).toBe(_change.a);
        expect('2').toBe(_change.b);
        var _change2 = change.prepareChange({a:1,b:'2'}, 'feed2');
        expect(undefined).toBe(_change2.a);
        expect(undefined).toBe(_change2.b);
        expect(1).toBe(_change2.feed2_a);
        expect('2').toBe(_change2.feed2_b);
    });
    it("fillChange", function(){
        var change = new fjs.fdp.model.EntryChange('feed1', '0_1');
        var item1 = new fjs.fdp.model.EntryModel();
        change.fillChange(item1, {a:1, b:'2'},  'feed1');

        expect(1).toBe(change.entry.a);
        expect('2').toBe(change.entry.b);
        expect('0_1').toBe(change.entry.xpid);
        expect(1).toBe(item1.a);
        expect('2').toBe(item1.b);
        expect('0_1').toBe(item1.xpid);

        change.fillChange(item1, {a:1, b:'2', xpid:'0_1'},  'feed2');

        expect(1).toBe(change.entry.a);
        expect('2').toBe(change.entry.b);
        expect('0_1').toBe(change.entry.xpid);
        expect(1).toBe(item1.a);


        expect(1).toBe(change.entry.feed2_a);
        expect('2').toBe(change.entry.feed2_b);
        expect(undefined).toBe(change.entry.feed2_xpid);
        expect(1).toBe(item1.feed2_a);
        expect('2').toBe(item1.feed2_b);
        expect('0_1').toBe(item1.feed2_xpid);
        expect('0_1').toBe(change.xpid);
        expect('change').toBe(change.type);



        var change2 = new fjs.fdp.model.EntryChange('feed1', '0_2');

        var item2 = new fjs.fdp.model.EntryModel({xpid:'0_2', a:1, b:'2'});

        change2.fillChange(item2, {a:1, b:'2'},  'feed1');

        expect(undefined).toBe(change2.entry.a);
        expect(undefined).toBe(change2.entry.b);
        expect(undefined).toBe(change2.entry.xpid);

        expect(1).toBe(item2.a);
        expect('2').toBe(item2.b);
        expect('0_2').toBe(item2.xpid);

        change2.fillChange(item2, {a:1, b:'3'},  'feed1');

        expect(undefined).toBe(change2.entry.a);
        expect('3').toBe(change2.entry.b);
        expect('0_2').toBe(change2.entry.xpid);

        expect(1).toBe(item2.a);
        expect('3').toBe(item2.b);
        expect('0_2').toBe(item2.xpid);

        change2.fillChange(item2, {a:1},  'feed2');
        expect(undefined).toBe(change2.entry.a);
        expect('3').toBe(change2.entry.b);
        expect(1).toBe(change2.entry.feed2_a);
        expect('0_2').toBe(change2.entry.xpid);

        expect(1).toBe(item2.a);
        expect('3').toBe(item2.b);
        expect(1).toBe(item2.feed2_a);
        expect('0_2').toBe(item2.xpid);

        expect('0_2').toBe(change2.xpid);
        expect('change').toBe(change2.type);
    });

    it("fillDeletion", function(){
        var change = new fjs.fdp.model.EntryChange('feed1', '0_1');
        var item1 = new fjs.fdp.model.EntryModel({a:1, b:'2'});
        change.fillDeletion(item1, 'feed1');
        expect('0_1').toBe(change.xpid);
        expect('delete').toBe(change.type);
        expect(null).toBe(change.entry);
        var item2 = new fjs.fdp.model.EntryModel({xpid:'0_2', a:1, b:'2', feed2_a:3, feed2_b:'4'});
        var change2 = new fjs.fdp.model.EntryChange('feed1', '0_2');
        change2.fillDeletion(item2, 'feed2');
        expect('0_2').toBe(change2.xpid);
        expect('change').toBe(change2.type);
        expect(null).toBe(change2.entry.feed2_a);
        expect(null).toBe(change2.entry.feed2_b);
        expect(undefined).toBe(item2.feed2_a);
        expect(undefined).toBe(item2.feed2_b);
    });
});