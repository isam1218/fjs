namespace("fjs.model.filter");
fjs.model.filter.CallLogSort = function() {
    return function(items) {
        return items.sort(function(a,b){
            return b.ended-a.ended;
        });
    };
};