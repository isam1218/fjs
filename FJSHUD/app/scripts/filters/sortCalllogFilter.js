hudweb.filter('SortCalllog', function() {
    return function(items) {
        var keys = Object.keys(items);
        var arr = [];
        for(var i = 0, iLen = keys.length; i < iLen; i++) {
            arr.push(items[keys[i]]);
        }
        // Just return array.  We'll use orderBy filter to do actual sorting.

        return arr;
    };
});