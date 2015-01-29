fjs.core.namespace("fjs.directive");
fjs.directive.ContextMenuDialog = function($parse) {
    return {
        restrict: 'AE',
        scope: {
            actions: '='
        },
        link: function(scope, element, attrs) {
            scope.$watchCollection('actions', function() {
                React.renderComponent(fjs.hud.react.ContextMenu({scope: scope}), element[0]);
            });
        }
    };
};