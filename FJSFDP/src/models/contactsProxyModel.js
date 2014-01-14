namespace("fjs.fdp");
/**
 * @param {Array} feeds
 * @constructor
 * @extends fjs.fdp.ProxyModel
 */
fjs.fdp.ContactsProxyModel = function(feeds) {
    fjs.fdp.ProxyModel.call(this, ['contacts', 'contactstatus', 'calls', 'calldetails', 'fdpImage', 'contactpermissions']);
};
fjs.fdp.ContactsProxyModel.extend(fjs.fdp.ProxyModel);
