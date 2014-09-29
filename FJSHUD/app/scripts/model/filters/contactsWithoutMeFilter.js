fjs.core.namespace('fjs.hud.filter');

fjs.hud.filter.ContactsWithoutMe = function() {
    var myPid;
    return function(items) {
        if(!myPid) myPid = new fjs.hud.DataManager().getModel("me").getMyPid();
        var arr = [], keys=Object.keys(items);
        for(var i=0; i<keys.length; i++) {
            var element = items[keys[i]];
            if(element && element.xpid != myPid) {
                arr.push(element);
            }
        }
        return arr;
    };
};