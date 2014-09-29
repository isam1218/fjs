(function(){
    var _Browser =
    /**
     * Static class is responsible for browser type detection.
     * @class
     * @static
     */
    fjs.utils.Browser = function(){};

  /**
   * @return {String}
   */
    _Browser.getNavigator = function() {
        return self.navigator;
    };

    _Browser._ieV = null;

    /**
     * Returns Internet explorer major version
     * @return {number}
     */
    _Browser.getIEVersion = function () {
    if(!_Browser._ieV) {
      var rv = -1, ua, re, nav = _Browser.getNavigator();
      if (nav.appName == 'Microsoft Internet Explorer') {
        ua = nav.userAgent;
        re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
          rv = parseFloat(RegExp.$1);
      }
      else if (nav.appName == 'Netscape') {
        ua = nav.userAgent;
        re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
          rv = parseFloat(RegExp.$1);
      }
      return _Browser._ieV = rv;
    }
    else return _Browser._ieV;
  };

    /**
     * Returns true if browser is Internet Explorer
     * @return {boolean}
     */
    _Browser.isIE = function() {
        var res = _Browser.getIEVersion() != -1;
      _Browser.isIE = function() {
            return res;
        };
        return _Browser.isIE();
    };
    /**
     * Returns true if browser is Internet Explorer 7
     * @return {boolean}
     */
    _Browser.isIE7 =  function() {

        var res = _Browser.getIEVersion() == 7;
      _Browser.isIE7 = function() {
            return res;
        };
        return _Browser.isIE7();
    };
    /**
     * Returns true if browser is Internet Explorer 8
     * @return {boolean}
     */
    _Browser.isIE8 = function() {
        var res = _Browser.getIEVersion() == 8;
      _Browser.isIE8 = function() {
            return res;
        };
        return _Browser.isIE8();
    };
    /**
     * Returns true if browser is Internet Explorer 9
     * @return {boolean}
     */
    _Browser.isIE9 = function() {
        var res = _Browser.getIEVersion() == 9;
      _Browser.isIE9 = function() {
            return res;
        };
        return _Browser.isIE9();
    };
    /**
     * Returns true if browser is Internet Explorer 10
     * @return {boolean}
     */
    _Browser.isIE10 = function() {
        var res = _Browser.getIEVersion() == 10;
      _Browser.isIE10 = function() {
            return res;
        };
        return _Browser.isIE10();
    };
    /**
     * Returns true if browser is Internet Explorer 11
     * @return {boolean}
     */
    _Browser.isIE11 = function() {
        var res = _Browser.getIEVersion() == 11;
      _Browser.isIE11 = function() {
            return res;
        };
        return _Browser.isIE11();
    };
    /**
     * Returns true if browser is Chrome or Chromium
     * @return {boolean}
     */
    _Browser.isChrome = function() {
        var res = /chrom(e|ium)/i.test(_Browser.getNavigator().userAgent);
      _Browser.isChrome = function() {
            return res;
        };
        return _Browser.isChrome();
    };
    /**
     * Returns true if browser is Firefox
     * @return {boolean}
     */
    _Browser.isFirefox = function() {
        var res = /firefox/i.test(_Browser.getNavigator().userAgent);
      _Browser.isFirefox = function() {
            return res;
        };
        return _Browser.isFirefox();
    };
    /**
     * Returns true if browser is Safari
     * @return {boolean}
     */
    _Browser.isSafari = function() {
        var res = /safari/i.test(_Browser.getNavigator().userAgent) && !/chrom(e|ium)/i.test(_Browser.getNavigator().userAgent);
      _Browser.isSafari = function() {
            return res;
        };
        return _Browser.isSafari();
    };
    /**
     * Returns true if browser is Opera
     * @return {boolean}
     */
    _Browser.isOpera = function() {
        var res = /opera/i.test(_Browser.getNavigator().userAgent);
      _Browser.isOpera = function() {
            return res;
        };
        return _Browser.isOpera();
    };
    /**
     * Returns browser name ['ie'|'firefox'|'chrome'|'safari'|'opera']
     * @returns {string}
     */
    _Browser.getBrowserName = function() {
        if(_Browser.isIE()) return "ie";
        else  if(_Browser.isFirefox()) return "firefox";
        else if(_Browser.isChrome()) return "chrome";
        else if(_Browser.isSafari()) return "safari";
        else if(_Browser.isOpera()) return "opera";
        else return "";
    };
})();
