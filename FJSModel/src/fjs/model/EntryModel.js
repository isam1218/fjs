(function() {
  var _EntryModel =
  /**
   * Entry model base
   * @param {Object} obj - data object
   * @constructor
   */
  fjs.model.EntryModel = function (obj) {
    this.fill(obj);
  };
  /**
   * Fills model from data object
   * @param {Object} obj - data object
   */
  _EntryModel.prototype.fill = function (obj) {
    if (obj) {
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        this.applyField(key, obj[key]);
      }
    }
  };
  /**
   * Assigns data field to model.
   * @param {string} key - field name
   * @param {*} value - field value
   */
  _EntryModel.prototype.applyField = function (key, value) {
    if (this.fieldPass(key, value)) {
      this[key] = value;
    }
  };
  /**
   * Checks if field can be assigned
   * @param {string} key - field name
   * @param {*} value - field value
   * @returns {boolean}
   */
  _EntryModel.prototype.fieldPass = function (key, value) {
    return true;
  };
  /**
   * Sets null value for all fields
   */
  _EntryModel.prototype.clear = function () {
    var keys = Object.keys(this);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      this[key] = null;
    }
  };
})();
