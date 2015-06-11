hudweb.controller('LeftBarController', ['$scope', '$rootScope', 'HttpService', 'PhoneService', 'SettingsService', 'StorageService', '$timeout', function($scope, $rootScope, httpService, phoneService, settingsService, storageService, $timeout) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];
    $scope.autoClearTime;
    $scope.autoClearOn;
	
	$scope.setTab = function(tab) {
		$scope.tab = tab;
		$scope.query = '';
	};

	$scope.makeCall = function(number){
        phoneService.makeCall(number);
		
		storageService.saveRecentByPhone(number);
    };

    httpService.getFeed('settings');

    $scope.$on('settings_updated', function(event, data){
        if (data['hudmw_searchautoclear'] == ''){
            autoClearOn = false;
            if (autoClearOn && $scope.query != ''){
                    $scope.autoClearTime = data['hudmw_searchautocleardelay'];
                    $scope.clearSearch($scope.autoClearTime);          
                } else if (autoClearOn){
                    $scope.autoClearTime = data['hudmw_searchautocleardelay'];
                } else if (!autoClearOn){
                    $scope.autoClearTime = undefined;
                }
        }
        else if (data['hudmw_searchautoclear'] == 'true'){
            autoClearOn = true;
            if (autoClearOn && $scope.query != ''){
                $scope.autoClearTime = data['hudmw_searchautocleardelay'];
                $scope.clearSearch($scope.autoClearTime);          
            } else if (autoClearOn){
                $scope.autoClearTime = data['hudmw_searchautocleardelay'];
            } else if (!autoClearOn){
                $scope.autoClearTime = undefined;
            }
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
            for (var i = 0; i < data.length; i++) {
                $scope.locations[data[i].xpid] = data[i];
            }
        }
    });
}]);
