fjs.core.namespace('fjs.hud.filter');

fjs.hud.filter.ChatFilter = function() {
    return function(items, context) {
        var arr = [], keys = Object.keys(items);
        for(var i=0; i<keys.length; i++) {
            var item = items[keys[i]];
            if(item.context == context) {
                arr.push(item);
            }
        }
        arr.sort(function(a,b) {
            if(a.created>b.created) return 1;
            if(a.created<b.created) return -1;
            else return 0;
        })
        return arr;
    };
};