fjs.core.namespace("fjs.hud");

/**
 * @param {*} obj
 * @constructor
 * @extends fjs.hud.EntryModel
 * @extends fjs.fdp.ConferenceMemberEntryModelBase
 */
fjs.hud.ConferenceMemberEntryModel = function(obj, conferenceMemberFeed) {
    fjs.hud.EntryModel.call(this, obj, 'conferencemembers');
    /**
     *
     * @type {ConferenceMemberFeedModel}
     */
    this.conferenceMemberFeed = conferenceMemberFeed;
    this.contactsModel = this.conferenceMemberFeed.fdp.getModel("contacts");
};
fjs.core.inherits(fjs.hud.ConferenceMemberEntryModel, fjs.hud.EntryModel);
/**
 *
 * @param width {Number}
 * @param height {Number}
 * @returns {String}
 */
fjs.hud.ConferenceMemberEntryModel.prototype.getAvatarUrl = function(width, height) {
    var contact = this.getContact();
    if(contact){
        return contact.getAvatarUrl(width, height);
    }
    return "img/Generic-Avatar-Small.png";
};
/**
 *
 * @returns {ContactEntryModel}
 */
fjs.hud.ConferenceMemberEntryModel.prototype.getContact = function() {
    return  this.contactsModel.getEntryByXpid(this.contactId);
};