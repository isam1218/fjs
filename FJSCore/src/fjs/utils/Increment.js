(function(){
    var _Increment =
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
    _Increment.prototype.get = function(key) {
        if(!this.counters[key]) {
            this.counters[key] = 0;
        }
        return ++this.counters[key];
    };
    /**
     * Resets the incremental value (Sets incremental value to 0)
     * @param {string} key Key of incremental value
     */
    _Increment.prototype.clear = function(key) {
        this.counters[key] = 0;
    };
})();
