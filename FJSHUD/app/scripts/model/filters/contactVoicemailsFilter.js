fjs.hud.filter.ContactVoicemails = function() {
    return function(items, contactId) {
        var arr = [], keys = Object.keys(items);
        for(var i=0; i<keys.length; i++ ) {
            var item = items[keys[i]];
            if(item.contactId == contactId) {
                arr.push(item);
            }
        }
        return arr;
    };
};