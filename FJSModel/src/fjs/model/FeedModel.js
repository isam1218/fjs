(function () {
  var _FeedModel =
  /**
   * Base feed model
   * @param {string} feedName - Feed name
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

      this.xpidListeners = new fjs.model.EventsSource();
    };

  fjs.core.inherits(_FeedModel, fjs.model.EventsSource);

  _FeedModel.EVENT_TYPE_START = "start";
  _FeedModel.EVENT_TYPE_PUSH = "push";
  _FeedModel.EVENT_TYPE_DELETE = "delete";
  _FeedModel.EVENT_TYPE_COMPLETE = "complete";

  /**
   * Returns entry model by id
   * @param {string} xpid
   * @returns {fjs.model.EntryModel}
   */
  _FeedModel.prototype.getEntryByXpid = function (xpid) {
    return this.items[xpid];
  };

  /**
   * Starting of changes
   * @param {fjs.model.ModelEvent} event
   */
  _FeedModel.prototype.onSyncStart = function (event) {
    this.fireEvent(_FeedModel.EVENT_TYPE_START, event);
  };

  /**
   * Entry is removed
   * @param {fjs.model.ModelEvent} event
   */
  _FeedModel.prototype.onEntryDeletion = function (event) {
    event.entry = this.items[event.xpid];

    delete this.items[event.xpid];

    this.fireEvent(fjs.model.FeedModel.EVENT_TYPE_DELETE, event);

  };

  /**
   * New entry or entry is changed
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
   * End of changes
   * @param {fjs.model.ModelEvent} event
   */
  _FeedModel.prototype.onSyncComplete = function (event) {
    this.fireEvent(_FeedModel.EVENT_TYPE_COMPLETE, event);
  };

  /**
   * Adds event listener
   * @param {string} eventType - event type ("start"|"push"|"delete"|"complete")
   * @param {Function} listener - event listener function
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

  /**
   * Adds listener on changes of specified entry
   * @param {string} xpid - entry id
   * @param {Function} listener - event listener function
   */
  _FeedModel.prototype.addXpidListener = function (xpid, listener) {
    this.xpidListeners.addEventListener(xpid, listener);
    if (this.items[xpid]) {
      listener({eventType: _FeedModel.EVENT_TYPE_PUSH, xpid: xpid, entry: this.items[xpid]});
    }
  };

  /**
   * Removes listener from events of specified entry
   * @param {string} xpid - entry id
   * @param {Function} listener - event listener function
   */
  _FeedModel.prototype.removeXpidListener = function (xpid, listener) {
    this.xpidListeners.removeEventListener(xpid, listener);
  };

  /**
   * Sends event to listeners
   * @param {string} eventType - Event type
   * @param {*} data - Event object
   */
  _FeedModel.prototype.fireEvent = function (eventType, data) {
    _FeedModel.super_.prototype.fireEvent.call(this, eventType, data);
    if (data.xpid) {
      this.xpidListeners.fireEvent(data.xpid, data);
    }
  };

  /**
   * Creates new entry model from data object
   * @param {Object} obj - data object
   * @returns {fjs.model.EntryModel}
   */
  _FeedModel.prototype.createEntry = function (obj) {
    return new fjs.model.EntryModel(obj);
  };

  /**
   * Returns number of entries
   * @returns {Number}
   */
  _FeedModel.prototype.getItemsCount = function () {
    return Object.keys(this.items).length;
  };
})();
