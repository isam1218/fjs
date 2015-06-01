hudweb.controller('CallsRecordingsController', ['$scope', '$rootScope', '$routeParams', '$location', 'SettingsService', 'NtpService', function($scope, $rootScope, $routeParams, $location, settingsService, ntpService) {
	// routing
	$scope.tabs = [{upper: $scope.verbage.call_log_tab, lower: 'calllog'}, {upper:$scope.verbage.voicemail_tab, lower: 'voicemails'}, {upper: $scope.verbage.my_recordings_tab, lower: 'recordings'}];
	

  // var offset = ntpService.fixTime();
  // var adjustedTime = new Date(offset);
  // var regularTime = new Date();

  // console.error('ntp - ', moment(adjustedTime).lang('en').format('hh:mm:ss:SSS a'));
  // console.error('reg - ', moment(regularTime).lang('en').format('hh:mm:ss:SSS a'));
  
  // console.error('fixTime - ', ntpService.fixTime());
  // console.error('ajusted time - ', adjustedTime.valueOf());
  
  // console.error('new Date() - ', new Date());
  // console.error('new Date(milliseconds) - ', new Date(5000));

  $scope.setFromLocalStorage = function(val){
    $scope.globalXpid = val;
    $scope.selected = localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
    $scope.toggleObject = localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
  };

  var getXpidInCR = $rootScope.$watch('myPid', function(newVal){
    if (!$scope.globalXpid){
      $scope.setFromLocalStorage(newVal);
      getXpidInCR();
    } else {
      getXpidInCR();
    }
  });

  $scope.$on('pidAdded', function(event, data){
    $scope.setFromLocalStorage(data.info);
  });

  $scope.selected = localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
  $scope.toggleObject = localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['CallsRecordings_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
  
  $scope.saveCRTab = function(tab, index){
    $scope.selected = $scope.tabs[index].lower;
    $scope.toggleObject = {item: index};
    localStorage['CallsRecordings_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
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