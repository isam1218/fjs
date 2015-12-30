hudweb.controller('LeftBarController', ['$scope', '$rootScope', 'HttpService', 'PhoneService', 'SettingsService', 'StorageService', '$timeout', function($scope, $rootScope, httpService, phoneService, settingsService ,storageService, $timeout) {
	$scope.query = '';
  $scope.tab;
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];
  $scope.autoClearTime;
  $scope.autoClearOn;
  $scope.language = 'us';
    
	settingsService.getSettings().then(function(data) {		
    $timeout(function(){
      $scope.language =  $rootScope.language;
      // load last accessed contact panel tab
      $scope.tab = localStorage['LeftBar_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_tabs_of_' + $rootScope.myPid]) : 'all';
    }, 100);
  });
  
    $scope.setTab = function(tab) {
      $scope.tab = tab;
      $scope.query = '';
      // save last accessed contact panel tab
      localStorage['LeftBar_tabs_of_' + $rootScope.myPid] = JSON.stringify(tab);
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
