hudweb.controller('CallsRecordingsController', ['$scope',  function($scope) {
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

}]);