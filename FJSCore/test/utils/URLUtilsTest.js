describe("URLUtils", function() {
    it("getOrigin", function () {
        expect('http://localhost:9877').toBe(fjs.utils.URL.getOrigin());
    });

    it("getFileExtension", function () {
        expect('.doc').toBe(fjs.utils.URL.getFileExtension("http://qweqwe.qw/qweqwe/asd.doc"));
    });

    it("getFileName", function() {
        expect('asd.doc').toBe(fjs.utils.URL.getFileName("http://qweqwe.qw/qweqwe/asd.doc"));
    });

    it("getAbsoluteURL", function() {
        expect('http://localhost:9877/test.html').toBe(fjs.utils.URL.getAbsoluteURL("test.html"));
    });
});