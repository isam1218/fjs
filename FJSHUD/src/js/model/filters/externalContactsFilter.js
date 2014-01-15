namespace('fjs.hud.filter');

fjs.hud.filter.ExternalContacts = function() {
    return function(items) {
        return items.filter(function(element) {
            return !element["primaryExtension"];
        });
    };
};