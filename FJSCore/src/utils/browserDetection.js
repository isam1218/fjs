namespace("fjs.utils");
(function(){
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

    fjs.utils.Browser = {
    /**
    * Returns Internet explorer major version
    * @return {string}
    */
    getIEVersion: getIEVersion
    /**
    * Returns true if browser is Internet Explorer
    * @return {boolean}
    */
    , isIE: function() {
        if(getIEVersion() != -1) {
            return function(){return true; }
        }
        else {
            return function(){return false; }
        }
    }()
        /**
         * Returns true if browser is Internet Explorer 7
         * @return {boolean}
         */
    , isIE7: function() {
        if(getIEVersion() == 7) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
        /**
         * Returns true if browser is Internet Explorer 8
         * @return {boolean}
         */
    , isIE8: function() {
        if(getIEVersion() == 8) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
        /**
         * Returns true if browser is Internet Explorer 9
         * @return {boolean}
         */
    , isIE9: function() {
        if(getIEVersion() == 9) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
        /**
         * Returns true if browser is Internet Explorer 10
         * @return {boolean}
         */
    , isIE10: function() {
        if(getIEVersion() == 10) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
        /**
         * Returns true if browser is Internet Explorer 11
         * @return {boolean}
         */
        , isIE11: function() {
        if(getIEVersion() == 11) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
        /**
         * Returns true if browser is Chrome or Chromium
         * @return {boolean}
         */
        , isChrome: function() {
        if(/chrom(e|ium)/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
        /**
         * Returns true if browser is Firefox
         * @return {boolean}
         */
    , isFirefox: function() {
        if(/firefox/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
        /**
         * Returns true if browser is Safari
         * @return {boolean}
         */
    , isSafari: function() {
        if(/safari/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
        /**
         * Returns true if browser is Opera
         * @return {boolean}
         */
    , isOpera: function() {
        if(/Opera/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
};
})();