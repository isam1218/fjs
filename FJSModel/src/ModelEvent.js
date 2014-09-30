/**
 * Model change event object
 * @param {string} eventType
 * @param {string=} xpid
 * @param {fjs.model.EntryModel=} entry
 * @constructor
 */
fjs.model.ModelEvent = function(eventType, xpid, entry) {
    this.eventType = eventType;
    this.xpid = xpid;
    this.entry = entry;
    this.isNew = false;
};
