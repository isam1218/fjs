(function(){
  var _EntryChangeModel =
  /**
   * Entry changes object
   * @param {Object} obj - Object of changed data
   * @constructor
   */
  fjs.fdp.model.EntryChangeModel = function(obj) {
    fjs.model.EntryModel.call(this, obj);
  };

  fjs.core.inherits(_EntryChangeModel, fjs.model.EntryModel);

  /**
   * Checks if a field is necessary to add to changes object.
   * @param {string} key - field name
   * @param {*} value - field value
   * @returns {boolean}
   */
  _EntryChangeModel.prototype.fieldPass = function(key, value) {
    var regexp = /(^\w+_xef001id$)|(^\w+_xef001type$)|(^\w+_xpid$)|(^\w+_source$)|(^xef001id$)|(^xef001type$)|(^source$)/;
    return !regexp.test(key);
  };
})();

