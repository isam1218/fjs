
describe("mysuite", function(){
    it("should be true", function() {
        expect(true).toBe(true);
    });
});

describe("checkDB", function(){
    it("should be true", function() {
        expect(true).toBe(!!fjs.db.IndexedDBProvider.check(window));
    });
});