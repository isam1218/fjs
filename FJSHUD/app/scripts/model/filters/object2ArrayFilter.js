fjs.core.namespace('fjs.hud.filter');

fjs.hud.filter.Object2Array = function() {
    return function(items) {
        var arr = [], keys=Object.keys(items);
        for(var i=0; i<keys.length; i++) {
            var element = items[keys[i]];
                arr.push(element);
        }
        return arr;
    };
};