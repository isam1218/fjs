describe("browser", function () {
    var userAgents = {
        chrome:["Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.67 Safari/537.36",
        "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.67 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1944.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1664.3 Safari/537.36",
        "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.16 Safari/537.36",
        "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.17 Safari/537.36",
        "Mozilla/5.0 (X11; CrOS i686 4319.74.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.57 Safari/537.36"
        ]
        , firefox:[
            "Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0",
            "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:29.0) Gecko/20120101 Firefox/29.0",
            "Mozilla/5.0 (X11; OpenBSD amd64; rv:28.0) Gecko/20100101 Firefox/28.0",
            "Mozilla/5.0 (Windows NT 6.1; rv:27.3) Gecko/20130101 Firefox/27.3",
            "Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:27.0) Gecko/20121011 Firefox/27.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:25.0) Gecko/20100101 Firefox/25.0",
            "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:24.0) Gecko/20100101 Firefox/24.0",
            "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.16) Gecko/20120427 Firefox/15.0a1"
        ]
        , opera:[
            "Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14",
            "Mozilla/5.0 (Windows NT 6.0; rv:2.0) Gecko/20100101 Firefox/4.0 Opera 12.14",
            "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0) Opera 12.14",
            "Opera/12.80 (Windows NT 5.1; U; en) Presto/2.10.289 Version/12.02",
            "Mozilla/5.0 (Windows NT 5.1) Gecko/20100101 Firefox/14.0 Opera/12.0",
            "Opera/9.80 (X11; Linux x86_64; U; Ubuntu/10.10 (maverick); pl) Presto/2.7.62 Version/11.01",
            "Mozilla/5.0 (Windows NT 5.1; U; fr) Opera 8.51"
        ]
        , safari: [
            "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/534.55.3 (KHTML, like Gecko) Version/5.1.3 Safari/534.53.10",
            "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; da-dk) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
            "Mozilla/5.0 (Windows; U; Windows NT 6.1; tr-TR) AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27"
        ]
        , ie:[
            "Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; .NET4.0E; .NET4.0C; .NET CLR 3.5.30729; .NET CLR 2.0.50727; .NET CLR 3.0.30729; InfoPath.3; rv:11.0) like Gecko",
            "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)",
            "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
            "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)",
            "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)",
            "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)"
        ]
    };
    it("isChrome", function () {
        var _userAgent = "";
        fjs.utils.Browser.getNavigator = function() {
            return {userAgent:_userAgent
            , appName:"Netscape"}
        };
        for(var i=0; i<userAgents.chrome.length; i++) {
            _userAgent = userAgents.chrome[i];
            expect(true).toBe(fjs.utils.Browser.isChrome());
        }
    });
    it("isFirefox", function () {
        var _userAgent = "";
        fjs.utils.Browser.getNavigator = function() {
            return {userAgent:_userAgent
                , appName:"Netscape"}
        };
        for(var i=0; i<userAgents.firefox.length; i++) {
            _userAgent = userAgents.firefox[i];
            expect(true).toBe(fjs.utils.Browser.isFirefox());
        }
    });
    it("isSafari", function () {
        var _userAgent = "";
        fjs.utils.Browser.getNavigator = function() {
            return {userAgent:_userAgent
                , appName:"Netscape"}
        };
        for(var i=0; i<userAgents.safari.length; i++) {
            _userAgent = userAgents.safari[i];
            expect(true).toBe(fjs.utils.Browser.isSafari());
        }
    });
    it("isOpera", function () {
        var _userAgent = "";
        fjs.utils.Browser.getNavigator = function() {
            return {userAgent:_userAgent
                , appName:"Netscape"}
        };
        for(var i=0; i<userAgents.opera.length; i++) {
            _userAgent = userAgents.opera[i];
            expect(true).toBe(fjs.utils.Browser.isOpera());
        }
    });

    it("isIE", function () {
        var _userAgent = "";
        fjs.utils.Browser.getNavigator = function() {
            return {userAgent:_userAgent
                , appName:"Netscape"}
        };
        for(var i=0; i<userAgents.ie.length; i++) {
            _userAgent = userAgents.ie[i];
            expect(true).toBe(fjs.utils.Browser.isIE());
        }
    });

    it("getIEVersion", function(){
        var _userAgent = "";
        var _appName = "";
      fjs.utils.Browser._ieV = null;
        fjs.utils.Browser.getNavigator = function() {
            return {userAgent:_userAgent
                , appName:_appName}
        };
        _userAgent = userAgents.ie[0];
        _appName = "Netscape";
      fjs.utils.Browser._ieV = null;
        expect(11).toBe(fjs.utils.Browser.getIEVersion());
        _userAgent = userAgents.ie[1];
        _appName = "Microsoft Internet Explorer";
      fjs.utils.Browser._ieV = null;
        expect(10).toBe(fjs.utils.Browser.getIEVersion());
        _userAgent = userAgents.ie[2];
      fjs.utils.Browser._ieV = null;
        expect(9).toBe(fjs.utils.Browser.getIEVersion());
        _userAgent = userAgents.ie[3];
      fjs.utils.Browser._ieV = null;
        expect(8).toBe(fjs.utils.Browser.getIEVersion());
        _userAgent = userAgents.ie[4];
      fjs.utils.Browser._ieV = null;
        expect(7).toBe(fjs.utils.Browser.getIEVersion());
        _userAgent = userAgents.ie[5];
      fjs.utils.Browser._ieV = null;
        expect(6).toBe(fjs.utils.Browser.getIEVersion());
    });

    it("isIE11", function(){
      fjs.utils.Browser._ieV = null;
        fjs.utils.Browser.getNavigator = function() {
            return {userAgent:userAgents.ie[0]
                , appName:"Netscape"}
        };
        expect(true).toBe(fjs.utils.Browser.isIE11());
    });

    it("isIE10", function(){
      fjs.utils.Browser._ieV = null;
        fjs.utils.Browser.getNavigator = function() {
            return {userAgent:userAgents.ie[1]
                , appName:"Microsoft Internet Explorer"}
        };
        expect(true).toBe(fjs.utils.Browser.isIE10());
    });
    it("isIE9", function(){
      fjs.utils.Browser._ieV = null;
        fjs.utils.Browser.getNavigator = function() {
            return {userAgent:userAgents.ie[2]
                , appName:"Microsoft Internet Explorer"}
        };
        expect(true).toBe(fjs.utils.Browser.isIE9());
    });
    it("isIE8", function(){
      fjs.utils.Browser._ieV = null;
        fjs.utils.Browser.getNavigator = function() {
            return {userAgent:userAgents.ie[3]
                , appName:"Microsoft Internet Explorer"}
        };
        expect(true).toBe(fjs.utils.Browser.isIE8());
    });
});
