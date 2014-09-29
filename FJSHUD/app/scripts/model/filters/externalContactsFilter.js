fjs.core.namespace('fjs.hud.filter');

fjs.hud.filter.ExternalContacts = function() {
    return function(items) {
        var arr = [], keys=Object.keys(items);
        for(var i=0; i<keys.length; i++) {
            var element = items[keys[i]];
            if(!element["primaryExtension"]) {
                arr.push(element);
            }
        }
        return arr;
    };
};