(function() {
  var _EntryChange =
  /**
   * Change event data wrapper
   * @param {string} feedName - Feed name
   * @param {string} xpid - entry id
   * @param {fjs.fdp.model.EntryModel} entry - entry model
   * @param {string} type - Change type ('change' or 'delete')
   * @constructor
   */
    fjs.fdp.model.EntryChange = function (feedName, xpid, entry, type) {
        this.xpid = xpid;
        /**
         * @type {fjs.fdp.model.EntryChangeModel}
         */
        this.entry = entry ? new fjs.fdp.model.EntryChangeModel(entry) : null;

        this.type = type;

        this.feedName = feedName;
    };
    _EntryChange.CHANGE_TYPE_CHANGE = 'change';
    _EntryChange.CHANGE_TYPE_DELETE = 'delete';

  /**
   * Accepts data changes for entry and creates changes set
   * @param {fjs.fdp.model.EntryModel} item - Entry model
   * @param {Object} changes Data object with changes
   * @param {string} feedName - Feed name
   */
  _EntryChange.prototype.fillChange = function (item, changes, feedName) {
        var _changes = this.prepareChange(changes, feedName);
        if (this.type != _EntryChange.CHANGE_TYPE_DELETE) {
            this.type = _EntryChange.CHANGE_TYPE_CHANGE;
            if(!this.entry) {
                this.entry = new fjs.fdp.model.EntryChangeModel();
            }
            this.entry.fill(item.fill(_changes));
        }
        else {
            fjs.utils.Console.error('Change for deleted parent entry');
        }
    };

  /**
   * Accepts deletion
   * @param {fjs.fdp.model.EntryModel} item - Entry model
   * @param {string} feedName - Feed name
   */
  _EntryChange.prototype.fillDeletion= function(item, feedName) {
        if(feedName==this.feedName) {
            this.type = _EntryChange.CHANGE_TYPE_DELETE;
            this.entry = null;
        }
        else if (this.type != _EntryChange.CHANGE_TYPE_DELETE) {
            this.type = _EntryChange.CHANGE_TYPE_CHANGE;
            if(!this.entry) {
                this.entry = new fjs.model.EntryModel();
            }
            var keys = Object.keys(item);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (new RegExp("^" + feedName + "_\\w+$").test(key)) {
                    this.entry.applyField(key, null);
                    delete item[key];
                }
            }
        }
    };
  /**
   * Adds prefixes to fields names for joined feeds
   * @param {Object} changes - Data set of changes
   * @param {string} feedName - Feed name
   * @returns {Object}
   * @private
   */
  _EntryChange.prototype.prepareChange = function(changes, feedName) {
        if(!changes.xpid) {
            changes.xpid = this.xpid;
        }
        if(this.feedName!=feedName) {
            var _changes = {}, prefix=feedName+'_';
            var keys = Object.keys(changes);
            for(var i=0; i <keys.length; i++) {
                _changes[prefix+keys[i]] = changes[keys[i]];
            }
            return _changes;
        }
        else {
            return changes;
        }
    };
  /**
   * Creates JSON object for change.
   * @returns {{xpid: *, type: *, entry: *}}
   */
  _EntryChange.prototype.getJSON = function() {
        return {
            xpid:this.xpid
            , type: this.type
            , entry: this.entry
        }
    }
})();
