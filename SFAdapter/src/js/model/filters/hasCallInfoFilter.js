namespace("fjs.model.filter");
fjs.model.filter.HasCallInfoFilter = function() {
    return function(items) {
        return items.filter(function(item){
            return !!item.htCallId;
        });
    };
};