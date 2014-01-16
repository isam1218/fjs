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

/**
 *
 * @param {string} xpid
 * @param {*} changes
 * @param {string} feedName
 * @protected
 */
fjs.fdp.ContactsProxyModel.prototype.fillChange = function(xpid, changes, feedName) {
    var _changes = this.createChange(xpid);
    _changes.type = 'change';
    switch(feedName) {
        case 'calls':
        case 'calldetails':
            _changes.entry.hasCall = true;
            break;
        case 'fdpImage':
            _changes.entry.hasImage = true;
            _changes.entry.imageVersion = changes['xef001iver'];
            break;
    }
    for(var key in changes) {
        if(changes.hasOwnProperty(key)) {
            if(feedName == 'calls' && key == 'displayName') {
                _changes.entry['callDisplayName'] = changes[key];
            }
            else {
                _changes.entry[key] = changes[key];
            }
        }
    }
};
/**
 * @param xpid
 * @param feedName
 * @protected
 */
fjs.fdp.ContactsProxyModel.prototype.fillDeletion= function(xpid, feedName) {
    var _changes = this.createChange(xpid);
    if(feedName==this.feedName) {
        _changes.type = 'delete';
    }
    else {
        _changes.type = 'change';
        var changes = this.feedFields[feedName];

        switch(feedName) {
            case 'calls':
                _changes.entry.hasCall = false;
                break;
            case 'fdpImage':
                _changes.entry.hasImage = false;
                _changes.entry.imageVersion = null;
                break;
        }

        if(changes) {
            for (var key in changes) {
                if(changes.hasOwnProperty(key)) {
                    _changes.entry[key] = changes[key];
                }
            }
        }
    }
};

fjs.fdp.ContactsProxyModel.prototype.collectFields = function(feedName, entry) {
    if(feedName!=this.feedName && !this.feedFields[feedName]) {
        this.feedFields[feedName] = {};
        for(var key in entry) {
            if(entry.hasOwnProperty(key))
                if(this.fieldPass(feedName, key)) {
                    if(feedName == 'calls' && key == 'displayName') {
                        this.feedFields[feedName]['callDisplayName'] = null;
                    }
                    else {
                        this.feedFields[feedName][key] = null;
                    }
                }
        }
    }
};