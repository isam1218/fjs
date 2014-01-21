/**
 * Created by fnf on 17/01/14.
 */
namespace("fjs.ui");

fjs.ui.ActionMenuController = function($scope) {
    fjs.ui.Controller.call(this, $scope);
    context = this;
    this.model = $scope.currentPopup.model;
    $scope.model =  this.model.items;

    $scope.applyAction = function(itemId){
        context.model.callback(itemId);
    };
};

fjs.ui.ActionMenuController.extend(fjs.ui.Controller);