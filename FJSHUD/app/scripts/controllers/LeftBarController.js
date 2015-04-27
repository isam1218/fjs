hudweb.controller('LeftBarController', ['$scope', 'HttpService','PhoneService', function($scope, myHttpService,phoneService) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];

	$scope.makeCall = function(number){
        phoneService.makeCall(number);
    }

    $scope.makePhoneCall = function(type,$event){
        switch(type){
            case 'dialpad':
                if ($event.keyCode == 13 && !$event.shiftKey) {
                    $scope.makeCall($scope.number);
                    $event.preventDefault();
                }
                break;
        }
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
