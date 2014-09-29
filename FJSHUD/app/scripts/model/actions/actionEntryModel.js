fjs.core.namespace('fjs.hud');

fjs.hud.ActionEntryModel = function(name, className, title, feedName, dataManager) {
    this.name = name || 'Unknown';
    this.className = className || '';
    this.title = title || 'Unknown Action';
    this.feedName = feedName;
    this.dataManager = dataManager;
};
/**
 * @param {fjs.hud.EntryModel} entryModel
 */
fjs.hud.ActionEntryModel.prototype.makeAction = function(entryModel) {

};
fjs.hud.ActionEntryModel.prototype.pass = function(entryModel) {

};



