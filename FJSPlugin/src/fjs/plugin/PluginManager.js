
(function() {
  fjs.core.namespace("fjs.plugin");
  window.onloadedplugin = function() {
    new fjs.plugin.PluginManager()._onLoaded();
  };

  var _PluginManager =
  /**
   * @constructor
   */
  fjs.plugin.PluginManager = function(config, authTicket, node_id) {
    this.config = config || {};
    //Singleton
    if (!this.constructor.__instance)
      this.constructor.__instance = this;
    else return this.constructor.__instance;

    fjs.model.EventsSource.call(this);

    this.tryAuthorizeCount = 0;
    this.instanseId = null;

    this.pluginLoaded = false;
    this.pluginObject = null;
    this.pluginVersion = null;
    this.session = null;
    this.loginData = {authTicket:authTicket, node_id:node_id, server:config.SERVER.serverURL};
    this.init(authTicket);
    this.login();
  };

  fjs.core.inherits(fjs.plugin.PluginManager, fjs.model.EventsSource);

  _PluginManager.SES_STATUS_READY = 0;
  _PluginManager.SES_STATUS_UNAUTHORIZED = 1;
  _PluginManager.SES_STATUS_NOTPERMITTED = 2;

  _PluginManager.PLUGIN_NAME = 'FonalityPlugin';
  _PluginManager.PLUGIN_MIME_TYPE = 'application/x-fonalityplugin';
  _PluginManager.PLUGIN_ACTIVEX_NAME = 'Fonality.FonalityPlugin';

  /**
   * @returns {HTMLElement}
   * @private
   */
  _PluginManager.prototype._createObject = function() {
    var pluginContainer = document.createElement('div');
    document.body.appendChild(pluginContainer);
    pluginContainer.innerHTML =
      '<object id="fonalityPhone" border="0" width="1" type="'+_PluginManager.PLUGIN_MIME_TYPE+'" height="1">' +
      '<param name="onload" value="onloadedplugin" />' +
      '</object>';
    return document.getElementById("fonalityPhone");
  };

  _PluginManager.prototype.onError = function(e) {
    this.fireEvent("PluginError", e);
  };


  _PluginManager.prototype.init = function(instanceId) {
    this.instanseId = instanceId || "unknown";
    this.pluginObject = this._createObject();
    this.pluginObject.onerorr = this.onError;
  };

  _PluginManager.prototype.login = function() {
    if(!this.pluginLoaded) {
      return;
    }
    this.session.authorize(this.loginData.authTicket, this.loginData.node_id, this.loginData.server);
  };


  _PluginManager.prototype._onLoaded = function() {
    this.pluginLoaded = true;
    this.pluginVersion = this.pluginObject.version;
    this.fireEvent("PluginLoaded", {version:this.pluginVersion});

    this.session = this.pluginObject.getSession(this.instanseId);
    this.attachPluginEvents(this.session);

    if(this.loginData) {
      this.login();
    }
  };

  _PluginManager.prototype.attachPluginEvents = function(session) {
    var context = this;
    if(session.addEventListener) {
      session.addEventListener("Status", function (session) {
        context._onSessionStatusChanged(session);
      }, false);
    }
    else if(session.attachEvent) {
      session.attachEvent("onStatus", function (session) {
        context._onSessionStatusChanged(session);
      });
    }
  };

  _PluginManager.prototype._onSessionStatusChanged = function(session) {
    if(session.status == _PluginManager.SES_STATUS_UNAUTHORIZED) {
      if (this.tryAuthorizeCount < 5) {
        this.login();
        this.tryAuthorizeCount++;
      }
      else {
        this.fireEvent("SessionStatusChanged", session);
      }
    }
    else {
      this.tryAuthorizeCount = 0;
      this.fireEvent("SessionStatusChanged", session);
    }
  };


  _PluginManager.prototype.isReady = function() {
    var status = this.getSessionStatus();
    return (status == _PluginManager.SES_STATUS_READY || status  == _PluginManager.SES_STATUS_NOTPERMITTED);
  };

  _PluginManager.prototype.isNotPermitted = function() {
    return this.getSessionStatus() == _PluginManager.SES_STATUS_NOTPERMITTED;
  };

  _PluginManager.prototype.getSession = function() {
    return this.session;
  };

  _PluginManager.prototype.getSessionStatus = function() {
    return this.session ? this.session.status : _PluginManager.SES_STATUS_UNAUTHORIZED;
  };

  _PluginManager.check = function() {
    try {
      if (window.ActiveXObject) {
        return !!new ActiveXObject(_PluginManager.PLUGIN_ACTIVEX_NAME);
      }
      else if (navigator.plugins) {
        return typeof (navigator.plugins[_PluginManager.PLUGIN_NAME]) != "undefined";
      }
    }
    catch (e){}
    return false;
  };
})();
