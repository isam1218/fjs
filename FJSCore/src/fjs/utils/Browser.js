(function(){
    namespace("fjs.utils");
    var _ieV = null;
    function getIEVersion() {
        if(_ieV==null) {
            var rv = -1, ua, re;
            if (navigator.appName == 'Microsoft Internet Explorer')
            {
                ua = navigator.userAgent;
                re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat( RegExp.$1 );
            }
            else if (navigator.appName == 'Netscape')
            {
                ua = navigator.userAgent;
                re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat( RegExp.$1 );
            }
            return _ieV = rv;
        }
        return _ieV;
    }

    /**
     * Static class is responsible for browser type detection.
     * @class
     * @static
     */
    fjs.utils.Browser = function(){};

    /**
     * Returns Internet explorer major version
     * @return {number}
     */
    fjs.utils.Browser.getIEVersion = getIEVersion;

    /**
     * Returns true if browser is Internet Explorer
     * @return {boolean}
     */
    fjs.utils.Browser.isIE = function() {
        var res = getIEVersion() != -1;
        fjs.utils.Browser.isIE = function() {
            return res;
        };
        return fjs.utils.Browser.isIE();
    };
    /**
     * Returns true if browser is Internet Explorer 7
     * @return {boolean}
     */
    fjs.utils.Browser.isIE7 =  function() {

        var res = getIEVersion() == 7;
        fjs.utils.Browser.isIE7 = function() {
            return res;
        };
        return fjs.utils.Browser.isIE7();
    };
    /**
     * Returns true if browser is Internet Explorer 8
     * @return {boolean}
     */
    fjs.utils.Browser.isIE8 = function() {
        var res = getIEVersion() == 8;
        fjs.utils.Browser.isIE8 = function() {
            return res;
        };
        return fjs.utils.Browser.isIE8();
    };
    /**
     * Returns true if browser is Internet Explorer 9
     * @return {boolean}
     */
    fjs.utils.Browser.isIE9 = function() {
        var res = getIEVersion() == 9;
        fjs.utils.Browser.isIE9 = function() {
            return res;
        };
        return fjs.utils.Browser.isIE9();
    };
    /**
     * Returns true if browser is Internet Explorer 10
     * @return {boolean}
     */
    fjs.utils.Browser.isIE10 = function() {
        var res = getIEVersion() == 10;
        fjs.utils.Browser.isIE10 = function() {
            return res;
        };
        return fjs.utils.Browser.isIE10();
    };
    /**
     * Returns true if browser is Internet Explorer 11
     * @return {boolean}
     */
    fjs.utils.Browser.isIE11 = function() {
        var res = getIEVersion() == 11;
        fjs.utils.Browser.isIE11 = function() {
            return res;
        };
        return fjs.utils.Browser.isIE11();
    };
    /**
     * Returns true if browser is Chrome or Chromium
     * @return {boolean}
     */
    fjs.utils.Browser.isChrome = function() {
        var res = /chrom(e|ium)/i.test(navigator.userAgent);
        fjs.utils.Browser.isChrome = function() {
            return res;
        };
        return fjs.utils.Browser.isChrome();
    };
    /**
     * Returns true if browser is Firefox
     * @return {boolean}
     */
    fjs.utils.Browser.isFirefox = function() {
        var res = /firefox/i.test(navigator.userAgent);
        fjs.utils.Browser.isFirefox = function() {
            return res;
        };
        return fjs.utils.Browser.isFirefox();
    };
    /**
     * Returns true if browser is Safari
     * @return {boolean}
     */
    fjs.utils.Browser.isSafari = function() {
        var res = /safari/i.test(navigator.userAgent) && !/chrom(e|ium)/i.test(navigator.userAgent);
        fjs.utils.Browser.isSafari = function() {
            return res;
        };
        return fjs.utils.Browser.isSafari();
    };
    /**
     * Returns true if browser is Opera
     * @return {boolean}
     */
    fjs.utils.Browser.isOpera = function() {
        var res = /opera/i.test(navigator.userAgent);
        fjs.utils.Browser.isOpera = function() {
            return res;
        };
        return fjs.utils.Browser.isOpera();
    };
    /**
     * Returns browser name ['ie'|'firefox'|'chrome'|'safari'|'opera']
     * @returns {string}
     */
    fjs.utils.Browser.getBrowserName = function() {
        if(fjs.utils.Browser.isIE()) return "ie";
        else  if(fjs.utils.Browser.isFirefox()) return "firefox";
        else if(fjs.utils.Browser.isChrome()) return "chrome";
        else if(fjs.utils.Browser.isSafari()) return "safari";
        else if(fjs.utils.Browser.isOpera()) return "opera";
        else return "";
    };
})();