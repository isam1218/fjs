fjs.core.namespace("fjs.ui");

fjs.ui.CallsRecordingsController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.model = dataManager.getModel("calllog");
    $scope.calls = $scope.model.items;
    $scope.model.addEventListener('complete', $scope.$safeApply);
    $scope.openedCallId = null;


 //   $scope.query = "";
    $scope.sortField = "displayName";
    $scope.sortReverse = false;

    var sort = function(field) {

    }

    $scope.$watch('sortField', sort);
    $scope.$watch('sortReverse', sort);
//    $scope.$watch('query', sort);


    $scope.sort = function(field) {
        if($scope.sortField!=field) {
            $scope.sortField = field;
            $scope.sortReverse = false;
        }
        else {
            $scope.sortReverse = !$scope.sortReverse;
        }
    };

    var update = function(data) {
        $scope.$safeApply();
    };

    $scope.model.addEventListener('push', update);

};
fjs.core.inherits(fjs.ui.CallsRecordingsController, fjs.ui.Controller)
