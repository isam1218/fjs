namespace("fjs.fdp");
/**
 * Wrapper class for data entries received form FDP server. <br>
 * It sets the basic structure of entry model, and provides a mechanism for update entry.
 * @param {Object} obj
 * @constructor
 */
fjs.fdp.EntryModel = function(obj) {
    this.xef001id = null;
    this.xef001iver = null;
    this.xpid = null;
    this.fill(obj);
};
/**
 * Fills entry model with new parameters, returns map of changes or null if no changes
 * @param {Object} obj - input fdp changes
 * @returns {Object|null} Map of changes
 */
fjs.fdp.EntryModel.prototype.fill = function(obj) {
    var changes = {};
    var changesCount = 0;
    if(obj) {
        for(var i in obj) {
            if(obj.hasOwnProperty(i)) {
                if(this[i]!=obj[i]) {
                    this[i] = obj[i];
                    changes[i] = this[i];
                    changesCount++;
                }
            }
        }
    }
    if(changesCount)
    return changes;
    else return null;
};