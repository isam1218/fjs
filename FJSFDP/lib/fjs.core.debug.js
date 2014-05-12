/**
 * Inheritance function
 * @param {Function} superClass super class constructor
 */
Function.prototype.extend = function(superClass) {
    var F = new Function();
    F.prototype = superClass.prototype;
    this.prototype = new F();
    this.prototype.constructor = this;
    this.prototype.superClass = superClass.prototype;
    for( var i = 1; i < arguments.length; ++i )
    {
        var parent = arguments[i];
        for (var prop in parent.prototype)
        {
            if (!this.prototype[prop]) this.prototype[prop] = parent.prototype[prop];
        }
        this.prototype[parent.prototype['__class_name']] = parent.prototype;
    }

};

/**
 * Creates and returns namespace
 * @param {string} ns_name namespace string
 * @returns {*|{}}
 */
var namespace = function(ns_name) {
    var parts = ns_name.split(".");

    var ns = self[parts[0]] = self[parts[0]] || {};
    for ( var i = 1; i < parts.length; i++) {
        var p = parts[i];
        ns = ns[p] = ns[p] || {};
    }
    return ns;
};
namespace("fjs.utils");
fjs.utils.Array = function(){};
fjs.utils.Array.isArray = function(obj) {
    return Array.isArray(obj) ||
        (typeof obj === 'object' && obj+"" === '[object Array]');
};(function(){
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
})();(function(){
namespace('fjs.utils');
/**
 * Utils static class for reading, writing and deleting cookies.
 * @class
 * @static
 */
fjs.utils.Cookies = {
    /**
     * Returns cookie value by name
     * @param {string} name - cookie name
     * @return {string} cookie value
     */
    get: function(name) {
        var matches = document.cookie.match(new RegExp(
            '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    /**
     * Saves property to cookies
     * @param {string} name - cookie name
     * @param {string} value - cookie value
     * @param {{expires:(number|Date)}=} options
     */
    set: function(name, value, options) {
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
    },

    /**
     * Removes cookies by name
     * @param {string} name - cookie name
     */
    remove: function(name) {
        fjs.utils.Cookies.set(name, '', { expires: -1 });
    }
};
})();(function(){
    namespace("fjs.utils");
    /**
     * @class
     */
    fjs.utils.Core = {
        /**
         * Function for asynchronous iteration by Object (map).
         * Move to the next item occurs on demand (next() function call); <br>
         * <b>Example:</b><br>
         * <code>
         *  var map = {"a":1, "b":2}, resultStr="";<br>
         *  fjs.utils.Core.asyncForIn(map,<br>
         *  function(key, value, next) {<br>
         *  &nbsp;&nbsp;resultStr+="{key";<br>
         *  &nbsp;&nbsp;setTimeout(function(){<br>
         *  &nbsp;&nbsp;&nbsp;&nbsp;resultStr+=":"+value+"}";<br>
         *  &nbsp;&nbsp;&nbsp;&nbsp;next();<br>
         *  &nbsp;&nbsp;},100)},<br>
         *  function(){<br>
         *   &nbsp;&nbsp;console.log(resultStr)//->'{a:1}{a:2}'<br>
         *  });
         * </code>
         * @param {Object} map - Object to iterate
         * @param {function(string, Object, Function)} execute - Function to execute for each map element
         * @param {Function} doneCallback - Function to execute when iterating ended
         */
        asyncForIn: function(map, execute, doneCallback) {
            var keys = [];
            var currentKeyIndex = 0;
            function next() {
                if(currentKeyIndex===keys.length) {
                    doneCallback();
                    return;
                }
                var key = keys[currentKeyIndex];
                execute(key, map[key], next);
                currentKeyIndex++;
            }

            for(var key in map) {
                if(map.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }
            next();
        }
    }
})();namespace("fjs.utils");
/**
 * Static class to facilitate work with DOM objects.
 * @constructor
 * @static
 */
fjs.utils.DOM = function() {

};
/**
 * Returns top and left offsets from edge of the window
 * @param {HTMLElement} element - Html element
 * @returns {{x: number, y: number}|undefined}
 */
fjs.utils.DOM.getElementOffset = function(element) {
        if(element != undefined)
        {
            var box = null;
            try {
                box = element.getBoundingClientRect();
            }
            catch(e) {
                box = {top : 0, left: 0, right: 0, bottom: 0};
            }
            var body = document.body;
            var docElem = document.documentElement;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var clientTop = docElem.clientTop || body.clientTop || 0;

            var left = box.left + scrollLeft - clientLeft;
            var top = box.top +  scrollTop - clientTop;
            return {x:left, y:top};
        }
};
/**
 * Adds css class to html element
 * @param {HTMLElement} element - Element to which will be added css class
 * @param {string} className - Class name
 * @returns {HTMLElement}
 */
fjs.utils.DOM.addClass = function(element, className) {
    if(!this.hasClass(element, className)) {
        if (element.classList)
            element.classList.add(className);
        else {
            element.className = (element.className +=" "+className).trim();
        }
    }
    return element
};
/**
 * Checks if css class exist in element <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element.classList">class list</a>
 * @param {HTMLElement} element - html element for check
 * @param {string} className - class name
 * @returns {boolean}
 */
fjs.utils.DOM.hasClass = function(element, className) {
    if (element.classList)
        return element.classList.contains(className);
    else
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
};

/**
* Removes css class from html element
* @param {HTMLElement} element - Element from which will be removed css class
* @param {string} className - Class name
* @returns {HTMLElement}
*/
fjs.utils.DOM.removeClass = function(element, className) {
    if (element.classList)
        element.classList.remove(className);
    else
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ').trim();
    return element;
};
/**
 * Adds css class to html element if it not exist in the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Element.classList">class list</a> or removes if it not exist.
 * @param {HTMLElement} element HTML element
 * @param {string} className Class name
 * @returns {HTMLElement}
 */
fjs.utils.DOM.toggleClass = function(element, className) {
    if(this.hasClass(element, className)) {
        return this.removeClass(element, className);
    }
    else {
        return this.addClass(element, className);
    }
};

/**
 * Attaches event handle
 * @param {HTMLElement} element Event target element
 * @param {string} eventName A string representing the event type to listen for.
 * @param {EventListener|Function} callback The object that receives a notification when an event of the specified type occurs.
 * This must be an object implementing the EventListener interface, or simply a JavaScript function.
 */
fjs.utils.DOM.addEventListener = function(element, eventName, callback) {
    eventName = eventName == "mousewheel" ? "DOMMouseScroll" : eventName;
    if (window.addEventListener) {
        element.addEventListener(eventName, callback, false);
    } else if (document.attachEvent)  {
        if(element==window) {
            window.document.attachEvent('on' + eventName, callback);
        }
        else {
            element.attachEvent('on' + eventName, callback);
        }
    }
    if(eventName == 'DOMMouseScroll') {
        element['onmousewheel'] = callback;
    }
};

/**
 * Removes event handler
 * @param {HTMLElement} element Event target element
 * @param {string} eventName A string representing the event type to listen for.
 * @param {EventListener|Function} callback The object that receives a notification when an event of the specified type occurs.
 * This must be an object implementing the EventListener interface, or simply a JavaScript function.
 */
fjs.utils.DOM.removeEventListener = function(element, eventName, callback) {
    eventName = eventName == "mousewheel" ? "DOMMouseScroll" : eventName;
    if (window.removeEventListener) {
        element.removeEventListener(eventName, callback, false);
    }
    else if (document.detachEvent)  {
        if(element==window) {
            document.detachEvent('on' + eventName, callback);
        }
        else {
            element.detachEvent('on' + eventName, callback);
        }
    }
    if(eventName == 'DOMMouseScroll') {
        element['onmousewheel'] = null;
    }
};
/**
 * Creates an event of the type specified. The returned object should be first initialized and can then be passed to .dispatchEvent.
 * @param {string} eventTypeInterface - Is a string that represents the type of event to be created. Possible event types include "UIEvents", "MouseEvents", "MutationEvents", and "HTMLEvents"
 * @param {string} eventType - Type of event
 * @param {Object|Event} eventObj - Event options
 * @returns {Event}
 */
fjs.utils.DOM.createEvent = function(eventTypeInterface, eventType, eventObj) {
    if(document.createEvent){
        var e = document.createEvent(eventTypeInterface);
        switch(eventTypeInterface) {
            case "MouseEvents":
                e.initMouseEvent(eventType, true, true, window,
                    1, 0, 0,
                    0,0,
                    false,false,false,false,0,null);
                break;
            case "UIEvents":
                e.initUIEvent(eventType, true, true, window, 1);
                break;
            case "HTMLEvents":
                e.initEvent(eventType, false, true);
                break;
            default:
                e.initEvent(eventType, true, true);
        }

        if(eventObj) {
            for (var i in eventObj) {
                if(eventObj.hasOwnProperty(i)) {
                    e[i] = eventObj[i];
                }
            }
        }
        return e;
    }
    else {
        if(!eventObj) {
            eventObj = {
                type: eventType
            }
        }
        return document.createEventObject(eventObj);
    }
};

/**
 * Dispatches an Event at the specified EventTarget, invoking the affected EventListeners in the appropriate order.<br/>
 * The normal event processing rules (including the capturing and optional bubbling phase) apply to events dispatched manually with dispatchEvent()
 * @param {HTMLElement} element Event target
 * @param {Event} event Is the Event object to be dispatched.
 */
fjs.utils.DOM.dispatchEvent = function(element, event) {
    if(document.createEvent){
        element.dispatchEvent(event);
    }
    else {
        element.fireEvent('on'+event.type, event);
    }
};(function () {
    /**
     * Simulates generation Globally Unique Identifier (<a href='http://en.wikipedia.org/wiki/Globally_unique_identifier'>GUID</a>)
     * @class
     * @static
     */
    fjs.utils.GUID = {};

    function _s4() {
        var now = new Date();
        var seed = now.getSeconds();
        return ((1 + Math.random()) * parseInt('10000', 16)).toString(16).substring(1, 5);
    }

    /**
     * Empty GUID ('00000000-0000-0000-0000-000000000000')
     * @const {String}
     */
    fjs.utils.GUID.empty = "00000000-0000-0000-0000-000000000000";

    /**
     * Generates Unique Identifier ('GUID')
     * @returns {string}
     */
    fjs.utils.GUID.create = function () {
        return (_s4() + _s4() + "-" + _s4() + "-" + _s4() + "-" + _s4() + "-" + _s4() + _s4() + _s4()).toUpperCase();
    }

})();
(function(){
    /**
     * Class to operate with incremental values. <br>
     * <b>Singleton</b>
     * @constructor
     */
    fjs.utils.Increment = function() {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;
        /**
         * @type {Object}
         * @private
         */
        this.counters = {};
    };
    /**
     * Creates incremental value by string key (starts from 1)
     * @param {string} key Key of incremental value
     * @returns {number}
     */
    fjs.utils.Increment.prototype.get = function(key) {
        if(!this.counters[key]) {
            this.counters[key] = 0;
        }
        return ++this.counters[key];
    };
    /**
     * Resets the incremental value (Sets incremental value to 0)
     * @param {string} key Key of incremental value
     */
    fjs.utils.Increment.prototype.clear = function(key) {
        this.counters[key] = 0;
    };
})();
(function() {
namespace("fjs.utils");
var _j =
 /**
 * Wrapper for native JSON object. <br>
 * Fixes some JSON issues.
 * @constructor
 * @static
 */
fjs.utils.JSON = function() {};
/**
 * Deserializes json string to object
 * @param {string} str
 * @returns {Object}
 */
fjs.utils.JSON.parse = function(str) {
    var _data = null;
    if(typeof (str) == 'string') {
        try {
            _data = JSON.parse(str);
        }
        catch (e) {
            try {
                _data = (new Function("return " + str + ";"))();
            }
            catch (e) {
                throw new Error('Sync data error', e);
            }
        }
    }
    else {
        _data = str;
    }
    return _data;
};
    /**
     * Checks string for compliance with json string format
     * @param {string} str
     * @returns {boolean}
     */
fjs.utils.JSON.check = function(str) {
    var isValid = false;
    try{
        _j.parse(str);
        isValid = true;
    } catch(e){}
    return isValid;
};
    /**
     * Serializes object to json string
     * @param {*} obj
     * @returns {string}
     */
fjs.utils.JSON.stringify = function(obj) {
    if(typeof (obj) == 'string') return obj;
    return JSON.stringify(obj);
};
    /**
     * Checks if object has no fields.
     * @param {Object} obj
     * @returns {boolean}
     */
fjs.utils.JSON.isEmpty = function(obj) {
    var hasFields = false;
    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            hasFields = true;
            break;
        }
    }
    return !hasFields;
};
})();
namespace("fjs.utils");
/**
 * Helper static class to facilitate work with URL-strings and location
 * @constructor
 * @static
 */
fjs.utils.URL = function() {

};
/**
 * Returns origin of current page.
 * @returns {string}
 */
fjs.utils.URL.getOrigin = function() {
    return window.location.origin ||  (location.protocol+"//"+location.host + (/:/.test(location.host) ? '' : (location.port ? ":" + location.port : "")));
};
/**
 * Returns the file extension or "" by URL
 * @param {string} url URL string
 * @returns {string}
 */
fjs.utils.URL.getFileExtension = function(url) {
    var _ext = /\.\w+($|\/$)/.exec(url);
    if(_ext != null)
    return (_ext.length > 0) ? _ext[0] : "";
    return "";
};

/**
 * Returns the file name or "" by URL
 * @param {string} url URL string
 * @returns {string}
 */
fjs.utils.URL.getFileName = function(url) {
    return (url.lastIndexOf('/') != -1) ? url.substring(url.lastIndexOf('/') + 1).trim() : url.substring(
            url.lastIndexOf('\\') + 1).trim();
};


/**
 * Returns absolute url by relative
 * @param {string} href - Relative url
 * @returns {string}
 */
fjs.utils.URL.getAbsoluteURL = function(href) {
    var wrapperEl = document.createElement("div");
    wrapperEl.innerHTML = "<a href=\"" + encodeURI(href) + "\">x</a>";
    return wrapperEl.firstChild.href;
};



/**
 * Created with JetBrains WebStorm.
 * User: ddyachenko
 * Date: 27.08.13
 * Time: 12:34
 * To change this template use File | Settings | File Templates.
 */

namespace("fjs.utils");
fjs.utils.TimeSync = function() {
    if (!fjs.utils.TimeSync.__instance)
        fjs.utils.TimeSync.__instance = this;
    else return fjs.utils.TimeSync.__instance;
    this.fdpTimestamp = 0;
};

fjs.utils.TimeSync.prototype.setTimestamp = function(time) {
    var intTime = parseInt(time);
    this.fdpTimestamp = (new Date()).getTime() - intTime;
    var date = new Date(this.fdpTimestamp);
};

fjs.utils.TimeSync.prototype.getDefault = function() {
    return this.fdpTimestamp;
};namespace("fjs.ajax");
/**
 * Ajax provider interface
 * @interface
 * @template T
 */
fjs.ajax.IAjaxProvider = function() {};

/**
 * Aborts request
 * @param {T} transport - Ajax transport
 */
fjs.ajax.IAjaxProvider.prototype.abort = function(transport) {};

/**
 * Sends ajax request
 * @param {string} method - Request method
 * @param {string} url - Request URL
 * @param {Object} headers - Request headers
 * @param {Object} data - Request data
 * @param {function(T, string, boolean)} callback
 * @return {T}
 */
fjs.ajax.IAjaxProvider.prototype.send = function(method, url, headers, data, callback) {};

(function() {
    namespace('fjs.ajax');

    /**
     * Wrapper class for XMLHTTPRequest to work via iframe. <br>
     * Inner class only for internal usage.<br>
     * THIS LINE IS TEST UPDATE TO TEST REVIEW cycle for this code.
     * @param {string} id Request id. ID for synchronization requests between page and iframe.
     * @constructor
     * @inner
     */
    fjs.ajax.IFrameRequest = function(id) {
        /**
         * Request id
         * @type {string}
         */
        this.id = id;
        /**
         * Request status
         * @type {number}
         */
        this.status = 0;
        /**
         * Response text
         * @type {string}
         */
        this.responseText = "";
        /**
         * Request method {'get'/'post'}
         * @type {string}
         */
        this.method = null;
        /**
         * Request url
         * @type {string}
         */
        this.url = null;
        /**
         * Request data (map key:value)
         * @type {Object}
         */
        this.postData = null;
        /**
         * Request headers (map key:value)
         * @type {Object}
         */
        this.headers = null;
    };

    var _a =
    /**
     * Represents a cross-domain AJAX request via iframe.<br>
     * Old IE browsers don't allow to make cross-domain requests.<br>
     * To circumvent this restriction we load to iframe the special page form other domain.<br>
     * This page makes same-domain requests. To communicate with this page (say what we want to send) we use postMessage.<br>
     * <b>Singleton</b>
     * @param {string} host Cross domain iframe url
     * @constructor
     * @implements {fjs.ajax.IAjaxProvider.<fjs.ajax.IFrameRequest>}
     */
     fjs.ajax.IFrameAjax = function(host) {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;
        var context = this;
        /**
         * Cross domain iframe url
         * @type {string}
         * @private
         */
        this.host = host;
        /**
         * @type {HTMLElement}
         * @private
         */
        this.status = _a.states.NOT_INITIALIZED;

         /**
          * @type {Array.<Object>}
          * @private
          */
        this.suspendRequestes = [];

         /**
          * @type {Object}
          * @private
          */
        this.listeners = {};

         /**
          * @type {Object}
          * @private
          */
         this.requests = {};

         /**
          * @type {HTMLElement}
          * @private
          */
        this.crdmnFrame = document.getElementById('crdmnFrame');

         this.compatibility = true;

        if(!this.crdmnFrame) {
            this.status = _a.states.INITIALIZATION;
            this.crdmnFrame = document.createElement('iframe');
            this.crdmnFrame.name = this.crdmnFrame.id = 'crdmnFrame';
            this.crdmnFrame.src = this.host;
            this.crdmnFrame.style.width = 0;
            this.crdmnFrame.style.height = 0;
            this.crdmnFrame.onload = function() {
                context.status = _a.states.READY;
                for(var i=0; i<context.suspendRequestes.length; i++) {
                    context.send(null, null, null, null, null, context.suspendRequestes[i]);
                }
            };
            document.body.appendChild(this.crdmnFrame);
            if(window.addEventListener)
            {
                window.addEventListener ("message", function(e){context.onResponse(e);}, false);
            } else {
                if(window.attachEvent) {
                    window.attachEvent("onmessage", function(e){context.onResponse(e);});
                }
            }
        }
        else {
            context.status = _a.states.READY;
        }
    };

    /**
     * @enum {number}
     * @private
     */
    fjs.ajax.IFrameAjax.states = {
        'NOT_INITIALIZED':-1,
        'INITIALIZATION':0,
        'READY':1
    };

    fjs.ajax.IFrameAjax.prototype.getParamData = function(data) {
        var paramStrings = [], i;
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                paramStrings.push(i + '=' + data[i]);
            }
        }
        return paramStrings.join('&');
    };

    /**
     * Sends ajax request
     * @param {string} method - Request method (POST or GET)
     * @param {string} url - Request URL
     * @param {Object} headers - Request (HTTP) headers
     * @param {Object} data - Request data
     * @param {function(fjs.ajax.IFrameRequest, string, boolean)} callback Request handler function
     * @param {fjs.ajax.IFrameRequest=} request Internal parameter. Should be null for external call.
     * @return {fjs.ajax.IFrameRequest}
     */
    fjs.ajax.IFrameAjax.prototype.send = function(method, url, headers, data, callback, request) {
        if(this.compatibility) {
            if (!request) {
                request = new fjs.ajax.IFrameRequest(new fjs.utils.Increment().get('IFrameAjaxRequest'));
                request.method = method;
                request.data = this.getParamData(data);
                request.url = url;
                var ticket = headers['Authorization'];
                if(ticket) {
                    ticket = ticket.replace('auth=', '') ;
                }
                request.authTicket = ticket;
                request.node = headers['node'];
                this.listeners[request.id] = callback;
            }
            if (this.status != _a.states.READY) {
                this.suspendRequestes.push(request);
            }
            else {
                this.crdmnFrame.contentWindow.postMessage(JSON.stringify(request), '*');
                this.requests[request.id] = request;
            }
        }
        else {
            if (!request) {
                request = new fjs.ajax.IFrameRequest(new fjs.utils.Increment().get('IFrameAjaxRequest'));
                request.method = method;
                request.postData = data;
                request.url = url;
                request.headers = headers;
                this.listeners[request.id] = callback;
            }
            if (this.status != _a.states.READY) {
                this.suspendRequestes.push(request);
            }
            else {
                var message = {type: "send", data: request};
                this.crdmnFrame.contentWindow.postMessage(JSON.stringify(message), '*');
                this.requests[request.id] = request;

            }
        }
        return request;
    };
    /**
     * Aborts request
     * @param {fjs.ajax.IFrameRequest} request Request for abort
     */
    fjs.ajax.IFrameAjax.prototype.abort = function(request) {
        if(!this.compatibility) {
            var message = {type: 'abort', data: request};
            this.crdmnFrame.contentWindow.postMessage(fjs.utils.JSON.stringify(message), '*');
        }
        request['aborted'] = true;
        request.status = 0;
        if(this.listeners[request.id]) {
            this.listeners[request.id](request, "", false);
        }
        delete this.listeners[request.id];
        delete this.requests[request.id];
    };

    /**
     * @param {MessageEvent} e Post message event
     * @private
     */
    fjs.ajax.IFrameAjax.prototype.onResponse = function(e) {
        if(!fjs.utils.JSON.check(e.data)) {
            return;
        }
        var message = fjs.utils.JSON.parse(e.data);
        if(this.compatibility) {
            if (message) {
                var request = message;
                var id = request.id;
                /**
                 * @type {fjs.ajax.IFrameRequest}
                 */
                var _request = this.requests[id];
                if (_request) {
                    _request.status = request.status;
                    _request.responseText = request.response;
                    var listener = this.listeners[id];
                    if (listener) {
                        if (!request.error) {
                            listener(_request, _request.responseText, true);
                        }
                        else {
                            listener(_request, _request.responseText, false);
                        }
                        delete this.listeners[id];
                    }
                }
                delete this.requests[id];
            }
        }
        else {
            if (message && message.type == 'IFrameAjaxRequest') {
                var request = message.data;
                var id = request.id;
                /**
                 * @type {fjs.ajax.IFrameRequest}
                 */
                var _request = this.requests[id];
                if (_request) {
                    _request.status = request.status;
                    _request.responseText = request.responseText;
                    var listener = this.listeners[id];
                    if (listener) {
                        if (!request.error) {
                            listener(_request, _request.responseText, true);
                        }
                        else {
                            listener(_request, _request.responseText, false);
                        }
                        delete this.listeners[id];
                    }
                }
                delete this.requests[id];
            }
        }
    }
})();(function() {
    namespace('fjs.ajax');
    /**
     * Represents a cross-domain AJAX request for old IE browsers. <br>
     * It works via <a href="http://msdn.microsoft.com/en-us/library/ie/cc288060(v=vs.85).aspx">XDomainRequest</a> <br>
     * It has significant restrictions, general that you cant get error code from failed request.<br>
     * <b>Singleton</b>
     * @constructor
     * @implements {fjs.ajax.IAjaxProvider.<XDomainRequest>}
     */
    fjs.ajax.XDRAjax = function() {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;
    };

    /**
     * Sends ajax request
     * @param {string} method - Request method (POST or GET)
     * @param {string} url - Request URL
     * @param {Object} headers - Request (HTTP) headers
     * @param {Object} data - Request data
     * @param {function(XDomainRequest, string, boolean)} callback Request handler function
     * @return {XDomainRequest}
     */
    fjs.ajax.XDRAjax.prototype.send = function(method, url, headers, data, callback) {
        var xdr = new XDomainRequest();
        xdr._onerror =  xdr.onerror = function(e){
            e = e || window.event;
            var _xdr = e.target || xdr;
            callback(_xdr, _xdr.responseText, false);
        };
        xdr.onload = function(e) {
            e = e || window.event;
            var _xdr = e.target || xdr;
            _xdr.status = 200;
            callback(_xdr, _xdr.responseText, true);
        };
        for(var key in headers) {
            if(headers.hasOwnProperty(key)) {
                url += (/\?/.test(url) ? '&' : '?') + key + "=" + encodeURIComponent(headers[key]);
            }
        }
        xdr.open(method, url);
        xdr.send(this.getParamData(data));
        return xdr;
    };

    fjs.ajax.XDRAjax.prototype.getParamData = function(data) {
        var paramStrings = [], i;
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                paramStrings.push(i + '=' + data[i]);
            }
        }
        return paramStrings.join('&');
    };
    /**
     * Aborts request
     * @param {XDomainRequest} xdr - Request to abort
     */
    fjs.ajax.XDRAjax.prototype.abort = function(xdr) {
        xdr['aborted'] = true;
        xdr.status = 0;
        xdr.abort();
        xdr._onerror({target:xdr});
    };
})();(function() {
  namespace('fjs.ajax');

  var _a =
  /**
  * Represents AJAX requests based on <a href="http://en.wikipedia.org/wiki/XMLHttpRequest">XMLHTTPRequest</a> <br>
  * <b>Singleton</b>
  * @constructor
  * @implements {fjs.ajax.IAjaxProvider.<XMLHttpRequest>}
  */
  fjs.ajax.XHRAjax = function() {
        //Singleton
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;
    };



    /**
     * XHR States
     * @enum {number}
     */
    fjs.ajax.XHRAjax.states = {
        /**
         * request not initialized
         */
        REQUEST_NOT_INITIALIZED: 0,
        /**
         * server connection established
         */
        REQUEST_CONNECTION_ESTABLISHED: 1,
        /**
         * request received
         */
        REQUEST_RECEIVED: 2,
        /**
         * processing request
         */
        REQUEST_PROCESSING: 3,
        /**
         * request finished and response is ready
         */
        REQUEST_COMPLETED: 4
    };

    /**
     * Returns instance of XMLHTTPRequest
     * @return {XMLHttpRequest}
     * @private
     */
    fjs.ajax.XHRAjax.prototype.getXmlHttp = function() {
        /**
         * @type {XMLHttpRequest}
         */
        var xmlhttp;
        try {
            xmlhttp = new XMLHttpRequest();
        }
        catch (e) {
            try {
                xmlhttp = ActiveXObject('Msxml2.XMLHTTP');
            }
            catch (e1) {
                try {
                    xmlhttp = ActiveXObject('Microsoft.XMLHTTP');
                } catch (e2) {
                    xmlhttp = null;
                }
            }
        }
        return xmlhttp;
    };

    /**
     * Prepares request data
     * @param {Object} data
     * @return {string}
     * @private
     */
    fjs.ajax.XHRAjax.prototype.getParamData = function(data) {
        var paramStrings = [], i;
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                paramStrings.push(i + '=' + data[i]);
            }
        }
        return paramStrings.join('&');
    };

    /**
     * Sends ajax request
     * @param {string} method - Request method (POST or GET)
     * @param {string} url - Request URL
     * @param {Object} headers - Request (HTTP) headers
     * @param {Object} data - Request data
     * @param {function(XMLHttpRequest, string, boolean)} callback
     * @return {XMLHttpRequest}
     */
    fjs.ajax.XHRAjax.prototype.send = function(method, url, headers, data, callback) {

        var xmlhttp = this.getXmlHttp(), key;

        xmlhttp.open(method, url);

        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        if (headers) {
            for (key in headers) {
                if (headers.hasOwnProperty(key)) {
                    xmlhttp.setRequestHeader(key, headers[key]);
                }
            }
        }

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState !== _a.states.REQUEST_COMPLETED) return;

            if (callback) {
                try {
                    if (xmlhttp.status === 200) {
                        callback(xmlhttp, xmlhttp.responseText, true);
                    }
                    else {
                        callback(xmlhttp, xmlhttp.responseText, false);
                    }
                }
                catch (e) {
                    callback({"status":0, responseText:"", aborted:true}, "", false);
                }
            }
        };

        xmlhttp.send(this.getParamData(data));

        return xmlhttp;
    };

    /**
     * Aborts request
     * @param {XMLHttpRequest} xhr
     */
    fjs.ajax.XHRAjax.prototype.abort = function(xhr) {
        if (xhr && xhr.readyState !== _a.states.REQUEST_COMPLETED) {
            xhr['aborted'] = true;
            xhr.abort();
        }
    };
})();
/**
 * Implements event target logic. <br>
 * Inherited class can fire events and have listeners for them.
 * @constructor
 * @abstract
 */
fjs.EventsSource = function() {
    /**
     * @type {Object}
     */
    this.listeners = {};
};

/**
 * Adds event listener
 * @param {string} eventType Event type
 * @param {Function} handler Method to execute when event happens
 */
fjs.EventsSource.prototype.addEventListener = function (eventType, handler) {
    var _listeners = this.listeners[eventType];
    if(!_listeners) {
        _listeners = this.listeners[eventType] = [];
    }
    if (_listeners.indexOf(handler) < 0) {
        _listeners.push(handler);
    }
    else {
        console.warn("Trying to add same listener");
    }
};


/**
 * Removes event listener
 * @param {string} eventType Event type
 * @param {Function} handler Method to execute when event happens
 */
fjs.EventsSource.prototype.removeEventListener = function (eventType, handler) {
    var _listeners = this.listeners[eventType], index;
    if (_listeners && (index= _listeners.indexOf(handler)) > -1) {
        _listeners.splice(index, 1);
    }
    else {
        console.warn("Trying to remove not existed listener");
    }
};

/**
 * Sends event to listeners
 * @param {string} eventType Event type
 * @param {Object} eventData Event object
 * @protected
 */
fjs.EventsSource.prototype.fireEvent = function (eventType, eventData) {
    var _listeners = this.listeners[eventType];
    if(_listeners) {
        var clonedListeners = _listeners.slice(0);
        for (var i = 0; i < clonedListeners.length; i++) {
            if(_listeners.indexOf(clonedListeners[i])>-1) {
                clonedListeners[i](eventData);
            }
        }
    }
};

