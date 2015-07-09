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
