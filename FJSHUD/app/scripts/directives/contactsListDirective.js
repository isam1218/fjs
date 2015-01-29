fjs.core.namespace("fjs.directive");
fjs.directive.ContactsList= function($parse, dataManager) {
    return function(scope, element, attrs) {
        var contactsModel = dataManager.getModel("contacts");
        var render = function() {
                React.renderComponent(fjs.hud.react.ContactsList({scope: scope}), element[0]);
        }
        scope.$watch('sortField', render);
        scope.$watch('sortReverce', render);
        scope.$watch('query', render);
        contactsModel.addEventListener("complete", render);
        scope.$on("$destroy", function() {
            contactsModel.removeEventListener("complete", render);
        });
    };
};