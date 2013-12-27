/**
 * Created by fnf on 27/12/13.
 */
namespace("fjs.ui");

fjs.ui.SortMenuController = function($scope) {
    fjs.ui.Controller.call(this, $scope);

    this.items = [];
    this.items.push({"id": "location", "name": "Location", "selected": false});
    this.items.push({"id": "number", "name": "Room Number", "selected": true});
    this.items.push({"id": "activity", "name": "Activity", "selected": false});
    $scope.items = this.items;
    $scope.applySorting = function(itemId){

    };
};

fjs.ui.SortMenuController.extend(fjs.ui.Controller);