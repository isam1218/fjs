/**
 * Created by fnf on 15.01.14.
 */fjs.core.namespace("fjs.ui");

/**
 *
 * @param $scope
 * @param $routeParams
 * @param dataManager
 * @constructor
 * @extends fjs.ui.ConversationWidgetController
 * @extends fjs.ui.GroupsTab
 */
fjs.ui.ConversationWidgetGroupsController = function($scope, $routeParams, dataManager) {
    fjs.ui.ConversationWidgetController.call(this, $scope, $routeParams.contactId, dataManager);
    var context = this;
    var filterGroup = function(){
        return function(group){
            return group.hasContact(context.contactId) && !group.isFavorite();
        };
    };
    fjs.ui.GroupsTab.call(this, $scope, $routeParams, dataManager, filterGroup);
    $scope.contactId = $routeParams.contactId;
    $scope.$on("$destroy", function() {
    });
};

fjs.core.inherits(fjs.ui.ConversationWidgetGroupsController, fjs.ui.ConversationWidgetController)
fjs.core._extends(fjs.ui.ConversationWidgetGroupsController, fjs.ui.GroupsTab);
