fjs.core.namespace('fjs.hud.filter');

fjs.hud.filter.SortCalllogFilter = function() {
    return function(items) {
        var keys = Object.keys(items);
        var arr = [];
        for(var i=0; i <keys.length; i++) {
            arr.push(items[keys[i]]);
        }
        // Just return array.  We'll use orderBy filter to do actual sorting.

        return arr;
    };
};