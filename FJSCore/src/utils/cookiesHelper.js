namespace('fjs.utils');
/**
 * @type {{getCookie: function(string), setCookie: function(string, string, {expires:(number|Date)}), deleteCookie: function(string)}}
 */
fjs.utils.Cookies = {
    /**
     * Returns cookie value by name
     * @param {string} name cookie name
     * @return {string} cookie value
     */
    get: function(name) {
        var matches = document.cookie.match(new RegExp(
            '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
    /**
     * @param {string} name
     * @param {string} value
     * @param {{expires:(number|Date)}} options
     */
    , set: function(name, value, options) {
        options = options || {};

        var expires = options.expires;

        if (typeof expires == 'number' && expires) {
            var d = new Date();
            d.setTime(d.getTime() + expires * 1000);
            expires = options.expires = d;
        }
        if (expires && expires.toUTCString) {
            options.expires = expires.toUTCString();
        }

        value = encodeURIComponent(value);

        var updatedCookie = name + '=' + value;

        for (var propName in options) {
            if (options.hasOwnProperty(propName)) {
                updatedCookie += '; ' + propName;
                var propValue = options[propName];
                if (propValue !== true) {
                    updatedCookie += '=' + propValue;
                }
            }
        }
        document.cookie = updatedCookie;
    }

    /**
     * Removes cookies by name
     * @param {string} name
     */
    , remove: function(name) {
        fjs.utils.Cookies.set(name, '', { expires: -1 });
    }
};
