(function(){
  var _EntryModel =
  /**
   *
   * @param obj
   * @param xpid
   * @constructor
   */
fjs.fdp.model.EntryModel = function(obj, xpid) {
    this.xpid = xpid;
    fjs.model.EntryModel.call(this, obj);
};
fjs.core.inherits(_EntryModel, fjs.model.EntryModel);

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
