hudweb.controller('LeftBarController', ['$scope', '$rootScope', 'HttpService', 'PhoneService', 'SettingsService', 'StorageService', '$timeout', '$q', 'ContactService', '$location', function($scope, $rootScope, httpService, phoneService, settingsService ,storageService, $timeout, $q, contactService, $location) {
	$scope.query = '';
  $scope.tab;
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];
  $scope.language = 'us';

  $q.all([contactService.getContacts(), settingsService.getSettings()]).then(function(){
    $timeout(function(){
      $scope.language = $rootScope.language;
      $scope.tab = localStorage['LeftBar_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_tabs_of_' + $rootScope.myPid]) : 'all';
    }, 1000);
  });

	$rootScope.$on("mycalls_synced",function(event,data){
		$scope.calls_data = data;
		for(var i = 0; i<= data.length;i++){

  		if($scope.calls_data[i] != undefined) {
  		  if($scope.calls_data[i].type != 0 && ($scope.calls_data[i].incoming == false || $scope.calls_data[i].state == 2) && !$rootScope.secondCall){
          // don't want to reload mewidgetcontroller when placing the 2nd call of a warm transfer, otherwise transfer UI disappears...
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
