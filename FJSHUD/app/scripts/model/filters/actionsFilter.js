fjs.core.namespace('fjs.hud.filter');

fjs.hud.filter.Actions = function() {
    return function(items, entry) {
        return items.filter(function(item){
            return item.pass(entry);
        });
    };
};