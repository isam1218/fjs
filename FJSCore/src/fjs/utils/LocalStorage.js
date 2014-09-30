(function(){
  var _Console = fjs.utils.Console;
  var _LocalStorage =
  /**
     * Utils static class to simplify work with LocalStorage.
     * @constructor
     */
    fjs.utils.LocalStorage = function() {};

    /**
     * @type {boolean | null}
     * @private
     */
    _LocalStorage._enabled = null;

    /**
     * Checks if localStorage exist and enabled.
     * @returns {boolean}
     */
    _LocalStorage.check = function() {
        if(_LocalStorage._enabled!==null) {
            return _LocalStorage._enabled;
        }
        try {
            if(typeof self.localStorage === "undefined")
                return _LocalStorage._enabled = false;

            var test = 'test', val;
            localStorage.setItem(test, test);
            val = localStorage.getItem(test);
            localStorage.removeItem(test);
          _LocalStorage._enabled = !!val;
        } catch(e) {
          _LocalStorage._enabled = false;
        }
        return _LocalStorage._enabled;
    };

    /**
     * Safely gets localStorage value
     * @param {string} key - localStorage item key
     * @returns {string}
     */
    _LocalStorage.get = function(key) {
        if(_LocalStorage.check()) {
            return self.localStorage.getItem(key);
        }
        else {
          _Console.error("LocalStorage not allowed");
        }
    };

    /**
     * Safely sets localStorage value
     * @param {string} key - item key
     * @param {string} value - item value
     */
    _LocalStorage.set = function(key, value) {
        if(_LocalStorage.check()) {
            self.localStorage.setItem(key, value);
        }
        else {
          _Console.error("LocalStorage not allowed");
        }
    };

    /**
     * Safely removes localStorage value
     * @param {string} key - localStorage item key
     */
    _LocalStorage.remove = function(key) {
        if(_LocalStorage.check()) {
            self.localStorage.removeItem(key);
        }
        else {
          _Console.error("LocalStorage not allowed");
        }
    };
})();

