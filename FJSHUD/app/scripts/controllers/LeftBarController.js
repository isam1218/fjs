hudweb.controller('LeftBarController', ['$scope', '$rootScope', 'HttpService', 'PhoneService', 'SettingsService', 'StorageService', function($scope, $rootScope, httpService, phoneService, settingsService ,storageService) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];
    $scope.autoClearTime;
    $scope.autoClearOn;
    $scope.language = 'us';
    
	settingsService.getSettings().then(function(data) {		
		$scope.language =  $rootScope.language;
		$scope.$safeApply();
    });
  
    $scope.setTab = function(tab) {
      $scope.$broadcast('contactTabSet',{
          contactTab: tab
      });
      $scope.tab = tab;
      $scope.query = '';
    };
	
	$scope.makeCall = function(number){
        phoneService.makeCall(number);
		storageService.saveRecentByPhone(number);
		$scope.number = '';
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
