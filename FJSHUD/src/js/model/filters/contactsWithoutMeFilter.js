namespace('fjs.hud.filter');

fjs.hud.filter.ContactsWithoutMe = function() {
    var myPid;
    return function(items) {
        if(!myPid) myPid = new fjs.hud.DataManager().getModel("me").getMyPid();
        return items.filter(function(element) {
            return element && element.xpid != myPid;
        });
    };
};