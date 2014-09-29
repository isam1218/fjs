describe("console", function () {
    it("log", function () {
        fjs.utils.Console.log("Console.log");
    });
    it("error", function () {
        fjs.utils.Console.error("Console.error");
    });
    it("debug", function () {
        fjs.utils.Console.debug("Console.debug");
    });
    it("warn", function () {
        fjs.utils.Console.warn("Console.warn");
    });
    it("info", function () {
        fjs.utils.Console.info("Console.info");
    });
});