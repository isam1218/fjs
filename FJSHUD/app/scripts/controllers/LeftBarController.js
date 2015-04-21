hudweb.controller('LeftBarController', ['$scope', 'HttpService','PhoneService', function($scope, myHttpService,phoneService) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];

	$scope.makeCall = function(number){
        phoneService.makeCall(number);
    }

    $scope.$on('locations_synced', function(event,data){
        if(data){
            var me = {};
            for(index in data){
                $scope.locations[data[index].xpid] = data[index];
            }
        }
    });
}]);
