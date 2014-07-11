/**
 * Utils static class to simplify work with LocalStorage.
 * @constructor
 */
fjs.utils.LocalStorage = function() {

};

/**
 * @type {boolean | null}
 * @private
 */
fjs.utils.LocalStorage._enabled = null;

/**
 * Checks if localStorage exist and enabled.
 * @returns {boolean}
 */
fjs.utils.LocalStorage.check = function() {
    if(fjs.utils.LocalStorage._enabled!==null) {
        return fjs.utils.LocalStorage._enabled;
    }
    try {
        if(typeof self.localStorage === "undefined")
            return fjs.utils.LocalStorage._enabled = false;

        var test = 'test', val = null;
        localStorage.setItem(test, test);
        val = localStorage.getItem(test);
        localStorage.removeItem(test);
        fjs.utils.LocalStorage._enabled = !!val;
    } catch(e) {
        fjs.utils.LocalStorage._enabled = false;
    }
    return fjs.utils.LocalStorage._enabled;
};

/**
 * Safely gets localStorage value
 * @param {string} key - localStorage item key
 * @returns {string}
 */
fjs.utils.LocalStorage.get = function(key) {
    if(fjs.utils.LocalStorage.check()) {
        return self.localStorage.getItem(key);
    }
};

/**
 * Safely sets localStorage value
 * @param {string} key - item key
 * @param {string} value - item value
 */
fjs.utils.LocalStorage.set = function(key, value) {
    if(fjs.utils.LocalStorage.check()) {
        self.localStorage.setItem(key, value);
    }
};

/**
 * Safely removes localStorage value
 * @param {string} key - localStorage item key
 */
fjs.utils.LocalStorage.remove = function(key) {
    if(fjs.utils.LocalStorage.check()) {
        self.localStorage.removeItem(key);
    }
};

