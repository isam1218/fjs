ddescribe("EntryModelTest", function () {
    it("constructor", function () {
        var entryModel = new fjs.fdp.model.EntryModel({field1:1, field2:"2"});
        expect(1).toBe(entryModel.field1);
        expect("2").toBe(entryModel.field2);
    });
    it("fill", function(){
        var entryModel = new fjs.fdp.model.EntryModel({field1:1, field2:"2", xpid:'0_1'});

        expect(1).toBe(entryModel.field1);
        expect("2").toBe(entryModel.field2);
        expect("0_1").toBe(entryModel.xpid);

        entryModel.fill({field1:5, field2:"6", xpid:'0_1'});

        expect(5).toBe(entryModel.field1);
        expect("6").toBe(entryModel.field2);
        expect("0_1").toBe(entryModel.xpid);

        var changes = entryModel.fill({field1:5, field2:"7"});

        expect(5).toBe(entryModel.field1);
        expect("7").toBe(entryModel.field2);
        expect("0_1").toBe(entryModel.xpid);

        expect(undefined).toBe(changes.field1);
        expect("7").toBe(changes.field2);
        expect('0_1').toBe(changes.xpid);



        expect(5).toBe(entryModel.field1);
        expect("7").toBe(entryModel.field2);
        expect("0_1").toBe(entryModel.xpid);

        changes = entryModel.fill({field1:6, field2:"7", xpid:'0_1'});

        expect(6).toBe(changes.field1);
        expect(undefined).toBe(changes.field2);
        expect('0_1').toBe(changes.xpid);
        changes = entryModel.fill({field1:6, field2:"7"});
        expect(null).toBe(changes);
    });
});