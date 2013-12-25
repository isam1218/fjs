namespace("fjs.utils");

fjs.utils.Browser = {
    _is_ie: null
    , isIE:function() {
      return this._is_ie!=null ? this._is_ie : (this._is_ie = this.getInternetExplorerVersion() != -1);
    }
    , getInternetExplorerVersion: function ()
    {
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
        return rv;
    }
};
