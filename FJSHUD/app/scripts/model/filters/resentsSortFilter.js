fjs.core.namespace('fjs.hud.filter');

fjs.hud.filter.ResentsSortFilter = function() {
    return function(items) {
        var keys = Object.keys(items);
        var arr = [];
        for(var i=0; i <keys.length; i++) {
            arr.push(items[keys[i]]);
        }
        return arr.sort(function(a, b){
            var a_eventsCount = a.events ? a.events.length : 0;
            var b_eventsCount = b.events ? b.events.length : 0;
            if(a_eventsCount > 0 && b_eventsCount == 0) {
                return -1;
            }
            else if(b_eventsCount > 0 && a_eventsCount == 0) {
                return 1;
            }
            else {
                if(a.timestamp > b.timestamp) {
                    return -1;
                }
                else if(a.timestamp < b.timestamp) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        });
    };
};