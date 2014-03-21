(function(){
    /**
     * Class to create incremental values
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
     * @param {string} key
     * @returns {number}
     */
    fjs.utils.Increment.prototype.get = function(key) {
        if(!this.counters[key]) {
            this.counters[key] = 0;
        }
        return ++this.counters[key];
    };
    /**
     * Sets increment value to 0
     * @param {string} key
     */
    fjs.utils.Increment.prototype.clear = function(key) {
        this.counters[key] = 0;
    };
})();
