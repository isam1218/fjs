(function() {
    namespace("fjs.fdp.transport");
    /**
     * Base class of all FDPTransports based on AJAX.
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @constructor
     * @extends fjs.fdp.transport.FDPTransport
     * @abstract
     */
    fjs.fdp.transport.AJAXTransport = function(ticket, node, url, type) {

        fjs.fdp.transport.FDPTransport.call(this, ticket, node, url);
        /**
         * Ajax provider
         * @type {fjs.ajax.IAjaxProvider}
         * @protected
         */
        this.ajax = null;

        this.type = type;
        /**
         * @type {Array.<string>}
         * @private
         */
        this._forgetFeeds = [];
        /**
         * @type {number}
         * @private
         */
        this._clientRegistryFailedCount = 0;
        /**
         * @private
         */
        this._currentVersioncache = null;

        /**
         * @private
         */
        this._currentRequest = null;
        /**
         * Versions servlet URL
         * @const {string}
         * @protected
         */
        this.VERSIONS_PATH = "/v1/versions";
        /**
         * Versionscache servlet URL
         * @const {string}
         * @protected
         */
        this.VERSIONSCACHE_PATH = "/v1/versionscache";
        /**
         * Client registry servlet URL
         * @const {string}
         * @protected
         */
        this.CLIENT_REGISRY_PATH = "/accounts/ClientRegistry";
        /**
         * Sync servlet URL
         * @const {string}
         * @protected
         */
        this.SYNC_PATH = "/v1/sync";

        this.SF_LOGIN_PATH = "/accounts/salesforce";


        /**
         * Transport is stoped
         * @type {boolean}
         * @protected
         */
        this.closed = false;

        /**
         * @type {number}
         * @private
         */
        this.versionsCacheFailedCount = 0;

    };
    fjs.fdp.transport.AJAXTransport.extend(fjs.fdp.transport.FDPTransport);

    /**
     * Sends request use self ajax provider
     * @param {string} url Request URL
     * @param {Object} data Request data
     * @param {Function} callback Success handler
     * @abstract
     */
    fjs.fdp.transport.AJAXTransport.prototype.sendRequest = function (url, data, callback) {
    };

    /**
     *  This method provides all actions to works with simple FDP synchronization.
     *  Exist 3 message types:
     *  <ul>
     *      <li>
     *          'action' - sends action to FDP server
     *      </li>
     *      <li>
     *          'synchronize' - starts synchronisation for list of feeds
     *      </li>
     *      <li>
     *          'forget' - ends synchronization for feed
     *      </li>
     *  </ul>
     * @param {Object} message - Action message
     * @abstract
     */
    fjs.fdp.transport.AJAXTransport.prototype.send = function(message) {
        switch(message.type) {
            case 'action':
                this.sendAction(message.data.feedName, message.data.actionName, message.data.parameters);
                break;
            case 'loadNext':
                this.loadNext(message);
                break;
            case 'synchronize':
                this.requestVersions(message.data.versions);
                break;
            case 'forget':
                this._forgetFeed(message.data.feedName);
                break;
            case 'SFLogin':
                this.SFLogin(message.data);
                break;
        }
    };

    fjs.fdp.transport.AJAXTransport.prototype.SFLogin = function(data){
        var context = this;
        this.sendRequest(this.url+this.SF_LOGIN_PATH, data, function(xhr, data, isOk){
              if(isOk) {
                  var _data = fjs.utils.JSON.parse(data);
                  var ticket = _data["Auth"];
                  var node = _data["node"];
                  if(ticket && node) {
                      context.fireEvent('message', {type:'node', data:{nodeId:(context.node = node)}});
                      context.fireEvent('message', {type:'ticket', data:{ticket:(context.ticket = ticket)}});
                  }
                  else {
                      context.fireEvent('error', {type:'authError', message:"Can't get ticket or node"});
                  }
              }
              else {
                  context.fireEvent('error', {type:'requestError', requestType:'sfLogin', message:'SF login request failed', status:request.status});
              }
          });
    };

    fjs.fdp.transport.AJAXTransport.prototype.loadNext = function(message) {
        var _data = message.data, context = this;
        this.sendRequest(this.url+"/v1/history/"+_data.feedName, _data.data, function(xhr, data, isOk) {
            if(isOk) {
                data = fjs.utils.JSON.parse(data);
                var syncData = {};
                syncData[_data.feedName] = data;

                for (var key in data) {
                    if(data.hasOwnProperty(key)) {
                        data[key].filter = _data.data["sh.filter"];
                    }
                }
                context.fireEvent('message', {type: 'sync', data: syncData});
            }
        });
    };

    /**
     * @param feedName
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype._forgetFeed = function(feedName) {
        if(this._forgetFeeds.indexOf(feedName)<0)  {
            this._forgetFeeds.push(feedName);
        }
    };

    /**
     * @param {string} data
     * @returns {Object}
     */
    fjs.fdp.transport.AJAXTransport.prototype.parseClientRegistryResponse= function(data) {
        var dataArr = data.split('\n');
        var result = {};
        for(var i=0; i<dataArr.length; i++) {
            if(dataArr[i].indexOf("=")>-1) {
                var itemArr = dataArr[i].split("=");
                var key = itemArr[0].trim();
                var val = itemArr[1].trim();
                if(key && val) {
                    result[key] = val;
                }
            }
        }
        return result;
    };

    /**
     * ClientRegistry request
     * @param callback
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.requestClientRegistry = function(callback) {
        /**
         * @type {fjs.fdp.transport.AJAXTransport}
         */
        var context = this;
        var url = this.url+this.CLIENT_REGISRY_PATH;
        this._currentRequest = this.sendRequest(url, {}, function(request, data, isOk) {
            if(isOk) {
                this._clientRegistryFailedCount = 0;
                var _data = context.parseClientRegistryResponse(data), node = _data["node"];
                if(node) {
                    context.fireEvent('message', {type:'node', data:{nodeId:(context.node = node)}});
                    callback(data);
                }
            }
            else {
                if(request.status == 403) {
                    callback(false);
                    context.fireEvent('error', {type:'authError', message:'Auth ticket wrong or expired'});
                }
                else {
                    if(this._clientRegistryFailedCount < 10) {
                        this._clientRegistryFailedCount++;
                        context.requestClientRegistry(callback);
                    }
                    else {
                        callback(false);
                        context.fireEvent('error', {type:'requestError', requestType:'clientRegistry', message:'clientRegistry request failed', status:request.status})
                    }
                }
            }
        });
    };
    /**
     * Versionscache request
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.requestVersionscache = function() {
        var context = this;
        var url = this.url+this.VERSIONSCACHE_PATH;
        this._currentRequest = this._currentVersioncache = this.sendRequest(url, null, function(request, data, isOk) {
            if(isOk) {
                context._clientRegistryFailedCount = 0;
                var feeds = context.parseVersionsResponse(data);
                if(feeds) {
                    context.syncRequest(feeds);
                }
                else {
                    context.requestVersionscache();
                }
            }
            else {
                if(request.status == 401 || request.status == 403) {
                    context.requestClientRegistry(function(isOK) {
                        if(isOK) {
                            context.requestVersionscache();
                        }
                    });
                }
                else if(!request["aborted"]) {
                    if (context._clientRegistryFailedCount < 5) {
                        context.requestVersionscache();
                        context._clientRegistryFailedCount++;
                    }
                    else if (context._clientRegistryFailedCount >= 5) {
                        setTimeout(function () {
                            context.requestVersionscache()
                        }, 5000);
                    }
                    context.fireEvent('error', {type: 'requestError', requestType: 'syncRequest', message: 'Sync request error', status:request.status});
                }
            }
        });
    };

    /**
     * Sync request
     * @param {Object} feeds
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.syncRequest = function(feeds) {
        var context = this, url = this.url+this.SYNC_PATH;
        this._currentRequest = this.sendRequest(url, feeds, function(xhr, data, isOK) {
            if(isOK) {
                data = fjs.utils.JSON.parse(data);
                context.fireEvent('message', {type: 'sync', data:data});
                context.requestVersionscache();
            }
            else if(!xhr["aborted"]) {
                context.fireEvent('error', {type: 'requestError', requestType: 'syncRequest', message: 'Sync request error', status:request.status});
            }
        });
    };


    /**
     * @param {string} data
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.parseVersionsResponse = function(data) {
        //TODO: parse db and server versions;
        var params = data.split(";"), feeds = {}, feedsCount = 0, forgetFeedIndex;
        if(params) {
            for(var i=2; i<params.length-1; i++) {
                if(params[i]) {
                    if((forgetFeedIndex = this._forgetFeeds.indexOf(params[i]))<0) {
                        feeds[params[i]] = "";
                    }
                    else {
                        this._forgetFeeds.splice(forgetFeedIndex, 1);
                    }
                    feedsCount++;
                }
            }
        }
        return feedsCount ? feeds : null;
    };

    /**
     * Versions request
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.requestVersions = function(versions) {
        var context = this;
        if(this._currentVersioncache!=null) {
            this.ajax.abort(this._currentVersioncache);
        }
        if(!this.node) {
            return this.requestClientRegistry(function(isOk) {
                if(isOk) {
                    context.requestVersions(versions);
                }
            });
        }

        var url = this.url+this.VERSIONS_PATH;

        this._currentRequest = this.sendRequest(url, versions, function(xhr, data, isOk) {
            if(isOk) {
                var feeds = context.parseVersionsResponse(data);
                if(feeds) {
                    context.syncRequest(feeds);
                }
                else {
                    context.requestVersionscache();
                }
            }
            else {
                if(xhr.status == 401 || xhr.status == 403) {
                    context.requestClientRegistry(function(isOk) {
                        if(isOk) {
                            context.requestVersions(versions);
                        }
                    });
                }
                else if(!xhr["aborted"]) {
                    context.fireEvent('error', {type: 'requestError', requestType: 'versionsRequest', message: 'Versions request error', status:request.status});
                }
            }
        });
    };
    /**
     * Sends action to FDP server
     * @param {string} feedName Feed name
     * @param {string} actionName Action name
     * @param {Object} parameters Request parameters ({'key':'value',...})
     */
    fjs.fdp.transport.AJAXTransport.prototype.sendAction = function(feedName, actionName, parameters) {
        var context = this;
        var data = {
            action:actionName
        };
        for(var key in parameters) {
            if(parameters.hasOwnProperty(key)) {
                data["a."+key] = parameters[key];
            }
        }
        this.sendRequest(this.url+"/v1/"+feedName, data, function(xhr, response, isOK){
            if(!isOK) {
                if(!xhr["aborted"]) {
                    context.fireEvent('error', {type: 'requestError', requestType: 'actionRequest', message: 'Action request error', status:request.status});
                }
            }
        });
    };

    /**
     * Ends synchronization throws this transport
     * @abstract
     */
    fjs.fdp.transport.AJAXTransport.prototype.close = function() {
        this.closed = true;
        if(this._currentRequest) {
            this.ajax.abort(this._currentRequest);
        }
    };
})();