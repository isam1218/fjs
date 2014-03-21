describe("URLUtils", function() {
    it("getOrigin", function () {
        expect('http://localhost:9876').toBe(fjs.utils.URL.getOrigin());
    });
});