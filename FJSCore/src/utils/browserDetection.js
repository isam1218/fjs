namespace("fjs.utils");

fjs.utils.Browser = {
    _ieV: null
    , getIEVersion: function ()
    {
        if(this._ieV==null) {
            var rv = -1;
            if (navigator.appName == 'Microsoft Internet Explorer')
            {
                var ua = navigator.userAgent;
                var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat( RegExp.$1 );
            }
            else if (navigator.appName == 'Netscape')
            {
                var ua = navigator.userAgent;
                var re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
                if (re.exec(ua) != null)
                    rv = parseFloat( RegExp.$1 );
            }
            return this._ieV = rv;
        }
        return this._ieV;
    }
    , isIE: function() {
        if(this.getIEVersion() != -1) {
            return function(){return true; }
        }
        else {
            return function(){return false; }
        }
    }()
    , isIE7: function() {
        if(this.getIEVersion() == 7) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
    , isIE8: function() {
        if(this.getIEVersion() == 8) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
    , isIE9: function() {
        if(this.getIEVersion() == 9) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
    , isIE10: function() {
        if(this.getIEVersion() == 10) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
    , isIE11: function() {
        if(this.getIEVersion() == 11) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
    , isChrome: function() {
        if(/chrom(e|ium)/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
    , isFirefox: function() {
        if(/firefox/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
    , isSafari: function() {
        if(/safari/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
    , isOpera: function() {
        if(/Opera/i.test(navigator.userAgent)) {
            return function(){return true;}
        }
        else {
            return function(){return false;}
        }
    }()
};
