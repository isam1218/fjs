(function () {
  var _FeedModel =
  /**
   * @param {string} feedName
   * @constructor
   * @extends fjs.model.EventsSource
   */
    fjs.model.FeedModel = function (feedName) {
      fjs.model.EventsSource.call(this);

      this.feedName = feedName;
      /**
       * @type {Object}
       */
      this.items = {};
      this.listeners = {};
      this.xpidListeners = new fjs.model.EventsSource();
    };

  fjs.core.inherits(_FeedModel, fjs.model.EventsSource);

  _FeedModel.EVENT_TYPE_START = "start";
  _FeedModel.EVENT_TYPE_PUSH = "push";
  _FeedModel.EVENT_TYPE_DELETE = "delete";
  _FeedModel.EVENT_TYPE_COMPLETE = "complete";

  /**
   * @param {string} xpid
   * @returns {fjs.model.EntryModel}
   */
  _FeedModel.prototype.getEntryByXpid = function (xpid) {
    return this.items[xpid];
  };

  /**
   * @param {fjs.model.ModelEvent} event
   */
  _FeedModel.prototype.onSyncStart = function (event) {
    this.fireEvent(_FeedModel.EVENT_TYPE_START, event);
  };

  /**
   * @param {fjs.model.ModelEvent} event
   */
  _FeedModel.prototype.onEntryDeletion = function (event) {
    event.entry = this.items[event.xpid];

    delete this.items[event.xpid];

    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_DELETE, event);

  };

  /**
   * @param {fjs.model.ModelEvent} event
   */
  _FeedModel.prototype.onEntryChange = function (event) {
    var entry = this.items[event.xpid];
    if (!entry) {
      event.isNew = true;
      entry = this.items[event.xpid] = this.createEntry(event.entry);
    }
    else {
      entry.fill(event.entry);
    }
    event.entry = entry;
    this.fireEvent(_FeedModel.EVENT_TYPE_PUSH, event);
  };

  /**
   * @param {fjs.model.ModelEvent} event
   */
  _FeedModel.prototype.onSyncComplete = function (event) {
    this.fireEvent(_FeedModel.EVENT_TYPE_COMPLETE, event);
  };

  /**
   * @param {string} eventType
   * @param {Function} listener
   */
  _FeedModel.prototype.addEventListener = function (eventType, listener) {
    _FeedModel.super_.prototype.addEventListener.call(this, eventType, listener);
    switch (eventType) {
      case _FeedModel.EVENT_TYPE_PUSH:
        var keys = Object.keys(this.items);
        for (var i = 0; i < keys.length; i++) {
          var xpid = keys[i];
          listener({eventType: _FeedModel.EVENT_TYPE_PUSH, xpid: xpid, entry: this.items[xpid]});
        }
        break;
      case _FeedModel.EVENT_TYPE_COMPLETE:
        listener({eventType: _FeedModel.EVENT_TYPE_COMPLETE});
        break;
      default:
    }
  };

  _FeedModel.prototype.addXpidListener = function (xpid, listener) {
    this.xpidListeners.addEventListener(xpid, listener);
    if (this.items[xpid]) {
      listener({eventType: _FeedModel.EVENT_TYPE_PUSH, xpid: xpid, entry: this.items[xpid]});
    }
  };

  _FeedModel.prototype.removeXpidListener = function (xpid, listener) {
    this.xpidListeners.removeEventListener(xpid, listener);
  };

  _FeedModel.prototype.fireEvent = function (eventType, data) {
    _FeedModel.super_.prototype.fireEvent.call(this, eventType, data);
    if (data.xpid) {
      this.xpidListeners.fireEvent(data.xpid, data);
    }
  };

  _FeedModel.prototype.createEntry = function (obj) {
    return new fjs.model.EntryModel(obj);
  };

  /**
   * @returns {Number}
   */
  _FeedModel.prototype.getItemsCount = function () {
    return Object.keys(this.items).length;
  };
})();
