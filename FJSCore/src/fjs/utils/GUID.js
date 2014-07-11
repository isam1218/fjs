(function () {
    /**
     * Simulates generation Globally Unique Identifier (<a href='http://en.wikipedia.org/wiki/Globally_unique_identifier'>GUID</a>)
     * @class
     * @static
     */
    fjs.utils.GUID = {};

    function _s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
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
