(function(){
    /**
     * Manager is responsible for assign general tab (Synchronization tab)
     * <br>
     * <b>Singleton</b>
     * @constructor
     * @extends fjs.EventsSource
     */
    fjs.fdp.TabsSynchronizer = function() {
       if (!this.constructor.__instance)
           this.constructor.__instance = this;
       else return this.constructor.__instance;

       var context = this;

       fjs.EventsSource.call(this);

        /**
        * Time after which main tab may be change if previous tab silent or die
        * @type {number}
        * @private
        */
       this.CHANGE_TAB_TIMEOUT = 2000;
        /**
         * Interval that which the main tab says that he is alive
         * @type {number}
         * @private
         */
       this.MASTER_ACTIVITY_TIMEOUT = 500;
        /**
         * LocalStorage key for main tab id
         * @type {string}
         * @private
         */
       this.TABS_SYNCRONIZE_KEY = 'tabs_sync_maintab';
        /**
         * Tab ID
         * @type {string}
         */
       this.tabId = Date.now()+'_'+fjs.utils.GUID.create();
        /**
         * Timeout Id
         * @type {null}
         * @private
         */
       this.timeoutId  = null;
        /**
         * Is main tab flag
         * @type {boolean}
         */
       this.isMaster = false;

        /**
         * runs master iteration
         * @private
         */
        this._runMaster = function() {
            context._masterIteration();
        };

        /**
         * @private
         */
        this._masterIteration = function() {
            localStorage[context.TABS_SYNCRONIZE_KEY] = context.tabId+"|"+Date.now();
            if(!context.isMaster) {
                context.fireEvent('master_changed', (context.isMaster = true));
            }
            clearTimeout(context.timeoutId);
            context.timeoutId = setTimeout(context._masterIteration, context.MASTER_ACTIVITY_TIMEOUT);
        };

        window.addEventListener('storage', function(e) {
            if(e.key == context.TABS_SYNCRONIZE_KEY) {
                var lsvals = e.newValue.split("|");
                if(lsvals[0]!=context.tabId) {
                    if(context.tabId > lsvals[0]) {
                        if (context.isMaster) {
                            context.fireEvent('master_changed', (context.isMaster = false));
                        }
                        clearTimeout(context.timeoutId);
                        context.timeoutId = setTimeout(context._runMaster, context.CHANGE_TAB_TIMEOUT);
                    }
                }
            }
        }, false);

        var lsvals = localStorage[this.TABS_SYNCRONIZE_KEY];
        if(!lsvals || (Date.now() - parseInt(lsvals.split("|")[1]))>this.CHANGE_TAB_TIMEOUT){
            this._runMaster();
        }
        else {
            this.timeoutId = setTimeout(this._runMaster, this.CHANGE_TAB_TIMEOUT);
        }

   };
   fjs.fdp.TabsSynchronizer.extend(fjs.EventsSource);

    /**
     * Check if is necessary use local storage synchronization.
     * @returns {boolean|Object|*}
     */
    fjs.fdp.TabsSynchronizer.useLocalStorageSyncronization = function() {
        return typeof window != 'undefined' && window.document !== undefined || (self && self["web_worker"]);
    };
})();