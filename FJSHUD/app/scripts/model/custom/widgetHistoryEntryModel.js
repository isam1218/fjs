fjs.core.namespace('fjs.hud');
fjs.hud.WidgetHistoryEntryModel = function(obj, dataManager) {
    fjs.hud.EntryModel.call(this, obj, 'widget_history');
    this.dataManager = dataManager;
    this._associatedEntry = null;
};
fjs.core.inherits(fjs.hud.WidgetHistoryEntryModel, fjs.hud.EntryModel);

fjs.hud.WidgetHistoryEntryModel.prototype.getAssociatedEntry = function() {
    if(this._associatedEntry) return this._associatedEntry;
    if(/contact/.test(this.xpid)) {
        return this._associatedEntry =  this.dataManager.getModel('contacts').getEntryByXpid(this.xpid.replace('contact_', ''));
    }
};
fjs.hud.WidgetHistoryEntryModel.prototype.getEventsCount = function() {
    return this.events ? this.events.length : 0;
};