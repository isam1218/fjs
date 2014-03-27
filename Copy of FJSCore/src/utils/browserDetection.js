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
        if(getIEVersion() != -1) {
            return function(){return true; }
        }
        else {
            return function(){return false; }
        }
    }();
    /**
    * Returns true if browser is Internet Explorer 7
    * @return {boolean}
    */
    fjs.utils.Browser.isIE7 =  function() {
        if(getIEVersion() == 7) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }();
    /**
    * Returns true if browser is Internet Explorer 8
    * @return {boolean}
    */
    fjs.utils.Browser.isIE8 = function() {
        if(getIEVersion() == 8) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }();
    /**
    * Returns true if browser is Internet Explorer 9
    * @return {boolean}
    */
    fjs.utils.Browser.isIE9 = function() {
        if(getIEVersion() == 9) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }();
    /**
    * Returns true if browser is Internet Explorer 10
    * @return {boolean}
    */
    fjs.utils.Browser.isIE10 = function() {
        if(getIEVersion() == 10) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }();
    /**
    * Returns true if browser is Internet Explorer 11
    * @return {boolean}
    */
    fjs.utils.Browser.isIE11 = function() {
        if(getIEVersion() == 11) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }();
    /**
    * Returns true if browser is Chrome or Chromium
    * @return {boolean}
    */
    fjs.utils.Browser.isChrome = function() {
        if(/chrom(e|ium)/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }();
    /**
    * Returns true if browser is Firefox
    * @return {boolean}
    */
    fjs.utils.Browser.isFirefox = function() {
        if(/firefox/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }();
    /**
    * Returns true if browser is Safari
    * @return {boolean}
    */
    fjs.utils.Browser.isSafari = function() {
        if(/safari/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }();
    /**
    * Returns true if browser is Opera
    * @return {boolean}
    */
    fjs.utils.Browser.isOpera = function() {
        if(/Opera/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }();
})();