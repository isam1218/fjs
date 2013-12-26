namespace("fjs.fdp")

/**
 * @param {*} obj
 * @constructor
 * @extends fjs.hud.EntryModel
 */
fjs.hud.ContactEntryModel = function(obj) {

    fjs.hud.EntryModel.call(this, obj);
};
fjs.hud.ContactEntryModel.extend(fjs.hud.EntryModel);

fjs.hud.ContactEntryModel.prototype.isExternal = function() {
    return !this["primaryExtension"];
};
fjs.hud.ContactEntryModel.prototype.pass = function(query) {
    if(!query){
        return false;
    }
    var re = new RegExp('(^|\\s)(' + query + ')(\\S)*(\\s|$)', 'i');
    return re.test(this["primaryExtension"])||re.test(this["displayName"])||re.test(this["firstName"])||re.test(this["lastName"])||re.test(this["phoneMobile"])||re.test(this["phoneMobile"]);
};
fjs.hud.ContactEntryModel.prototype.getAvatarUrl = function(width, height) {
    return fjs.fdp.CONFIG.SERVER.serverURL+"/v1/contact_image?pid="+this.xpid+"&w="+width+"&h="+height;
};



