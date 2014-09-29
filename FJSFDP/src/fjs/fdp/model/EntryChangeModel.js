(function(){
  var _EntryChangeModel =
  /**
   *
   * @param obj
   * @constructor
   */
  fjs.fdp.model.EntryChangeModel = function(obj) {
    fjs.model.EntryModel.call(this, obj);
  };

  fjs.core.inherits(_EntryChangeModel, fjs.model.EntryModel);

  _EntryChangeModel.prototype.fieldPass = function(key, value) {
    var regexp = /(^\w+_xef001id$)|(^\w+_xef001type$)|(^\w+_xpid$)|(^\w+_source$)|(^xef001id$)|(^xef001type$)|(^source$)/;
    return !regexp.test(key);
  };
})();

