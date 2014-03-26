describe("EntryModelTest", function () {
    it("constructor", function () {
        var entryModel = new fjs.fdp.EntryModel({field1:1, field2:"2"});
        expect(1).toBe(entryModel.field1);
        expect("2").toBe(entryModel.field2);
    });
    it("fill", function(){
        var entryModel = new fjs.fdp.EntryModel({field1:1, field2:"2"});
        entryModel.fill({field1:5, field2:"6"});
        expect(5).toBe(entryModel.field1);
        expect("6").toBe(entryModel.field2);
        var changes = entryModel.fill({field1:5, field2:"7"});
        expect("7").toBe(entryModel.field2);
        expect("7").toBe(changes.field2);
        expect(undefined).toBe(changes.field1);
        changes = entryModel.fill({field1:5, field2:"7"});
        expect(null).toBe(changes);
    });
});