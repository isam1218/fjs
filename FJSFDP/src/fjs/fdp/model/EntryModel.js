(function(){
  var _EntryModel =
  /**
   * FDP Entry model
   * @param {Object} obj - Object of changed data
   * @param {string} xpid - Entry id
   * @constructor
   */
fjs.fdp.model.EntryModel = function(obj, xpid) {
    this.xpid = xpid;
    fjs.model.EntryModel.call(this, obj);
};
fjs.core.inherits(_EntryModel, fjs.model.EntryModel);

  /**
   * Fills model from data object and returns only changed fields
   * @param {Object} obj - data object
   * @return {Object|null}
   */
  _EntryModel.prototype.fill = function(obj) {
    var changes = {};
    if(obj) {
        var keys = Object.keys(obj);
        for (var i=0; i<keys.length; i++) {
            var key = keys[i];
            if((this[key] !== obj[key] && this.fieldPass(key, obj[key]))) {
                this[key] = obj[key];
                changes[key] = this[key];
            }
        }

        if(Object.keys(changes).length>0) {
            if(!changes['xpid']) {
                changes['xpid'] = this.xpid;
            }
            return changes;
        }
    }
    return null;
};
})();
