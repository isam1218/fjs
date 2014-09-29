describe("array", function () {
    it("isArray", function () {
        expect(true).toBe(fjs.utils.Array.isArray([]));
        expect(true).toBe(fjs.utils.Array.isArray([1,2,3]));
        expect(true).toBe(fjs.utils.Array.isArray(new Array()));
        expect(true).toBe(fjs.utils.Array.isArray('1,2,3'.split(',')));
        expect(false).toBe(fjs.utils.Array.isArray(1));
        expect(false).toBe(fjs.utils.Array.isArray("123"));
        expect(false).toBe(fjs.utils.Array.isArray(1.23));
        expect(false).toBe(fjs.utils.Array.isArray({'1':1,'2':2}));
        expect(false).toBe(fjs.utils.Array.isArray(true));
    });
});