/**
 * Created by fnf on 27/12/13.
 */fjs.core.namespace("fjs.ui");

fjs.ui.SortMenuController = function($scope) {
    fjs.ui.Controller.call(this, $scope);
    context = this;
    this.model = $scope.currentPopup.model;
    $scope.model =  this.model.items;

    $scope.applySorting = function(itemId){
        context.model.callback(itemId);
};
};

fjs.core.inherits(fjs.ui.SortMenuController, fjs.ui.Controller)