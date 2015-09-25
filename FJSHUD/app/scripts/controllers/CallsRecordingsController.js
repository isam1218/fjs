hudweb.controller('CallsRecordingsController', ['$scope', '$rootScope', '$routeParams', 'SettingsService', function($scope, $rootScope, $routeParams, settingsService) {
	// routing
	$scope.tabs = [{upper: $scope.verbage.call_log_tab, lower: 'calllog'}, {upper:$scope.verbage.voicemail_tab, lower: 'voicemails'}, {upper: $scope.verbage.my_recordings_tab, lower: 'recordings'}];

  // if route is defined (click on specific tab or manaully enter url)...
  if ($routeParams.route){
    $scope.selected = $routeParams.route;
    for(var i = 0, iLen = $scope.tabs.length; i < iLen; i++){
      if($scope.tabs[i].lower == $routeParams.route){
        $scope.toggleObject = {item: i};
        break;
      }
    }
    localStorage['CallsRecordings_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
    localStorage['CallsRecordings_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
  } else {
    // otherwise when route isn't defined --> used LS-saved or default
    $scope.selected = localStorage['CallsRecordings_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['CallsRecordings_tabs_of_' + $rootScope.myPid]) : 'calllog';
    $scope.toggleObject = localStorage['CallsRecordings_toggleObject_of_' + $rootScope.myPid] ? JSON.parse(localStorage['CallsRecordings_toggleObject_of_' + $rootScope.myPid]) : {item: 0};
  }
  
  $scope.saveCRTab = function(tab, index){
    $scope.toggleObject = {item: index};
    localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] = JSON.stringify(tab);
    localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
  };

  $scope.tabFilter = function(){
    return function(tab){
      if (tab.lower == 'recordings'){
        var recordingPerm = settingsService.getPermission('showCallCenter');
        if (recordingPerm)
          return true;
        else
          return false;
      }
      return true;
    };
  }; 

}]);