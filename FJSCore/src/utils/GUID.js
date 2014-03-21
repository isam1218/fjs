(function () {
    /**
     * Simulates generation Globally Unique Identifie (<a href='http://en.wikipedia.org/wiki/Globally_unique_identifier'>GUID</a>)
     * @class
     * @static
     */
    fjs.utils.GUID = {};

    function _s4() {
        var now = new Date();
        var seed = now.getSeconds();
        return ((1 + Math.random(seed)) * parseInt('10000', 16)).toString(16).substring(1, 5);
    }

    /**
     * Empty GUID ('00000000-0000-0000-0000-000000000000')
     * @const {String}
     */
    fjs.utils.GUID.empty = "00000000-0000-0000-0000-000000000000";

    /**
     * Generates Unique Identifie ('GUID')
     * @returns {string}
     */
    fjs.utils.GUID.create = function () {
        return (_s4() + _s4() + "-" + _s4() + "-" + _s4() + "-" + _s4() + "-" + _s4() + _s4() + _s4()).toUpperCase();
    }

})();
