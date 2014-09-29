(function() {
  var _EntryModel =
  /**
   * @param {Object} obj
   * @constructor
   */
  fjs.model.EntryModel = function (obj) {
    this.fill(obj);
  };
  /**
   * @param {Object} obj
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
   * @param {string} key
   * @param {*} value
   */
  _EntryModel.prototype.applyField = function (key, value) {
    if (this.fieldPass(key, value)) {
      this[key] = value;
    }
  };
  /**
   * @param {string} key
   * @param {*} value
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
