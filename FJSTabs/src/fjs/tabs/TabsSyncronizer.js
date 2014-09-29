(function(){

    fjs.core.namespace('fjs.tabs');
    var _TabsSynchronizer =
    /**
     * Manager is responsible for assign general tab (Synchronization tab)
     * <br>
     * <b>Singleton</b>
     * @constructor
     * @extends fjs.EventsSource
     */
    fjs.tabs.TabsSynchronizer = function() {
        if (!this.constructor.__instance)
            this.constructor.__instance = this;
        else return this.constructor.__instance;

        var context = this;

        fjs.model.EventsSource.call(this);

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
        this.isMaster = this._checkMaster();

        this.lastValues = {};

        this.lastMasterValue = null;

        this.hasChange = false;

        this.cookiesSynchronizationRuned = false;

        /**
         * runs master iteration
         * @private
         */
        this._runMaster = function() {
            context._masterIteration();
        };

        this.db = null;

        /**
         * @private
         */
        this._masterIteration = function() {
            if(fjs.utils.Browser.isIE11()) {
                fjs.utils.Cookies.set(context.TABS_SYNCRONIZE_KEY, context.tabId+"|"+Date.now());
            }
            else {
                fjs.utils.LocalStorage.set(context.TABS_SYNCRONIZE_KEY, context.tabId+"|"+Date.now());
            }
            if(!context.isMaster) {
                context.fireEvent('master_changed', (context.isMaster = true));
            }
            clearTimeout(context.timeoutId);
            context.timeoutId = setTimeout(context._masterIteration, context.MASTER_ACTIVITY_TIMEOUT);
        };

        this.onStorage = function(e) {
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
        };

        if(fjs.utils.Browser.isIE11()) {
            setInterval(function(){
                var syncVal = fjs.utils.Cookies.get(context.TABS_SYNCRONIZE_KEY);
                if(syncVal && syncVal!=context.lastMasterValue) {
                    context.onStorage({key: context.TABS_SYNCRONIZE_KEY, newValue: syncVal});
                    context.lastMasterValue = syncVal;
                }
            }, 0);
        }
        else {
            self.addEventListener('storage', context.onStorage, false);
        }

        if(this._checkMaster()){
            this._runMaster();
        }
        else {
            this.timeoutId = setTimeout(this._runMaster, this.CHANGE_TAB_TIMEOUT);
        }
    };
    fjs.core.inherits(fjs.tabs.TabsSynchronizer, fjs.model.EventsSource);

    fjs.tabs.TabsSynchronizer.prototype._checkMaster = function() {
        var lsvals;
        if(fjs.utils.Browser.isIE11()) {
            lsvals = fjs.utils.Cookies.get(this.TABS_SYNCRONIZE_KEY);
        }
        else {
            lsvals = fjs.utils.LocalStorage.get(this.TABS_SYNCRONIZE_KEY);
        }
        return !lsvals || (Date.now() - parseInt(lsvals.split("|")[1]))>this.CHANGE_TAB_TIMEOUT;
    };

  _TabsSynchronizer.prototype.addEventListener = function(eventType, handler) {
        var context = this;
        if(fjs.utils.Browser.isIE11() && eventType!='master_changed') {
            if(!this.lastValues[eventType])
                this.lastValues[eventType] = [];
            if(!this.cookiesSynchronizationRuned) {
                this.db = new fjs.db.DBFactory().getDB();
                setInterval(function(){
                    for(var key in context.lastValues) {
                        var _lastValues = context.lastValues[key];
                        if(context.db.state == 1) {
                            (function(_lastValues) {
                                context.db.selectByIndex('tabsync', {eventType: key}, function (item) {
                                }, function (items){
                                    if(items) {
                                        items.sort(function(a,b){
                                            if(a.order>b.order) return 1;
                                            else if(a.order<b.order) return -1;
                                            return 0;
                                        });
                                        for (var i = 0; i < items.length; i++) {
                                            var item = items[i], tkey = item.key;
                                            var keyarr = tkey.split('|');
                                            var now = Date.now();
                                            if(now - item.date > 10000) {
                                                context.db.deleteByKey("tabsync", item.key);
                                                continue;
                                            }
                                            if (_lastValues.indexOf(tkey) < 0 && keyarr[1] != context.tabId) {
                                                console.log("read", tkey);
                                                context.fireEvent(item.eventType, {key: item.eventType, newValue: item.val});
                                                _lastValues.push(tkey);
                                                (function (key) {
                                                    setTimeout(function () {
                                                        var index = _lastValues.indexOf(key);
                                                        if (index >= 0) {
                                                            _lastValues.splice(index, 1);
                                                        }
                                                    }, 10000);
                                                })(tkey);
                                            }
                                        }
                                    }
                                });
                            })(_lastValues);
                        }
                    }
                },1000);
            }
        }
    _TabsSynchronizer.super_.prototype.addEventListener.call(this, eventType, handler);
    };

  _TabsSynchronizer.prototype.removeEventListener = function(eventType, handler) {
        if(fjs.utils.Browser.isIE11()) {
            if(this.lastValues[eventType]) {
                var index = this.lastValues[eventType].indexOf(handler);
                if (index > -1) {
                    this.lastValues[eventType].splice(index, 1);
                }
                if (this.lastValues[eventType].length = 0) {
                    delete this.lastValues[eventType];
                }
            }
        }
    _TabsSynchronizer.super_.prototype.removeEventListener.call(this, eventType, handler);
    };

  _TabsSynchronizer.prototype.generateDataKey = function(eventType) {
        var inc = new fjs.utils.Increment();
        return eventType + "|" + this.tabId + "|" + inc.get("tabsyncKeys");
    };

  _TabsSynchronizer.prototype.setSyncValue = function(key, value) {
        if(this.db && this.db.state == 1) {
            var genKey = this.generateDataKey(key), context = this;
            var inc = new fjs.utils.Increment();
            (function(genKey){
                var now = Date.now();
                context.db.insertOne("tabsync", {key:genKey, eventType:key, val:value, order:now+""+inc.get('tabsSync'), date:now}, function(){
                    setTimeout(function(){
                        context.db.deleteByKey("tabsync", genKey);
                    },5000);
                });
            })(genKey);
        }
    };
})();
