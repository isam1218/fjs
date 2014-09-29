describe("feedModel", function() {
    it("getEntryByXpid", function () {
        var fm = new fjs.model.FeedModel('testModel');
        fm.onEntryChange({eventType:fjs.model.FeedModel.EVENT_TYPE_PUSH, xpid:'0_1', entry:{xpid:'0_1', a:1, b:'b'}});
        expect('0_1').toBe(fm.getEntryByXpid('0_1').xpid);
        expect(1).toBe(fm.getEntryByXpid('0_1').a);
        expect('b').toBe(fm.getEntryByXpid('0_1').b);
    });
    it("addEventListener", function () {
        var _event=null;
        var fm = new fjs.model.FeedModel('testModel');
        fm.addEventListener(fjs.model.FeedModel.EVENT_TYPE_PUSH, function(e) {
            _event = e;
        });
        fm.onEntryChange({eventType:fjs.model.FeedModel.EVENT_TYPE_PUSH, xpid:'0_1', entry:{xpid:'0_1', a:1, b:'b'}});
        expect('0_1').toBe(_event.xpid);
        expect(fjs.model.FeedModel.EVENT_TYPE_PUSH).toBe(_event.eventType);

    });
    it("getItemsCount", function () {
        var fm = new fjs.model.FeedModel('testModel');
        expect(0).toBe(fm.getItemsCount());
        fm.onEntryChange({eventType:fjs.model.FeedModel.EVENT_TYPE_PUSH, xpid:'0_1', entry:{xpid:'0_1', a:1, b:'b'}});
        expect(1).toBe(fm.getItemsCount());
        fm.onEntryChange({eventType:fjs.model.FeedModel.EVENT_TYPE_PUSH, xpid:'0_2', entry:{xpid:'0_2', a:2, b:'c'}});
        expect(2).toBe(fm.getItemsCount());
        fm.onEntryDeletion({eventType:fjs.model.FeedModel.EVENT_TYPE_PUSH, xpid:'0_1', entry:null});
        expect(1).toBe(fm.getItemsCount());
    });
});