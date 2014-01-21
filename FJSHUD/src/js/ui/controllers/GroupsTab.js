/**
 * Created by fnf on 15.01.14.
 */
namespace("fjs.ui");

fjs.ui.GroupsTab = function($scope, $routeParams, dataManager, filterGroupFn) {
    fjs.ui.Controller.call(this, $scope);
    var context = this;
    this.groupsModel = dataManager.getModel("groups");
    this.groupsModel.addListener("complete", $scope.$safeApply);
    $scope.groups = this.groupsModel.order;
    $scope.query = "";
    $scope.filterGroup = filterGroupFn;
    $scope.filterDepartment = function(){
        return function(group){
            return group.isDepartment();
        };
    };
    $scope.filterOther = function(){
        return function(group){
            return !group.isDepartment() && !group.hasMe();
        };
    };

    $scope.filterMeInGroup = function(){
        return function(group){
            return group.hasMe();
        };
    };
    $scope.filterOwner = function(){
        return function(group, ownerId){
            return group.hasContact(ownerId);
        };
    };
    $scope.filterSearch = function(query){
        return function(group){
            return group.pass(query);
        };
    };

    this.doActionNew = function(){
        //TODO: create new dialog
    };

    $scope.callBack = function(voicemail){
        voicemail.actionCallback();
    };
    $scope.select = function(group){
        //TODO: open group
    };
    $scope.$on("$destroy", function() {
        context.groupsModel.removeListener("complete", $scope.$safeApply);
    });


};
fjs.ui.GroupsTab.extend(fjs.ui.Controller);