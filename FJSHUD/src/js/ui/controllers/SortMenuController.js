/**
 * Created by fnf on 27/12/13.
 */
namespace("fjs.ui");

fjs.ui.SortMenuController = function($scope) {
    fjs.ui.Controller.call(this, $scope);
    context = this;
    this.model = $scope.currentPopup.model;
    $scope.model =  this.model.items;

    $scope.applySorting = function(itemId){
        context.model.callback(itemId);
};
};

fjs.ui.SortMenuController.extend(fjs.ui.Controller);