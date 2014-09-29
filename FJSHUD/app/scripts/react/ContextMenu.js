fjs.core.namespace("fjs.hud.react");
fjs.hud.react.ContextMenu = React.createClass({
    displayName: "ContextMenu",
    render: function() {
        var scope = this.props.scope;
        var actions = scope.currentPopup.model.getActions();

        var actionsList = actions.map(function(action, index, array) {
            var clickHandler = scope.$apply.bind(scope,
                action.makeAction.bind(action, scope.currentPopup.model));
            var _selectedIcon = React.DOM.div({className: "SelectedIcon "+action.className});
            var _menuItemText = React.DOM.div({className: "MenuItemText"}, action.title);
            return React.DOM.div({className: "MenuItem", onClick:clickHandler}, _selectedIcon, _menuItemText);
        });
        var wrapper = React.DOM.div({className:"MenuContent"}, actionsList);
        return React.DOM.div({className:"MenuWindow SelectMenuBox ContextMenu", style:{top:scope.currentPopup.position.top, left:scope.currentPopup.position.left}}, wrapper);
    }
});