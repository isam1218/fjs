(function() {
    /**
     * Base class of all FDPTransports based on AJAX.
     * @param {string} ticket Auth ticket
     * @param {string} node Node ID
     * @param {string} url FDP server URL
     * @param {string} type - Client type
     * @constructor
     * @extends fjs.fdp.transport.FDPTransport
     * @abstract
     */
    fjs.fdp.transport.AJAXTransport = function(ticket, node, url, type) {

        fjs.fdp.transport.FDPTransport.call(this, ticket, node, url);
        /**
         * Ajax provider
         * @type {fjs.ajax.AjaxProviderBase}
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

        this.isNetworkProblem = true;

    };
    fjs.core.inherits(fjs.fdp.transport.AJAXTransport, fjs.fdp.transport.FDPTransport);

    /**
     * Sends request use self ajax provider
     * @param {string} url Request URL
     * @param {Object} data Request data
     * @param {Function} callback Success handler
     * @abstract
     */
    fjs.fdp.transport.AJAXTransport.prototype.sendRequest = function (url, data, callback) {

    };

    fjs.fdp.transport.AJAXTransport.prototype.handleRequestErrors = function(request, isOk) {
        if(!isOk && request.status==0 && !request["aborted"]) {
            this.fireEvent('error', {type:'networkProblem'});
            this.isNetworkProblem = true;
            return;
        }
        else if(!isOk) {
            var event = {type:'requestError', requestUrl:request.url, message: (request.responseText || 'Request failed'), status:request.status};
            this.fireEvent('error', event);
            fjs.utils.Console.error(event);
        }
        if(this.isNetworkProblem) {
            this.fireEvent('message', {type:'connectionEstablished'});
            this.isNetworkProblem = false;
        }
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
        this._currentRequest = this.sendRequest(this.url+this.SF_LOGIN_PATH, data, function(xhr, data, isOk){
            try  {
            if(isOk) {
                  var _data = fjs.utils.JSON.parse(data), ticket, node;
                  if(_data && (ticket = _data["Auth"]) && (node = _data["node"])) {
                          context.fireEvent('message', {type: 'node', data: {nodeId: (context.node = node)}});
                          context.fireEvent('message', {type: 'ticket', data: {ticket: (context.ticket = ticket)}});
                  }
                  else {
                      context.fireEvent('error', {type:'authError', message:"Can't get ticket or node"});
                  }
              }
              else if(xhr.status == 403 || xhr.status == 401) {
                  context.fireEvent('error', {type:'authError', message:(data ? data.replace('Error=', '') : "Wrong auth data")});
              }
              context.handleRequestErrors(xhr, isOk);
            } catch (e) {
                context.fireEvent('error', {type:'authError', message:"Can't get ticket or node"});
            }
          });
    };

    fjs.fdp.transport.AJAXTransport.prototype.loadNext = function(message) {
        var _data = message.data, context = this;
        this._currentRequest = this.sendRequest(this.url+"/v1/history/"+_data.feedName, _data.data, function(xhr, data, isOk) {
            if(isOk) {
                data = fjs.utils.JSON.parse(data);
                var syncData = {};
                syncData[_data.feedName] = data;
                var keys = Object.keys(data);
                for(var i=0; i<keys.length; i++) {
                  var key = keys[i];
                  data[key].filter = _data.data["sh.filter"];
                }
                context.fireEvent('message', {type: 'sync', data: syncData});
            }
            context.handleRequestErrors(xhr, isOk);
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
		
		// if empty, return original data
        return Object.keys(result).length > 0 ? result : JSON.parse(dataArr[0]);
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
                context._clientRegistryFailedCount = 0;
                var _data = context.parseClientRegistryResponse(data), node = _data["node"];
                if(node) {
                    context.fireEvent('message', {type:'node', data:{nodeId:(context.node = node)}});
                    callback(data);
                }
            }
            else {
                if(request.status == 403 || request.status == 401) {
                    callback(false);
                    context.fireEvent('error', {type:'authError', message:'Auth ticket wrong or expired'});
                }
                else {
                    if(context._clientRegistryFailedCount < 10) {
                        context._clientRegistryFailedCount++;
                        context.requestClientRegistry(callback);
                    }
                    else {
                        callback(false);
                    }
                }
            }
            context.handleRequestErrors(request, isOk);
        });
    };
    /**
     * Versionscache request
     * @private
     */
    fjs.fdp.transport.AJAXTransport.prototype.requestVersionscache = function() {
        var context = this;
        var url = this.url+this.VERSIONSCACHE_PATH;
        this._currentRequest = this.sendRequest(url, null, function(request, data, isOk) {
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
                  context.fireEvent('error', {type:'versionscacheFail'});
                }
            }
            context.handleRequestErrors(request, isOk);
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
            else {
                context.requestVersionscache();
            }
            context.handleRequestErrors(xhr, isOK);
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
        if(this._currentRequest!=null) {
            this.ajax.abort(this._currentRequest);
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
              context.versionsCacheFailedCount = 0;
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
                  if (context.versionsCacheFailedCount < 5) {
                    context.requestVersions(versions);
                    context.versionsCacheFailedCount++;
                  }
                  else if (context.versionsCacheFailedCount >= 5) {
                    setTimeout(function () {
                      context.requestVersions(versions);
                    }, 5000);
                  }
                }
                else {
                  console.error('aborted');
                }

            }
            context.handleRequestErrors(xhr, isOk);
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
            action: actionName
        };
        var keys = Object.keys(parameters);
        for(var i=0; i <keys.length; i++) {
          var key = keys[i];
          data["a."+key] = parameters[key];
        }

        this._currentRequest = this.sendRequest(this.url+"/v1/"+feedName, data, function(xhr, response, isOK){
            context.handleRequestErrors(xhr, isOK);
            if(isOK) {

            }
            else {
                if(xhr.status == 401 || xhr.status == 403) {
                    context.requestClientRegistry(function(isOK) {
                        if(isOK) {
                            context.sendAction(feedName, actionName, parameters);
                        }
                    });
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
