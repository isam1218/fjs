hudweb.controller('LeftBarController', ['$scope', '$rootScope', 'HttpService', 'PhoneService', 'StorageService', function($scope, $rootScope, httpService, phoneService, storageService) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];
    $scope.autoClearTime;
    $scope.autoClearOn;
    $scope.contentHeight;
    $scope.RecentTabHeight;  
	
	$scope.setTab = function(tab) {
		$scope.tab = tab;
		$scope.query = '';
	};		

	$scope.$on('NotificationsheightChanged', function(event, data){	
		if(data)
		{	
			//all other tabs
			$scope.contentHeight = data;
			$scope.RecentTabHeight = data;				
			//recent tab
			var recentHeaderHeight = $('.Recent .ListLineContent.Header').outerHeight(); 
			$scope.RecentTabHeight += (recentHeaderHeight + 35);			
		}
	});
	
	$scope.makeCall = function(number){
        phoneService.makeCall(number);
		
		storageService.saveRecentByPhone(number);
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
            for (var i = 0, iLen = data.length; i < iLen; i++) {
                $scope.locations[data[i].xpid] = data[i];
            }
        }
    });
}]);
