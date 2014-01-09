namespace('fjs.hud.filter');

fjs.hud.filter.ContactsWithoutMe = function() {
    var myPid;
    return function(items) {
        if(!myPid) myPid = new fjs.hud.FDPDataManager().getModel("me").getMyPid();
        return items.filter(function(element) {
            return element.xpid != myPid;
        });
    };
};