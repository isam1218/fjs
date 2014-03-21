(function(){
    /**
     * @constructor
     * @extends fjs.EventsSource
     */
    fjs.fdp.TabsSyncronizer = function() {
       if (!this.constructor.__instance)
           this.constructor.__instance = this;
       else return this.constructor.__instance;

       var context = this;

       fjs.EventsSource.call(this);

       this.CHANGE_TAB_TIMEOUT = 2000;
       this.MASTER_ACTIVITY_TIMEOUT = 500;
       this.TABS_SYNCRONIZE_KEY = 'tabs_sync_maintab';
       this.tabId = Date.now()+'_'+fjs.utils.GUID.create();
       this.timeoutId  = null;
       this.isMaster = false;

        this._runMaster = function() {
            context._masterIteration();
        };

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
    fjs.fdp.TabsSyncronizer.extend(fjs.EventsSource);



    fjs.fdp.TabsSyncronizer.useLocalStorageSyncronization = function() {
        return !(window.document === undefined) || (self && self["web_worker"]);
    };
})();