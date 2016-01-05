hudweb.controller('LeftBarController', ['$scope', '$rootScope', 'HttpService', 'PhoneService', 'SettingsService', 'StorageService', '$timeout','$location', function($scope, $rootScope, httpService, phoneService, settingsService ,storageService, $timeout,$location) {

	$scope.query = '';
  $scope.tab;
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];
  $scope.language = 'us';
    
	settingsService.getSettings().then(function(data) {		
    $timeout(function(){
      $scope.language =  $rootScope.language;
      // load last accessed contact panel tab
      $scope.tab = localStorage['LeftBar_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_tabs_of_' + $rootScope.myPid]) : 'all';
    }, 100);
  });

	$rootScope.$on("mycalls_synced",function(event,data){
		
		$scope.calls_data = data;
		for(var i = 0; i<= data.length;i++){

		if($scope.calls_data[i] != undefined) {
		 if($scope.calls_data[i].incoming == false || ($scope.calls_data[i].type != 0 && $scope.calls_data[i].state == 2)){
		  $scope.tab = 'recent';
		  $location.path("settings/callid/"+data[i].xpid);
		   } 
		}
		}
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
}]);
