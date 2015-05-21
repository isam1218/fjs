hudweb.controller('LeftBarController', ['$scope', 'HttpService', 'PhoneService', 'SettingsService', '$timeout', function($scope, httpService, phoneService, settingsService, $timeout) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];
    $scope.autoClearTime;
    $scope.autoClearOn;


	$scope.makeCall = function(number){
        phoneService.makeCall(number);
    };

    httpService.getFeed('settings');

    $scope.$on('settings_updated', function(event, data){
        if (data['hudmw_searchautoclear'] == ''){
           $scope.autoClearOn = false;
        }
        else if (data['hudmw_searchautoclear'] == 'true'){
            $scope.autoClearOn = true;
        }
        if ($scope.autoClearOn && $scope.query != ''){
            $scope.autoClearTime = data['hudmw_searchautocleardelay'];
            $scope.clearSearch($scope.autoClearTime);          
        } else if ($scope.autoClearOn){
            $scope.autoClearTime = data['hudmw_searchautocleardelay'];
        } else if (!$scope.autoClearOn){
            $scope.autoClearTime = undefined;
        }
    });

    var currentTimer = 0;

    $scope.clearSearch = function(autoClearTime){
        if (autoClearTime){
            var timeParsed = parseInt(autoClearTime + '000');
            $timeout.cancel(currentTimer);
            currentTimer = $timeout(function(){
                $scope.query = '';
            }, timeParsed);         
        } else if (!autoClearTime){
            return;
        }
    };

    $scope.makePhoneCall = function(type,$event){
        switch(type){
            case 'dialpad':
                if ($event.keyCode == 13 && !$event.shiftKey) {
                    $scope.makeCall($scope.number);
                    $scope.number = '';
                    $event.preventDefault();
                }
                break;
        }
    };

    $scope.$on('locations_synced', function(event,data){
        if(data){
            var me = {};
            for(index in data){
                $scope.locations[data[index].xpid] = data[index];
            }
        }
    });
}]);
