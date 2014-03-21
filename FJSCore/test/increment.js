describe("increment", function () {
    it("get", function () {
        expect(1).toBe(new fjs.utils.Increment().get("type1"));
        expect(2).toBe(new fjs.utils.Increment().get("type1"));
        expect(3).toBe(new fjs.utils.Increment().get("type1"));
        expect(4).toBe(new fjs.utils.Increment().get("type1"));
        expect(1).toBe(new fjs.utils.Increment().get("type2"));
        expect(2).toBe(new fjs.utils.Increment().get("type2"));
        expect(5).toBe(new fjs.utils.Increment().get("type1"));
        expect(3).toBe(new fjs.utils.Increment().get("type2"));
    });
    it("clear", function () {
        expect(1).toBe(new fjs.utils.Increment().get("type3"));
        expect(2).toBe(new fjs.utils.Increment().get("type3"));
        expect(3).toBe(new fjs.utils.Increment().get("type3"));
        new fjs.utils.Increment().clear("type3");
        expect(1).toBe(new fjs.utils.Increment().get("type3"));
        expect(1).toBe(new fjs.utils.Increment().get("type4"));
        expect(2).toBe(new fjs.utils.Increment().get("type4"));
        expect(2).toBe(new fjs.utils.Increment().get("type3"));
        expect(3).toBe(new fjs.utils.Increment().get("type3"));
        expect(3).toBe(new fjs.utils.Increment().get("type4"));
        new fjs.utils.Increment().clear("type4");
        expect(1).toBe(new fjs.utils.Increment().get("type4"));
        expect(2).toBe(new fjs.utils.Increment().get("type4"));
        expect(3).toBe(new fjs.utils.Increment().get("type4"));
    });
});