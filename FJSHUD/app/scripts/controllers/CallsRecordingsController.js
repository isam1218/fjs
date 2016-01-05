hudweb.controller('CallsRecordingsController', ['$scope', '$rootScope', '$routeParams', 'SettingsService','$http', function($scope, $rootScope, $routeParams, settingsService,$http) {
  // routing
  $scope.tabs = [{upper: $scope.verbage.call_log_tab, lower: 'calllog'}, {upper:$scope.verbage.voicemail_tab, lower: 'voicemails'}, {upper: $scope.verbage.my_recordings_tab, lower: 'recordings'},{upper: $scope.verbage.my_videos_tab, lower: 'videos'}];

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

  var getURL = function(action) {

    var url = 
       action
      + '?callback=JSON_CALLBACK'
      + '&fonalityUserId=' + $rootScope.myPid.split('_')[1]
      + '&serverId=' + $rootScope.meModel.server_id
      + '&serverType=' + ($rootScope.meModel.server.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
      + '&authToken=' + localStorage.authTicket;
    
    return url;
  };
  settingsService.getPermissions().then(function(data) {
       $scope.getVideo = data.showVideoCollab;
       if($scope.getVideo == false){
        $scope.showVideo = false;
        $scope.tabs.splice(3,1);
       }
       else{
        $scope.showVideo = true;
       }
      });
if($routeParams.route == 'videos'){
  settingsService.getSettings().then(function() {
    var date = new Date();
    var month = date.getMonth() + 1;
    var toDate = date.getFullYear() + '-' + month+ '-' + date.getDate();
    var prevMonth = date.getMonth();
    var fromDate =  date.getFullYear() + '-' + prevMonth + '-' + date.getDate();
    $http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/completedMeetingList')+'&email='+$rootScope.meModel.email+'&fromDate='+fromDate+'&toDate='+toDate).success(function(response){
            
            $scope.meetingList = response.meetings;
           
          });
  });
}

}]);

