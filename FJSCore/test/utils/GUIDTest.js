describe("GUID", function () {
    it("empty", function () {
        expect("00000000-0000-0000-0000-000000000000").toBe(fjs.utils.GUID.empty);
    });
    it('create', function(){
        expect(36).toBe(fjs.utils.GUID.create().length);
        var arr = [];
        for(var i=0; i<10000; i++) {
            var _guid = fjs.utils.GUID.create();
            expect(-1).toBe(arr.indexOf(_guid));
            arr.push(_guid);
        }
    });
});